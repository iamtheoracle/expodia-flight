import { describe, expect, it } from 'vitest';
import { canRenderOperationalClaim, DEFAULT_MAP_LAYERS, describeMapPurpose } from './map-intelligence';

describe('map intelligence', () => {
  it('keeps the geographic layer set explicit', () => {
    expect(DEFAULT_MAP_LAYERS).toContain('airports');
    expect(DEFAULT_MAP_LAYERS).toContain('journeys');
    expect(DEFAULT_MAP_LAYERS).toContain('disruptions');
  });

  it('only permits observed or verified operational claims', () => {
    expect(canRenderOperationalClaim('verified')).toBe(true);
    expect(canRenderOperationalClaim('observed')).toBe(true);
    expect(canRenderOperationalClaim('unknown')).toBe(false);
  });

  it('describes the map as an operating surface rather than decoration', () => {
    expect(describeMapPurpose()).toContain('travel intelligence');
  });
});
