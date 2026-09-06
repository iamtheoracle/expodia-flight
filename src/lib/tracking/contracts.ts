export interface FlightTrackingIdentity {
  providerFlightId: string;
  carrierCode: string;
  flightNumber: string;
  departureDate: string;
  originIata: string;
  destinationIata: string;
}

export interface FlightStatusEvent {
  status: string;
  observedAt: string;
  source: 'PRODUCTION' | 'SANDBOX';
  gate?: string;
  terminal?: string;
  departureActual?: string;
  arrivalActual?: string;
}
