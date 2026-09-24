import { createProductionProviderRegistry } from '@/lib/providers/registry';
import type { FlightSearchRequest } from '@/lib/providers/contracts';
import { normalizeProviderOffer } from './domain';

export async function searchProductionFlights(searchId: string, request: FlightSearchRequest) {
  const provider = createProductionProviderRegistry().getProductionProvider();
  const offers = await provider.search(request);
  return offers.map((offer) => normalizeProviderOffer(offer, searchId));
}
