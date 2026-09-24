import type { Cabin, FlightSearchRequest, ProviderFlightOffer, ProviderSegment } from '@/lib/providers/contracts';

export type OfferSource = 'PRODUCTION' | 'SANDBOX';

export type NormalizedFlightSegment = ProviderSegment & {
  operatingCarrierCode?: string;
  marketingCarrierCode?: string;
  terminal?: string;
};

export type NormalizedFlightOffer = {
  id: string;
  provider: string;
  providerOfferId: string;
  currency: string;
  totalAmount: number;
  segments: NormalizedFlightSegment[];
  source: OfferSource;
  expiresAt?: string;
};

export type FlightSearch = FlightSearchRequest & {
  searchId: string;
};

export type CartStatus = 'ACTIVE' | 'EXPIRED' | 'CHECKOUT' | 'COMPLETED' | 'ABANDONED';

export type CartItem = {
  id: string;
  cartId: string;
  offerId: string;
  quantity: number;
  offer: NormalizedFlightOffer;
};

export type FlightSearchResponse = {
  searchId: string;
  source: OfferSource;
  offers: NormalizedFlightOffer[];
  count: number;
  searchedAt: string;
};

export function normalizeProviderOffer(offer: ProviderFlightOffer, searchId: string): NormalizedFlightOffer {
  const stableId = `offer_${searchId}_${offer.provider}_${offer.providerOfferId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    id: stableId,
    provider: offer.provider,
    providerOfferId: offer.providerOfferId,
    currency: offer.currency.toUpperCase(),
    totalAmount: Number(offer.totalAmount),
    source: offer.source,
    expiresAt: offer.expiresAt,
    segments: offer.segments.map((segment) => ({ ...segment })),
  };
}

export function formatCabin(cabin: Cabin): string {
  return cabin.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
