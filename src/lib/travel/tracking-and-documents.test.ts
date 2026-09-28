import { buildTrackingDisplay, shouldNotifyTrackingChange, type TrackableJourney, type TrackingObservation } from './tracking';
import { chooseDocumentMode, DOCUMENT_DESIGN_RULES } from './document-workflow';
import { resolveScanPayload } from './scan-payload';

const journey: TrackableJourney = {
  id: 'journey-1',
  airline: 'Example Airline',
  flightNumber: 'EA123',
  originIata: 'LOS',
  destinationIata: 'LHR',
  state: 'ARRIVED',
  actualArrivalAt: '2026-09-27T05:28:00Z',
  providerTicketNumber: 'REAL-PROVIDER-TICKET',
  providerBookingReference: 'REAL-PNR',
  source: 'provider-status',
};

const observation: TrackingObservation = {
  source: 'provider-status',
  observedAt: '2026-09-27T05:34:00Z',
  sourceVersion: 'v2',
  state: 'ARRIVED',
  details: {},
  evidence: {},
};

describe('tracking and document workflow contracts', () => {
  it('builds a public journey display without requiring passenger location', () => {
    const display = buildTrackingDisplay(journey);
    expect(display.identity.ticketNumber).toBe('REAL-PROVIDER-TICKET');
    expect(display.status.state).toBe('ARRIVED');
    expect(display.timeline.find((item) => item.state === 'ARRIVED')?.current).toBe(true);
  });

  it('only notifies when the verified state/version changes', () => {
    expect(shouldNotifyTrackingChange(undefined, observation)).toBe(true);
    expect(shouldNotifyTrackingChange(observation, observation)).toBe(false);
    expect(shouldNotifyTrackingChange({ ...observation, sourceVersion: 'v1' }, observation)).toBe(true);
  });

  it('preserves provider documents instead of rendering a fake provider document', () => {
    expect(chooseDocumentMode({ kind: 'E_TICKET', issuerType: 'AIRLINE', issuerName: 'Example Airline', version: 1 }))
      .toBe('PRESERVE_ORIGINAL');
    expect(chooseDocumentMode({ kind: 'EXPODIA_RECEIPT', issuerType: 'EXPODIA', issuerName: 'Expodia', version: 1 }))
      .toBe('RENDER_TEMPLATE');
    expect(DOCUMENT_DESIGN_RULES.neverInventProviderTicketNumber).toBe(true);
  });

  it('can resolve a signed scan payload locally without forcing a website redirect', () => {
    const result = resolveScanPayload({
      version: 1,
      kind: 'TRACKING_REFERENCE',
      issuer: 'Expodia',
      reference: 'EXP-TRACK-123',
      expodiaReference: 'EXP-TRACK-123',
      signature: 'verified-signature',
    });
    expect(result.verified).toBe(true);
    expect(result.displayMode).toBe('LOCAL_PAYLOAD');
  });
});
