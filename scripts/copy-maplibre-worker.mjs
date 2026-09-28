/**
 * Copy MapLibre worker + shared chunk into public/ so Next.js (Turbopack/webpack)
 * can load tiles. Both files must sit in the same directory.
 *
 * Run via predev / prebuild in package.json.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

let dist;
try {
  dist = path.join(path.dirname(require.resolve('maplibre-gl/package.json')), 'dist');
} catch {
  console.warn('[copy-maplibre-worker] maplibre-gl is not installed; skip copy.');
  process.exit(0);
}

const dest = path.join(process.cwd(), 'public', 'maplibre');
mkdirSync(dest, { recursive: true });

const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

for (const file of files) {
  const src = path.join(dist, file);
  if (!existsSync(src)) {
    console.warn(`[copy-maplibre-worker] missing ${src}`);
    continue;
  }
  copyFileSync(src, path.join(dest, file));
  console.log(`[copy-maplibre-worker] ${file} → public/maplibre/`);
}
