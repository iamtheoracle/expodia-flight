export type TrackingVisibility = 'PUBLIC_REFERENCE' | 'AUTHORIZED' | 'PRIVATE';

export type JourneyState =
  | 'SCHEDULED'
  | 'CHECK_IN'
  | 'BOARDING'
  | 'DEPARTED'
  | 'IN_FLIGHT'
  | 'ARRIVING'
  | 'ARRIVED'
  | 'DELAYED'
  | 'CANCELLED'
  | 'DIVERTED'
  | 'COMPLETED'
  | 'UNKNOWN';

export interface TrackableJourney {
  id: string;
  bookingId?: string;
  providerName?: string;
  providerBookingReference?: string;
  providerTicketNumber?: string;
  airline?: string;
  flightNumber?: string;
  originIata?: string;
  destinationIata?: string;
  scheduledDepartureAt?: string;
  scheduledArrivalAt?: string;
  actualDepartureAt?: string;
  actualArrivalAt?: string;
  state: JourneyState;
  lastVerifiedAt?: string;
  source?: string;
}

export interface TrackingObservation {
  source: string;
  observedAt: string;
  sourceVersion: string;
  state: JourneyState;
  details: Record<string, unknown>;
  evidence: Record<string, unknown>;
}

export interface TrackingDisplayModel {
  identity: {
    airline?: string;
    flightNumber?: string;
    route?: string;
    providerName?: string;
    bookingReference?: string;
    ticketNumber?: string;
  };
  status: {
    state: JourneyState;
    label: string;
    lastVerifiedAt?: string;
  };
  timeline: Array<{
    state: JourneyState;
    time?: string;
    completed: boolean;
    current: boolean;
  }>;
  verifiedDetails: Record<string, unknown>;
  source: string;
}

export function buildTrackingDisplay(journey: TrackableJourney): TrackingDisplayModel {
  const timeline: JourneyState[] = ['SCHEDULED', 'CHECK_IN', 'BOARDING', 'DEPARTED', 'IN_FLIGHT', 'ARRIVING', 'ARRIVED'];
  const currentIndex = timeline.indexOf(journey.state);
  return {
    identity: {
      airline: journey.airline,
      flightNumber: journey.flightNumber,
      route: journey.originIata && journey.destinationIata ? `${journey.originIata} → ${journey.destinationIata}` : undefined,
      providerName: journey.providerName,
      bookingReference: journey.providerBookingReference,
      ticketNumber: journey.providerTicketNumber,
    },
    status: {
      state: journey.state,
      label: journey.state.replaceAll('_', ' '),
      lastVerifiedAt: journey.lastVerifiedAt,
    },
    timeline: timeline.map((state, index) => ({
      state,
      time: state === 'DEPARTED' ? journey.actualDepartureAt : state === 'ARRIVED' ? journey.actualArrivalAt : undefined,
      completed: currentIndex >= 0 && index < currentIndex,
      current: state === journey.state,
    })),
    verifiedDetails: {
      scheduledDepartureAt: journey.scheduledDepartureAt,
      scheduledArrivalAt: journey.scheduledArrivalAt,
      actualDepartureAt: journey.actualDepartureAt,
      actualArrivalAt: journey.actualArrivalAt,
    },
    source: journey.source ?? 'UNKNOWN',
  };
}

export function shouldNotifyTrackingChange(previous: TrackingObservation | undefined, current: TrackingObservation): boolean {
  if (!previous) return true;
  return previous.sourceVersion !== current.sourceVersion || previous.state !== current.state;
}
