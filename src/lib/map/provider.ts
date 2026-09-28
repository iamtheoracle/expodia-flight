import type { MapStyleConfig } from './contracts';

/**
 * Default basemap: OpenFreeMap Liberty — free, no API key, OSM data.
 * Override with NEXT_PUBLIC_MAP_STYLE_URL when switching providers.
 */
export function getDefaultMapStyle(): MapStyleConfig {
  const styleUrl =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() ||
    'https://tiles.openfreemap.org/styles/liberty';

  return {
    styleUrl,
    attribution: '© OpenFreeMap © OpenMapTiles © OpenStreetMap contributors',
  };
}

export function isMapConfigured(): boolean {
  return true;
}
