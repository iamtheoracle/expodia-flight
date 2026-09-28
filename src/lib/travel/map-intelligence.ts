export type MapLayer =
  | 'airports'
  | 'journeys'
  | 'disruptions'
  | 'weather'
  | 'destinations'
  | 'services';

export type MapStatus = 'verified' | 'observed' | 'unknown';

export type MapAirport = {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  status?: MapStatus;
  disruptionLevel?: 'none' | 'minor' | 'moderate' | 'severe';
  delayMinutes?: number;
  alerts?: string[];
  lastVerifiedAt?: string;
};

export type MapJourney = {
  id: string;
  origin: { iata: string; lat: number; lon: number; label: string };
  destination: { iata: string; lat: number; lon: number; label: string };
  flightNumber?: string;
  state?: string;
  status?: MapStatus;
  observedAt?: string;
};

export type MapInsight = {
  title: string;
  summary: string;
  source?: string;
  observedAt?: string;
  status: MapStatus;
};

export type MapViewport = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type ExpodiaMapState = {
  layers: MapLayer[];
  selectedAirport?: MapAirport;
  selectedJourney?: MapJourney;
  insights: MapInsight[];
  viewport: MapViewport;
};

export const DEFAULT_MAP_LAYERS: MapLayer[] = [
  'airports',
  'journeys',
  'disruptions',
  'weather',
  'destinations',
  'services',
];

export function buildMapInsight(title: string, summary: string, status: MapStatus, source?: string, observedAt?: string): MapInsight {
  return { title, summary, status, source, observedAt };
}

export function canRenderOperationalClaim(status: MapStatus): boolean {
  return status === 'verified' || status === 'observed';
}

export function describeMapPurpose(): string {
  return 'A geographic operating surface for verified travel intelligence, journeys, airport conditions, routes, destinations and nearby services.';
}
