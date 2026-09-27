import type {
  AvailabilityRevalidation,
  FlightProvider,
  FlightSearchRequest,
  ProviderBookingConfirmation,
  ProviderFlightOffer,
  ProviderFlightStatus,
  ProviderSegment,
  ProviderTicketIssuance,
} from '@/lib/providers/contracts';
import type { ProviderCapability, ProviderCapabilitySet } from '@/lib/flights/capabilities';
import { ProviderError } from '@/lib/providers/errors';
import { DuffelClient } from './client';

type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  expires_at?: string;
  slices?: Array<{
    segments?: Array<{
      id: string;
      departing_at: string;
      arriving_at: string;
      duration?: string;
      origin?: { iata_code?: string };
      destination?: { iata_code?: string };
      marketing_carrier?: { iata_code?: string };
      operating_carrier?: { iata_code?: string };
      marketing_carrier_flight_number?: string;
      aircraft?: { iata_code?: string };
    }>;
  }>;
};

type DuffelOfferRequestResponse = { data: { offers?: DuffelOffer[] } };
type DuffelOfferResponse = { data: DuffelOffer };
type DuffelOrderResponse = {
  data: {
    id: string;
    booking_reference?: string;
    documents?: Array<{ type?: string; unique_identifier?: string }>;
  };
};

const cabinMap = {
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premium_economy',
  BUSINESS: 'business',
  FIRST: 'first',
} as const;

function isoDurationMinutes(value?: string): number | undefined {
  if (!value) return undefined;
  const match = /^P(?:(\\d+)D)?(?:T(?:(\\d+)H)?(?:(\\d+)M)?)$/.exec(value);
  if (!match) return undefined;
  return (Number(match[1] ?? 0) * 1440) + (Number(match[2] ?? 0) * 60) + Number(match[3] ?? 0);
}

function toSegment(segment: NonNullable<NonNullable<DuffelOffer['slices']>[number]['segments']>[number]): ProviderSegment {
  return {
    providerFlightId: segment.id,
    carrierCode: segment.marketing_carrier?.iata_code ?? segment.operating_carrier?.iata_code ?? '',
    flightNumber: segment.marketing_carrier_flight_number ?? '',
    originIata: segment.origin?.iata_code ?? '',
    destinationIata: segment.destination?.iata_code ?? '',
    departureLocal: segment.departing_at,
    arrivalLocal: segment.arriving_at,
    durationMinutes: isoDurationMinutes(segment.duration),
    aircraftCode: segment.aircraft?.iata_code,
    stops: 0,
  };
}

function toOffer(offer: DuffelOffer): ProviderFlightOffer {
  const slices = offer.slices ?? [];
  const segments = slices.flatMap((slice) => (slice.segments ?? []).map(toSegment));
  return {
    provider: 'duffel',
    providerOfferId: offer.id,
    currency: offer.total_currency,
    totalAmount: Number(offer.total_amount),
    segments: segments.map((segment, index, all) => ({
      ...segment,
      stops: Math.max(0, all.length - 1),
    })),
    source: 'PRODUCTION',
    expiresAt: offer.expires_at,
  };
}

export class DuffelFlightProvider implements FlightProvider {
  readonly name = 'duffel';
  readonly capabilities: ProviderCapabilitySet = new Set<ProviderCapability>(['SEARCH', 'REVALIDATE', 'BOOK', 'TICKET']);

  constructor(private readonly client = new DuffelClient()) {}

  async search(request: FlightSearchRequest): Promise<ProviderFlightOffer[]> {
    if (request.tripType === 'MULTI_CITY') {
      throw new ProviderError('DUFFEL_MULTI_CITY_REQUIRES_LEGS', 'Multi-city search requires explicit journey legs and is not represented by the current search contract.');
    }

    const slices = [
      {
        origin: request.originIata,
        destination: request.destinationIata,
        departure_date: request.departureDate,
      },
      ...(request.tripType === 'ROUND_TRIP'
        ? [{
            origin: request.destinationIata,
            destination: request.originIata,
            departure_date: request.returnDate!,
          }]
        : []),
    ];

    const passengers = [
      ...Array.from({ length: request.adults }, () => ({ type: 'adult' })),
      ...Array.from({ length: request.children }, () => ({ type: 'child' })),
      ...Array.from({ length: request.infants }, () => ({ type: 'infant' })),
    ];

    const response = await this.client.request<DuffelOfferRequestResponse>('/air/offer_requests?return_offers=true', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          cabin_class: cabinMap[request.cabin],
          slices,
          passengers,
        },
      }),
    });

    return (response.data.offers ?? []).map(toOffer);
  }

  async revalidate(providerOfferId: string, expectedTotalAmount?: number): Promise<AvailabilityRevalidation> {
    const response = await this.client.request<DuffelOfferResponse>(`/air/offers/${encodeURIComponent(providerOfferId)}`);
    const offer = response.data;
    const totalAmount = Number(offer.total_amount);
    return {
      available: true,
      providerOfferId: offer.id,
      currency: offer.total_currency,
      totalAmount,
      changed: expectedTotalAmount !== undefined && expectedTotalAmount !== totalAmount,
      checkedAt: new Date().toISOString(),
    };
  }

  async book(_input: { providerOfferId: string; customerId: string; passengerIds: string[] }): Promise<ProviderBookingConfirmation> {
    throw new ProviderError(
      'DUFFEL_BOOKING_CONTEXT_REQUIRED',
      'Duffel booking is connected, but order creation requires verified passenger identity and an approved payment instruction. Use the booking orchestration service with those server-side records before creating an airline order.',
    );
  }

  async issue(input: { providerBookingId: string; passengerIds: string[] }): Promise<ProviderTicketIssuance[]> {
    const response = await this.client.request<DuffelOrderResponse>(`/air/orders/${encodeURIComponent(input.providerBookingId)}`);
    const documents = response.data.documents ?? [];
    return documents
      .filter((document) => document.type === 'electronic_ticket' && Boolean(document.unique_identifier))
      .map((document) => ({
        issued: true,
        providerTicketId: document.unique_identifier,
        eTicketNumber: document.unique_identifier,
        issuedAt: new Date().toISOString(),
      }));
  }

  async getStatus(_input: {
    providerFlightId: string;
    carrierCode: string;
    flightNumber: string;
    departureDate: string;
    originIata: string;
    destinationIata: string;
  }): Promise<ProviderFlightStatus> {
    throw new ProviderError(
      'DUFFEL_FLIGHT_STATUS_UNAVAILABLE',
      'Duffel is the booking/content provider for Expodia. Live operational flight status must come from the configured flight-operations provider.',
    );
  }
}
