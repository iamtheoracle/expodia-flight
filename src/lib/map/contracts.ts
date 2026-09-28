/** Provider-independent map contracts for Expodia. */

export type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

export type MapAirport = {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
};

export type MapMarker = {
  id: string;
  longitude: number;
  latitude: number;
  label?: string;
  subtitle?: string;
  kind?: 'airport' | 'route' | 'aircraft' | 'generic';
};

export type MapRoute = {
  id: string;
  coordinates: [number, number][]; // [lng, lat]
};

export type MapStyleConfig = {
  /** MapLibre style URL (vector tiles). */
  styleUrl: string;
  attribution?: string;
};
