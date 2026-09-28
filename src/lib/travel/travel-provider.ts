export type TravelProductKind = 'FLIGHT' | 'HOTEL' | 'ACCOMMODATION' | 'CAR_RENTAL' | 'ACTIVITY' | 'TRANSFER' | 'OTHER';

export type ProviderAction = 'LEARN_MORE' | 'MANAGE_BOOKING' | 'VIEW_PROVIDER';

export interface TravelIssuer {
  id: string;
  name: string;
  productKind: TravelProductKind;
  role: 'ISSUER' | 'BOOKING_PROVIDER' | 'PARTNER' | 'REFERRAL_PROVIDER';
  websiteUrl?: string;
}

export interface TravelReferenceSet {
  expodiaReference: string;
  trackingReference?: string;
  providerBookingReference?: string;
  providerTicketNumber?: string;
  providerDocumentNumber?: string;
  serialNumber?: string;
}

export interface ProviderDestination {
  label: string;
  url: string;
  action: ProviderAction;
  bookingAllowed: boolean;
  verifiedAt: string;
  source: 'BOOKING_RECORD' | 'PROVIDER_RECORD' | 'APPROVED_PARTNER_CONFIG';
}

export interface TravelRecordIdentity {
  kind: TravelProductKind;
  issuer: TravelIssuer;
  references: TravelReferenceSet;
  providerDestination?: ProviderDestination;
}

export function buildProviderDestination(
  issuer: TravelIssuer,
  destination: Omit<ProviderDestination, 'verifiedAt'>,
  verifiedAt = new Date().toISOString(),
): ProviderDestination {
  return { ...destination, verifiedAt };
}

export function resolveProviderAction(record: TravelRecordIdentity, action: ProviderAction): ProviderDestination | null {
  const destination = record.providerDestination;
  if (!destination) return null;
  if (action === 'MANAGE_BOOKING' && destination.action !== 'MANAGE_BOOKING') return null;
  if (action === 'VIEW_PROVIDER' && destination.action === 'LEARN_MORE') return destination;
  return destination;
}

export function identityLabels(record: TravelRecordIdentity) {
  return {
    issuer: record.issuer.name,
    providerReference: record.references.providerBookingReference,
    providerTicketNumber: record.references.providerTicketNumber,
    expodiaReference: record.references.expodiaReference,
    trackingReference: record.references.trackingReference,
    serialNumber: record.references.serialNumber,
  };
}
