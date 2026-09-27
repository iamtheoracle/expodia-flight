import { describe, expect, it, vi } from 'vitest';
import { DuffelFlightProvider } from './adapter';

describe('DuffelFlightProvider', () => {
  it('maps Duffel offers into Expodia provider-neutral offers', async () => {
    const request = vi.fn().mockResolvedValue({
      data: {
        offers: [{
          id: 'off_live_1',
          total_amount: '120.50',
          total_currency: 'GBP',
          expires_at: '2026-09-27T20:30:00Z',
          slices: [{
            segments: [{
              id: 'seg_1',
              departing_at: '2026-10-01T09:00:00',
              arriving_at: '2026-10-01T10:30:00',
              duration: 'PT1H30M',
              origin: { iata_code: 'LHR' },
              destination: { iata_code: 'CDG' },
              marketing_carrier: { iata_code: 'BA' },
              operating_carrier: { iata_code: 'BA' },
              marketing_carrier_flight_number: 'BA304',
              aircraft: { iata_code: '320' },
            }],
          }],
        }],
      },
    });

    const provider = new DuffelFlightProvider({ request } as never);
    const offers = await provider.search({
      originIata: 'LHR',
      destinationIata: 'CDG',
      departureDate: '2026-10-01',
      tripType: 'ONE_WAY',
      adults: 1,
      children: 0,
      infants: 0,
      cabin: 'ECONOMY',
    });

    expect(request).toHaveBeenCalledWith('/air/offer_requests?return_offers=true', expect.objectContaining({ method: 'POST' }));
    expect(offers[0]).toMatchObject({
      provider: 'duffel',
      providerOfferId: 'off_live_1',
      currency: 'GBP',
      totalAmount: 120.5,
      segments: [{ carrierCode: 'BA', flightNumber: 'BA304', originIata: 'LHR', destinationIata: 'CDG' }],
    });
  });

  it('detects a fare change during revalidation', async () => {
    const request = vi.fn().mockResolvedValue({
      data: { id: 'off_live_2', total_amount: '151.00', total_currency: 'GBP' },
    });
    const provider = new DuffelFlightProvider({ request } as never);

    const result = await provider.revalidate('off_live_2', 150);
    expect(result).toMatchObject({ available: true, changed: true, totalAmount: 151 });
  });
});
