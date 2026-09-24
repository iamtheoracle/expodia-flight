import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProductionProviderRegistry } from '@/lib/providers/registry';
import { ProviderNotConfiguredError } from '@/lib/providers/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { normalizeProviderOffer } from '@/lib/flights/domain';

const searchSchema = z.object({
  originIata: z.string().trim().regex(/^[A-Za-z]{3}$/).transform((value) => value.toUpperCase()),
  destinationIata: z.string().trim().regex(/^[A-Za-z]{3}$/).transform((value) => value.toUpperCase()),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tripType: z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY']),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8),
  infants: z.number().int().min(0).max(4),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
});

export async function POST(request: Request) {
  const parsed = searchSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'INVALID_SEARCH_REQUEST', message: 'Search parameters are invalid.', details: parsed.error.flatten() } }, { status: 400 });
  }

  if (parsed.data.tripType === 'ROUND_TRIP' && !parsed.data.returnDate) {
    return NextResponse.json({ error: { code: 'RETURN_DATE_REQUIRED', message: 'A return date is required for round-trip searches.' } }, { status: 400 });
  }

  if (parsed.data.originIata === parsed.data.destinationIata) {
    return NextResponse.json({ error: { code: 'INVALID_ROUTE', message: 'Origin and destination must be different.' } }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } }, { status: 401 });
  }

  const { error: agentError } = await supabase
    .from('agents')
    .upsert({ id: user.id, email: user.email ?? '', display_name: user.email?.split('@')[0] ?? 'Expodia Agent' }, { onConflict: 'id' });

  if (agentError) {
    return NextResponse.json({ error: { code: 'AGENT_PROFILE_ERROR', message: 'The authenticated agent profile could not be initialized.' } }, { status: 500 });
  }

  const { data: search, error: searchError } = await supabase
    .from('flight_searches')
    .insert({
      agent_id: user.id,
      origin_iata: parsed.data.originIata,
      destination_iata: parsed.data.destinationIata,
      departure_date: parsed.data.departureDate,
      return_date: parsed.data.returnDate ?? null,
      trip_type: parsed.data.tripType,
      adults: parsed.data.adults,
      children: parsed.data.children,
      infants: parsed.data.infants,
      cabin: parsed.data.cabin,
    })
    .select('id')
    .single();

  if (searchError || !search) {
    return NextResponse.json({ error: { code: 'SEARCH_RECORD_ERROR', message: 'The search could not be recorded.' } }, { status: 500 });
  }

  const startedAt = new Date().toISOString();

  try {
    const provider = createProductionProviderRegistry().getProductionProvider();
    const providerOffers = await provider.search(parsed.data);
    const offers = providerOffers.map((offer) => normalizeProviderOffer(offer, search.id));

    if (offers.length > 0) {
      const { error: offerError } = await supabase.from('flight_offers').upsert(
        offers.map((offer) => ({
          id: offer.id,
          search_id: search.id,
          provider_name: offer.provider,
          provider_offer_id: offer.providerOfferId,
          source: offer.source,
          currency: offer.currency,
          total_amount: offer.totalAmount,
          expires_at: offer.expiresAt ?? null,
          raw_offer: offer,
        })),
        { onConflict: 'id' },
      );

      if (offerError) throw new Error('Flight offers could not be stored.');
    }

    await supabase.from('agent_runs').insert({
      agent_id: user.id,
      search_id: search.id,
      agent_name: 'Discovery Agent',
      action: 'SEARCH_FLIGHTS',
      status: 'SUCCEEDED',
      input_metadata: parsed.data,
      output_metadata: { offerCount: offers.length },
      created_at: startedAt,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({ searchId: search.id, source: 'PRODUCTION', offers, count: offers.length, searchedAt: new Date().toISOString() });
  } catch (error) {
    const isNotConfigured = error instanceof ProviderNotConfiguredError;

    await supabase.from('agent_runs').insert({
      agent_id: user.id,
      search_id: search.id,
      agent_name: 'Discovery Agent',
      action: 'SEARCH_FLIGHTS',
      status: isNotConfigured ? 'REQUIRES_REVIEW' : 'FAILED',
      input_metadata: parsed.data,
      output_metadata: { code: isNotConfigured ? error.code : 'FLIGHT_SEARCH_FAILED' },
      created_at: startedAt,
      completed_at: new Date().toISOString(),
    });

    if (isNotConfigured) {
      return NextResponse.json({ error: { code: error.code, message: 'Production flight search is unavailable because no approved flight provider is configured.', searchId: search.id } }, { status: 503 });
    }

    return NextResponse.json({ error: { code: 'FLIGHT_SEARCH_FAILED', message: 'The connected flight provider could not complete the search.', searchId: search.id } }, { status: 502 });
  }
}
