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

export async function addOfferToCart(agentId: string, offer: NormalizedFlightOffer) {
  const supabase = await createSupabaseServerClient();

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

  const { error: offerError } = await supabase.from('flight_offers').upsert({
    id: offer.id,
    provider_name: offer.provider,
    provider_offer_id: offer.providerOfferId,
    source: offer.source,
    currency: offer.currency,
    total_amount: offer.totalAmount,
    expires_at: offer.expiresAt ?? null,
    raw_offer: offer,
  });

  if (offerError) throw new Error(offerError.message);

  const { data: item, error: itemError } = await supabase
    .from('cart_items')
    .upsert({ cart_id: cart.id, offer_id: offer.id, quantity: 1 }, { onConflict: 'cart_id,offer_id' })
    .select('id, cart_id, offer_id, quantity')
    .single();

  if (itemError) throw new Error(itemError.message);
  return { cart, item };
}
