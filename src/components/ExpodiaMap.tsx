'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './expodia-map.css';
import { ensureMapLibreWorker } from '@/lib/map/setupWorker';
import { getDefaultMapStyle } from '@/lib/map/provider';
import type { MapAirport } from '@/lib/map/contracts';

type Props = {
  className?: string;
  height?: number;
};

/**
 * Provider-independent world map (MapLibre + OpenFreeMap by default).
 * Replaces AppleAirportMap — no Apple MapKit token required.
 *
 * Airport markers are loaded from /api/airports when available.
 * No fabricated coordinates: if the API fails, the basemap still renders.
 */
export default function ExpodiaMap({ className = '', height = 430 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [status, setStatus] = useState('Loading map…');

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!hostRef.current) return;

      try {
        ensureMapLibreWorker();
        const style = getDefaultMapStyle();

        const map = new maplibregl.Map({
          container: hostRef.current,
          style: style.styleUrl,
          center: [10, 25],
          zoom: 1.2,
          attributionControl: { compact: true },
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        mapRef.current = map;

        map.on('load', async () => {
          if (cancelled) return;
          setStatus('Map ready');

          try {
            const response = await fetch('/api/airports', { cache: 'no-store' });
            if (!response.ok) {
              setStatus('Basemap ready · airport data unavailable');
              return;
            }

            const airports: MapAirport[] = await response.json();
            if (cancelled || !Array.isArray(airports)) return;

            const maxMarkers = 400;
            const sample =
              airports.length > maxMarkers
                ? airports.filter((_, i) => i % Math.ceil(airports.length / maxMarkers) === 0)
                : airports;

            for (const airport of sample) {
              if (
                typeof airport.lat !== 'number' ||
                typeof airport.lon !== 'number' ||
                Number.isNaN(airport.lat) ||
                Number.isNaN(airport.lon)
              ) {
                continue;
              }

              const el = document.createElement('div');
              el.className = 'expodiaMapMarker';
              el.title = `${airport.name} (${airport.iata})`;

              const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([airport.lon, airport.lat])
                .setPopup(
                  new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
                    `<strong>${escapeHtml(airport.name)}</strong><br/>` +
                      `${escapeHtml(airport.iata)} · ${escapeHtml(airport.city)}, ${escapeHtml(airport.country)}`,
                  ),
                )
                .addTo(map);

              markersRef.current.push(marker);
            }

            if (!cancelled) {
              setStatus(
                airports.length === sample.length
                  ? `${airports.length.toLocaleString()} airports`
                  : `${sample.length.toLocaleString()} of ${airports.length.toLocaleString()} airports`,
              );
            }
          } catch {
            if (!cancelled) setStatus('Basemap ready · airport data unavailable');
          }
        });

        map.on('error', () => {
          if (!cancelled) setStatus('Map tiles temporarily unavailable.');
        });
      } catch {
        if (!cancelled) setStatus('Map is temporarily unavailable.');
      }
    }

    boot();

    return () => {
      cancelled = true;
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`expodiaMap ${className}`}
      style={{ height }}
      aria-label="World map showing airports"
    >
      <div ref={hostRef} className="expodiaMapCanvas" />
      <div className="expodiaMapStatus">{status}</div>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
