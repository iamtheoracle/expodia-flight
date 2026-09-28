'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MapAirport, MapJourney, MapLayer } from '@/lib/travel/map-intelligence';
import { DEFAULT_MAP_LAYERS } from '@/lib/travel/map-intelligence';

declare global { interface Window { mapkit?: any; } }

type Props = { className?: string; height?: number; journeys?: MapJourney[]; airports?: MapAirport[]; initialLayer?: MapLayer; showControls?: boolean; };

const layerLabels: Record<MapLayer, string> = { airports: 'Airports', journeys: 'Journeys', disruptions: 'Disruptions', weather: 'Weather', destinations: 'Destinations', services: 'Services' };

export default function ExpodiaIntelligenceMap({ className = '', height = 520, journeys = [], airports: suppliedAirports, initialLayer = 'airports', showControls = true }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [airports, setAirports] = useState<MapAirport[]>(suppliedAirports ?? []);
  const [activeLayer, setActiveLayer] = useState<MapLayer>(initialLayer);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MapAirport | null>(null);
  const [status, setStatus] = useState('Preparing intelligence map…');

  const filteredAirports = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return airports;
    return airports.filter((airport) => [airport.iata, airport.name, airport.city, airport.country].some((value) => value.toLowerCase().includes(query)));
  }, [airports, search]);

  useEffect(() => {
    if (suppliedAirports) return;
    let cancelled = false;
    fetch('/api/airports', { cache: 'no-store' })
      .then(async (response) => { if (!response.ok) throw new Error('Airport reference data unavailable'); return response.json() as Promise<MapAirport[]>; })
      .then((data) => { if (!cancelled) { setAirports(data); setStatus(data.length.toLocaleString() + ' airport references loaded'); } })
      .catch(() => { if (!cancelled) setStatus('Airport reference data is unavailable.'); });
    return () => { cancelled = true; };
  }, [suppliedAirports]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const token = process.env.NEXT_PUBLIC_APPLE_MAPKIT_TOKEN;
        if (!token) { setStatus('Map authorization is not configured yet.'); return; }
        if (!window.mapkit) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector('script[data-expodia-mapkit]');
            if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('MapKit failed to load')), { once: true }); return; }
            const script = document.createElement('script'); script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js'; script.async = true; script.dataset.expodiaMapkit = 'true'; script.onload = () => resolve(); script.onerror = () => reject(new Error('MapKit failed to load')); document.head.appendChild(script);
          });
        }
        if (cancelled || !hostRef.current || !window.mapkit) return;
        window.mapkit.init({ authorizationCallback: (done: (token: string) => void) => done(token) });
        const mapkit = window.mapkit;
        const map = new mapkit.Map(hostRef.current, { mapType: mapkit.Map.MapTypes.Standard, showsCompass: mapkit.FeatureVisibility.Visible, showsMapTypeControl: false, showsZoomControl: true, showsUserLocationControl: false, isRotationEnabled: false });
        map.region = new mapkit.CoordinateRegion(new mapkit.Coordinate(25, 10), new mapkit.CoordinateSpan(150, 320));
        mapRef.current = map;
        if (!cancelled) setStatus('Live map surface ready');
      } catch { if (!cancelled) setStatus('Map is temporarily unavailable.'); }
    }
    boot();
    return () => { cancelled = true; overlaysRef.current = []; if (mapRef.current) mapRef.current.destroy(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current; const mapkit = window.mapkit;
    if (!map || !mapkit || !airports.length) return;
    map.removeAnnotations(map.annotations);
    const visible = filteredAirports.slice(0, 1200);
    const annotations = visible.map((airport) => {
      const annotation = new mapkit.MarkerAnnotation(new mapkit.Coordinate(airport.lat, airport.lon), { title: airport.name, subtitle: airport.iata + ' · ' + airport.city + ', ' + airport.country });
      annotation.data = airport;
      annotation.addEventListener?.('select', () => setSelected(airport));
      return annotation;
    });
    map.addAnnotations(annotations);
    const routeOverlays = journeys.flatMap((journey) => {
      const coordinates = [new mapkit.Coordinate(journey.origin.lat, journey.origin.lon), new mapkit.Coordinate(journey.destination.lat, journey.destination.lon)];
      return [new mapkit.PolylineOverlay(coordinates, { style: new mapkit.Style({ lineWidth: 2, strokeColor: '#17233c', lineCap: 'round' }) })];
    });
    if (activeLayer === 'journeys' && routeOverlays.length) { map.addOverlays(routeOverlays); overlaysRef.current = routeOverlays; } else { overlaysRef.current = []; }
    return () => { if (overlaysRef.current.length) map.removeOverlays(overlaysRef.current); };
  }, [airports, filteredAirports, journeys, activeLayer]);

  function focusAirport(airport: MapAirport) {
    const map = mapRef.current; const mapkit = window.mapkit; if (!map || !mapkit) return;
    setSelected(airport); map.region = new mapkit.CoordinateRegion(new mapkit.Coordinate(airport.lat, airport.lon), new mapkit.CoordinateSpan(8, 8));
  }

  return (
    <section className={'expodiaIntelligenceMap ' + className} style={{ height }} aria-label="Expodia geographic intelligence map">
      <div ref={hostRef} className="expodiaIntelligenceMapCanvas" />
      {showControls && <div className="expodiaMapControls">
        <div className="expodiaMapSearch">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search airport, city, country or IATA" aria-label="Search the map" />
          {search && <div className="expodiaMapSearchResults">{filteredAirports.slice(0, 6).map((airport) => <button key={airport.iata} type="button" onClick={() => focusAirport(airport)}><strong>{airport.iata}</strong><span>{airport.name} · {airport.city}</span></button>)}</div>}
        </div>
        <div className="expodiaMapLayers" aria-label="Map intelligence layers">{DEFAULT_MAP_LAYERS.map((layer) => <button key={layer} type="button" className={activeLayer === layer ? 'active' : ''} onClick={() => setActiveLayer(layer)}>{layerLabels[layer]}</button>)}</div>
      </div>}
      <div className="expodiaMapStatus"><span className="expodiaMapPulse" />{status}</div>
      {selected && <aside className="expodiaMapInspector"><button type="button" className="expodiaMapClose" onClick={() => setSelected(null)} aria-label="Close airport details">×</button><div className="publicEyebrow">AIRPORT INTELLIGENCE</div><h2>{selected.iata}</h2><strong>{selected.name}</strong><span>{selected.city}, {selected.country}</span>{selected.disruptionLevel && <div className="expodiaMapMetric"><small>Operational condition</small><b>{selected.disruptionLevel}</b></div>}{selected.delayMinutes !== undefined && <div className="expodiaMapMetric"><small>Verified delay</small><b>{selected.delayMinutes} min</b></div>}{selected.alerts?.length ? <div className="expodiaMapAlerts">{selected.alerts.map((alert) => <span key={alert}>{alert}</span>)}</div> : <p>No operational alert has been attached to this airport in the current dataset.</p>}{selected.lastVerifiedAt && <small>Verified {new Date(selected.lastVerifiedAt).toLocaleString()}</small>}</aside>}
    </section>
  );
}