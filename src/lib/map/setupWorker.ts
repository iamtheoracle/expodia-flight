'use client';

import { setWorkerUrl } from 'maplibre-gl';

let configured = false;

/**
 * Point MapLibre at the worker files copied into public/maplibre/
 * by scripts/copy-maplibre-worker.mjs. Call once on the client before
 * creating any map instance.
 */
export function ensureMapLibreWorker(): void {
  if (typeof window === 'undefined' || configured) return;
  setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
  configured = true;
}
