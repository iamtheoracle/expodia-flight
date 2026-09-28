import {
  getApprovedFlightSources,
  type DiscoveredFlightOffer,
  type SourceSearchRequest,
} from './source-registry';

export interface BrowserFlightSearchPort {
  searchSource(
    source: { key: string; name: string; url: string; partnered: boolean },
    request: SourceSearchRequest,
  ): Promise<DiscoveredFlightOffer[]>;
}

export interface FlightDiscoveryResult {
  status: 'READY' | 'PENDING' | 'REQUIRES_REVIEW' | 'UNAVAILABLE';
  offers: DiscoveredFlightOffer[];
  sourcesChecked: string[];
  observedAt: string;
  warnings: string[];
}

export async function discoverFlightsThroughApprovedSources(
  request: SourceSearchRequest,
  browser: BrowserFlightSearchPort,
): Promise<FlightDiscoveryResult> {
  const sources = getApprovedFlightSources();
  const observedAt = new Date().toISOString();

  if (sources.length === 0) {
    return {
      status: 'UNAVAILABLE',
      offers: [],
      sourcesChecked: [],
      observedAt,
      warnings: ['No approved flight inventory sources are configured.'],
    };
  }

  const results = await Promise.all(
    sources.map(async (source) => {
      try {
        return await browser.searchSource(source, request);
      } catch {
        return [];
      }
    }),
  );

  const offers = results.flat();

  return {
    status: offers.length > 0 ? 'READY' : 'PENDING',
    offers,
    sourcesChecked: sources.map((source) => source.key),
    observedAt,
    warnings: offers.length > 0
      ? []
      : ['No flight offers were returned by the approved sources at this observation.'],
  };
}
