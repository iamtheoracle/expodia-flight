export interface TicketTemplateContext {
  providerName: string;
  carrierCode: string;
  documentType: 'ETICKET';
  issuingMarket?: string;
  language?: string;
  currency?: string;
}

export interface TicketTemplateSelection {
  templateId: string;
  reason: string;
}

export interface TicketSegmentSnapshot {
  carrierCode: string;
  flightNumber: string;
  originIata: string;
  destinationIata: string;
  departureLocal: string;
  arrivalLocal: string;
  cabin?: string;
  baggage?: string;
}

export interface TicketDocumentSnapshot {
  ticketId: string;
  bookingId: string;
  passengerId: string;
  passengerName: string;
  providerName: string;
  providerTicketId: string;
  eTicketNumber?: string;
  pnr?: string;
  verificationReference: string;
  currency?: string;
  totalAmount?: number;
  segments: TicketSegmentSnapshot[];
  generatedAt: string;
  documentVersion: number;
}

export interface DocumentArtifact {
  documentId: string;
  filename: string;
  mimeType: 'application/pdf';
  version: number;
  snapshot: TicketDocumentSnapshot;
  bytes: Uint8Array;
}
