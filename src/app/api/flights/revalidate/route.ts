import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProductionProviderRegistry } from '@/lib/providers/registry';
import { ProviderNotConfiguredError } from '@/lib/providers/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({ offerId: z.string().trim().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'INVALID_REVALIDATION_REQUEST', message: 'A valid offer ID is required.' } }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } }, { status: 401 });
  }

  const { data: offer, error } = await supabase
    .from('flight_offers')
    .select('id, provider_name, provider_offer_id, currency, total_amount, source, expires_at')
    .eq('id', parsed.data.offerId)
    .single();

  if (error || !offer) {
    return NextResponse.json({ error: { code: 'OFFER_NOT_FOUND', message: 'The selected offer is not available to this agent.' } }, { status: 404 });
  }

  try {
    const provider = createProductionProviderRegistry().getProductionProvider();
    const result = await provider.revalidate(offer.provider_offer_id);

    return NextResponse.json({
      offerId: offer.id,
      source: 'PRODUCTION',
      result,
      previous: { currency: offer.currency, totalAmount: offer.total_amount },
      changed: result.changed,
    });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ error: { code: error.code, message: 'Production fare revalidation is unavailable because no approved provider is configured.' } }, { status: 503 });
    }
    return NextResponse.json({ error: { code: 'FLIGHT_REVALIDATION_FAILED', message: 'The connected provider could not revalidate the offer.' } }, { status: 502 });
  }
}
