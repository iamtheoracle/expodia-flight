import { ProviderNotConfiguredError } from './errors';
import type { FlightProvider } from './contracts';
import { DuffelFlightProvider } from './duffel';

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
  const providerName = (process.env.FLIGHT_PROVIDER_NAME ?? '').trim().toLowerCase();

  if (providerName === 'duffel' || process.env.DUFFEL_API_KEY) {
    return new ProviderRegistry([new DuffelFlightProvider()]);
  }

  return new ProviderRegistry([]);
}
