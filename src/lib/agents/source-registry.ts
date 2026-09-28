export type SourceAccess = 'BROWSER' | 'API' | 'WEBHOOK';
export type SourcePurpose = 'FLIGHT_INVENTORY' | 'TRAVEL_DISCOVERY' | 'NEWS' | 'PARTNER_REFERRAL';

export interface ApprovedSource {
  key: string;
  name: string;
  purpose: SourcePurpose;
  access: SourceAccess;
  url: string;
  enabled: boolean;
  partnered: boolean;
  notes?: string;
}

export interface SourceSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabin?: string;
  currency?: string;
}

export interface DiscoveredFlightOffer {
  sourceKey: string;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  offerReference?: string;
  airline?: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  departureAt?: string;
  arrivalAt?: string;
  durationMinutes?: number;
  stops?: number;
  cabin?: string;
  fareFamily?: string;
  availableSeats?: number;
  totalAmount?: number;
  currency?: string;
  baggage?: string;
  fareRules?: string[];
  sourceEvidence: Record<string, unknown>;
}

export const APPROVED_FLIGHT_SOURCES: ApprovedSource[] = [
  // Populate with real contracted/approved sources. No invented partner URLs.
];

export function getApprovedFlightSources(): readonly ApprovedSource[] {
  return APPROVED_FLIGHT_SOURCES.filter(
    (source) => source.enabled && source.purpose === 'FLIGHT_INVENTORY',
  );
}
