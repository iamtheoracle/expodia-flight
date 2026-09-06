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

export interface TicketDocumentSnapshot {
  ticketId: string;
  bookingId: string;
  passengerId: string;
  providerTicketId: string;
  eTicketNumber?: string;
  verificationReference: string;
  generatedAt: string;
  documentVersion: number;
}

export interface DocumentArtifact {
  documentId: string;
  filename: string;
  mimeType: 'application/pdf';
  version: number;
  snapshot: TicketDocumentSnapshot;
}
