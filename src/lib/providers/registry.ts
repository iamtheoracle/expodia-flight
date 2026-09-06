import type { FlightProvider } from './contracts';

export class ProviderRegistry {
  constructor(private readonly providers: FlightProvider[]) {}

  getProductionProvider(): FlightProvider {
    const provider = this.providers.find((candidate) => candidate.name !== 'sandbox');
    if (!provider) {
      throw new Error('No production flight provider is configured');
    }
    return provider;
  }

  get(name: string): FlightProvider {
    const provider = this.providers.find((candidate) => candidate.name === name);
    if (!provider) throw new Error(`Flight provider not found: ${name}`);
    return provider;
  }
}
