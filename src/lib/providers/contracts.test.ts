import { describe, expect, it } from 'vitest';
import type { FlightSearchRequest, ProviderFlightOffer } from './contracts';

describe('provider contracts', () => {
  it('requires provider-owned identity and pricing on offers', () => {
    const offer: ProviderFlightOffer = {
      provider: 'sandbox',
      providerOfferId: 'sandbox-offer-1',
      currency: 'USD',
      totalAmount: 100,
      segments: [],
      source: 'SANDBOX',
    };

    expect(offer.providerOfferId).toBeTruthy();
    expect(offer.currency).toBeTruthy();
    expect(offer.source).toBe('SANDBOX');
  });

  it('models a search request without prescribing a provider API shape', () => {
    const request: FlightSearchRequest = {
      originIata: 'LOS',
      destinationIata: 'LHR',
      departureDate: '2026-10-15',
      tripType: 'ONE_WAY',
      adults: 1,
      children: 0,
      infants: 0,
      cabin: 'ECONOMY',
    };

    expect(request.originIata).toBe('LOS');
  });
});
