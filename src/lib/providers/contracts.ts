export type TripType = 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
export type Cabin = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface FlightSearchRequest {
  originIata: string;
  destinationIata: string;
  departureDate: string;
  returnDate?: string;
  tripType: TripType;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
}

export interface ProviderSegment {
  providerFlightId: string;
  carrierCode: string;
  flightNumber: string;
  originIata: string;
  destinationIata: string;
  departureLocal: string;
  arrivalLocal: string;
  durationMinutes?: number;
  aircraftCode?: string;
  stops: number;
}

export interface ProviderFlightOffer {
  provider: string;
  providerOfferId: string;
  currency: string;
  totalAmount: number;
  segments: ProviderSegment[];
  source: 'PRODUCTION' | 'SANDBOX';
  expiresAt?: string;
}

export interface AvailabilityRevalidation {
  available: boolean;
  providerOfferId: string;
  currency: string;
  totalAmount: number;
  changed: boolean;
  checkedAt: string;
}

export interface ProviderBookingConfirmation {
  confirmed: boolean;
  providerBookingId?: string;
  pnr?: string;
  status: 'CONFIRMED' | 'FAILED' | 'PENDING';
  confirmedAt?: string;
}

export interface ProviderTicketIssuance {
  issued: boolean;
  providerTicketId?: string;
  eTicketNumber?: string;
  issuedAt?: string;
}

export interface ProviderFlightStatus {
  providerFlightId: string;
  status: string;
  observedAt: string;
  source: 'PRODUCTION' | 'SANDBOX';
  gate?: string;
  terminal?: string;
  departureActual?: string;
  arrivalActual?: string;
}

export interface FlightSearchProvider {
  search(request: FlightSearchRequest): Promise<ProviderFlightOffer[]>;
}

export interface AvailabilityProvider {
  revalidate(providerOfferId: string): Promise<AvailabilityRevalidation>;
}

export interface BookingProvider {
  book(input: { providerOfferId: string; customerId: string; passengerIds: string[] }): Promise<ProviderBookingConfirmation>;
}

export interface TicketingProvider {
  issue(input: { providerBookingId: string; passengerIds: string[] }): Promise<ProviderTicketIssuance[]>;
}

export interface FlightStatusProvider {
  getStatus(input: {
    providerFlightId: string;
    carrierCode: string;
    flightNumber: string;
    departureDate: string;
    originIata: string;
    destinationIata: string;
  }): Promise<ProviderFlightStatus>;
}

export interface FlightProvider extends FlightSearchProvider, AvailabilityProvider, BookingProvider, TicketingProvider, FlightStatusProvider {
  readonly name: string;
}
