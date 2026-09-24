import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { NormalizedFlightOffer } from './domain';

export async function createCartForAgent(agentId: string, currency = 'USD') {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('carts')
    .insert({ agent_id: agentId, status: 'ACTIVE', currency })
    .select('id, agent_id, status, currency, created_at, updated_at')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addOfferToCart(agentId: string, offerId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: storedOffer, error: offerLookupError } = await supabase
    .from('flight_offers')
    .select('id, provider_name, provider_offer_id, source, currency, total_amount, expires_at, raw_offer')
    .eq('id', offerId)
    .single();

  if (offerLookupError || !storedOffer) {
    throw new Error('The selected flight offer is not available to this agent.');
  }

  const rawOffer = storedOffer.raw_offer as unknown as NormalizedFlightOffer;
  const offer: NormalizedFlightOffer = {
    ...rawOffer,
    id: storedOffer.id,
    provider: storedOffer.provider_name,
    providerOfferId: storedOffer.provider_offer_id,
    source: storedOffer.source,
    currency: storedOffer.currency,
    totalAmount: Number(storedOffer.total_amount),
    expiresAt: storedOffer.expires_at ?? undefined,
  };

  const { data: existingCart, error: cartError } = await supabase
    .from('carts')
    .select('id, currency')
    .eq('agent_id', agentId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cartError) throw new Error(cartError.message);

  const cart = existingCart ?? await createCartForAgent(agentId, offer.currency);

  if (cart.currency !== offer.currency) {
    throw new Error('A cart cannot contain offers in multiple currencies.');
  }

  const { data: item, error: itemError } = await supabase
    .from('cart_items')
    .upsert({ cart_id: cart.id, offer_id: offer.id, quantity: 1 }, { onConflict: 'cart_id,offer_id' })
    .select('id, cart_id, offer_id, quantity')
    .single();

  if (itemError) throw new Error(itemError.message);
  return { cart, item };
}
