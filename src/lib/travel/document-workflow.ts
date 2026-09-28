export type DocumentKind =
  | 'PROVIDER_ORIGINAL'
  | 'EXPODIA_RECEIPT'
  | 'BOOKING_CONFIRMATION'
  | 'ITINERARY'
  | 'E_TICKET'
  | 'BOARDING_PASS'
  | 'CANCELLATION'
  | 'REFUND_RECEIPT'
  | 'TRIP_BOOKLET'
  | 'OTHER';

export type DocumentIssuerType = 'AIRLINE' | 'PROVIDER' | 'EXPODIA' | 'HUMAN_AGENT_BUSINESS' | 'UNKNOWN';

export interface DocumentIdentity {
  kind: DocumentKind;
  issuerType: DocumentIssuerType;
  issuerName: string;
  providerBookingReference?: string;
  providerTicketNumber?: string;
  expodiaReference?: string;
  version: number;
}

export interface DocumentDistribution {
  passengerEmails: string[];
  agentEmails: string[];
  otherAuthorizedEmails: string[];
}

export interface DocumentTemplate {
  key: string;
  kind: DocumentKind;
  issuerType: DocumentIssuerType;
  version: string;
  pageSize: 'A4' | 'LETTER' | 'PROVIDER_DEFINED';
  brandKey: string;
  rules: {
    preserveIssuerIdentity: boolean;
    preserveProviderFields: boolean;
    allowExpodiaBranding: boolean;
    showExpodiaReference: boolean;
  };
}

export const DOCUMENT_DESIGN_RULES = {
  preserveOriginalProviderDocument: true,
  neverInventProviderTicketNumber: true,
  neverInventBookingReference: true,
  neverRepresentExpodiaReceiptAsAirlineTicket: true,
  preserveProviderBrandingOnProviderOriginal: true,
  useConfiguredTemplatesForExpodiaDocuments: true,
  keepIssuerExplicit: true,
  keepSourceAndVerificationTimestamp: true,
} as const;

export function chooseDocumentMode(identity: DocumentIdentity): 'PRESERVE_ORIGINAL' | 'RENDER_TEMPLATE' {
  return identity.issuerType === 'AIRLINE' || identity.issuerType === 'PROVIDER'
    ? 'PRESERVE_ORIGINAL'
    : 'RENDER_TEMPLATE';
}

export function buildDocumentDistribution(input: DocumentDistribution): string[] {
  return [...new Set([
    ...input.passengerEmails,
    ...input.agentEmails,
    ...input.otherAuthorizedEmails,
  ].filter(Boolean))];
}
