import { describe, expect, it } from 'vitest';
import {
  buildDiscoveryIdempotencyKey,
  recordObservation,
  shouldProcessObservation,
} from './continuous-work';

describe('continuous discovery work', () => {
  it('does not reprocess an already observed source version', () => {
    const memory = recordObservation(
      {
        workerKey: 'travel_news',
        scope: 'global',
        sourceState: {},
        processedIds: [],
      },
      'source-a',
      'version-1',
      '2026-09-27T20:00:00Z',
    );

    expect(shouldProcessObservation(memory, 'source-a', 'version-1')).toBe(false);
    expect(shouldProcessObservation(memory, 'source-a', 'version-2')).toBe(true);
  });

  it('creates stable idempotency keys from source identity', () => {
    expect(buildDiscoveryIdempotencyKey('travel_news', 'source-a', 'version-1'))
      .toBe('discovery:travel_news:source-a:version-1');
  });
});
