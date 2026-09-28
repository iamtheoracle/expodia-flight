import type { TravelProductKind } from './travel-provider';

export type ScanPayloadKind = 'TICKET' | 'BOOKING' | 'DOCUMENT' | 'TRACKING_REFERENCE' | 'PLAN';

export interface ScanPayload {
  version: 1;
  kind: ScanPayloadKind;
  productKind?: TravelProductKind;
  issuer: string;
  reference: string;
  ticketNumber?: string;
  bookingReference?: string;
  documentNumber?: string;
  serialNumber?: string;
  expodiaReference?: string;
  trackingReference?: string;
  planReference?: string;
  issuedAt?: string;
  expiresAt?: string;
  signature: string;
}

export interface ScanResolution {
  kind: ScanPayloadKind;
  verified: boolean;
  displayMode: 'LOCAL_PAYLOAD' | 'APP_RESOLUTION' | 'CONTROLLED_WEB_RESOLUTION';
  data: Record<string, unknown>;
}

export function resolveScanPayload(payload: ScanPayload): ScanResolution {
  return {
    kind: payload.kind,
    verified: Boolean(payload.signature && payload.reference),
    displayMode: 'LOCAL_PAYLOAD',
    data: {
      productKind: payload.productKind,
      issuer: payload.issuer,
      reference: payload.reference,
      ticketNumber: payload.ticketNumber,
      bookingReference: payload.bookingReference,
      documentNumber: payload.documentNumber,
      serialNumber: payload.serialNumber,
      expodiaReference: payload.expodiaReference,
      trackingReference: payload.trackingReference,
      planReference: payload.planReference,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
    },
  };
}

export function buildScanLookupKeys(payload: ScanPayload): string[] {
  return [...new Set([
    payload.expodiaReference,
    payload.trackingReference,
    payload.planReference,
    payload.reference,
    payload.bookingReference,
    payload.ticketNumber,
    payload.documentNumber,
    payload.serialNumber,
  ].filter((value): value is string => Boolean(value)))];
}

export function buildControlledResolutionPath(expodiaReference: string): string {
  return '/verify/' + encodeURIComponent(expodiaReference);
}
