export type FlightReceiptPassenger = {
  name: string;
  type: string;
  ticketStatus: string;
  ticketNumber?: string | null;
  providerConfirmation?: string | null;
  seat?: string | null;
  baggage?: string | null;
};

export type FlightReceiptSegment = {
  direction: 'OUTBOUND' | 'RETURN' | 'OTHER';
  date: string;
  origin: string;
  destination: string;
  carrier: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration?: string | null;
  stops?: string | null;
  cabin?: string | null;
  fareClass?: string | null;
  terminalDeparture?: string | null;
  terminalArrival?: string | null;
  aircraft?: string | null;
  status?: string | null;
};

export type FlightReceiptData = {
  issuer: string;
  documentTitle: string;
  bookingReference: string;
  providerBookingReference?: string | null;
  bookingStatus: string;
  ticketingStatus: string;
  issueDate: string;
  currency: string;
  passengers: FlightReceiptPassenger[];
  segments: FlightReceiptSegment[];
  totalAmount: string;
  amountPaid: string;
  amountOutstanding: string;
  paymentStatus: string;
  paymentReference?: string | null;
  paymentDate?: string | null;
  customerEmail: string;
  agentName?: string | null;
  agentEmail?: string | null;
  notes?: string[];
};

export const EXPODIA_FLIGHT_RECEIPT_TEMPLATE = {
  id: 'expodia-flight-receipt',
  version: '2.0',
  documentType: 'EXPODIA_FLIGHT_RECEIPT',
  pageSize: 'A4',
  pageFlow: [
    'confirmation',
    'traveler-details',
    'flight-itinerary',
    'fare-and-payment',
    'ticketing',
    'important-information',
    'fare-rules',
    'issuer-and-support',
  ],
  visualRules: {
    palette: 'monochrome',
    decorativeColor: false,
    layout: 'transactional',
    density: 'high',
    roundedCards: false,
    gradients: false,
    illustrations: false,
  },
  languageRules: {
    style: 'plain transactional travel confirmation',
    issuer: 'Expodia Flights',
    externalIssuerImpersonation: false,
    inventedProviderData: false,
  },
} as const;

export function displayDirection(direction: FlightReceiptSegment['direction']) {
  if (direction === 'OUTBOUND') return 'Departure';
  if (direction === 'RETURN') return 'Return';
  return 'Flight';
}
