import { describe, expect, it } from 'vitest';
import { ProviderRegistry } from './registry';

describe('ProviderRegistry', () => {
  it('does not invent a provider when none is configured', () => {
    const registry = new ProviderRegistry([]);
    expect(() => registry.getProductionProvider()).toThrow('No production flight provider is configured');
  });
});
