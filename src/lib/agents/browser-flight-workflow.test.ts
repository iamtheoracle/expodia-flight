import { describe, expect, it } from 'vitest';
import { discoverFlightsThroughApprovedSources } from './browser-flight-workflow';

describe('browser-first flight discovery', () => {
  it('does not invent inventory when no approved sources exist', async () => {
    const result = await discoverFlightsThroughApprovedSources(
      {
        origin: 'LOS',
        destination: 'LHR',
        departureDate: '2026-12-01',
        passengers: { adults: 1 },
      },
      { searchSource: async () => [] },
    );

    expect(result.offers).toEqual([]);
    expect(result.status).toBe('UNAVAILABLE');
  });
});
