import { ProviderNotConfiguredError } from './errors';
import type { FlightProvider } from './contracts';

export class ProviderRegistry {
  constructor(private readonly providers: FlightProvider[]) {}

  getProductionProvider(): FlightProvider {
    const provider = this.providers.find((candidate) => candidate.name !== 'sandbox');
    if (!provider) {
      throw new ProviderNotConfiguredError();
    }
    return provider;
  }

  get(name: string): FlightProvider {
    const provider = this.providers.find((candidate) => candidate.name === name);
    if (!provider) throw new ProviderNotConfiguredError(`Flight provider not found: ${name}`);
    return provider;
  }

  hasProductionProvider(): boolean {
    return this.providers.some((candidate) => candidate.name !== 'sandbox');
  }
}

export function createProductionProviderRegistry(): ProviderRegistry {
  // A provider adapter is deliberately not constructed here until the provider company/API is supplied.
  return new ProviderRegistry([]);
}
