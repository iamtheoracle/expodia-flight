import type { FlightTrackingIdentity, FlightStatusEvent } from './contracts';

export function assertTrackingIdentity(identity: FlightTrackingIdentity): void {
  const values = Object.values(identity);
  if (values.some((value) => !value || !String(value).trim())) {
    throw new Error('Flight tracking requires provider flight identity, carrier, number, date, origin, and destination');
  }
}

export function applyFlightStatusEvent(identity: FlightTrackingIdentity, event: FlightStatusEvent) {
  assertTrackingIdentity(identity);
  if (event.source !== 'PRODUCTION') {
    return { ...event, operational: false };
  }
  return { ...event, operational: true };
}
