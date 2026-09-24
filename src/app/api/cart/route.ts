import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { addOfferToCart } from '@/lib/flights/carts';
import type { NormalizedFlightOffer } from '@/lib/flights/domain';

const segmentSchema = z.object({
  providerFlightId: z.string(),
  carrierCode: z.string(),
  flightNumber: z.string(),
  originIata: z.string(),
  destinationIata: z.string(),
  departureLocal: z.string(),
  arrivalLocal: z.string(),
  durationMinutes: z.number().int().nonnegative().optional(),
  aircraftCode: z.string().optional(),
  stops: z.number().int().nonnegative(),
  operatingCarrierCode: z.string().optional(),
  marketingCarrierCode: z.string().optional(),
  terminal: z.string().optional(),
});

const offerSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  providerOfferId: z.string().min(1),
  currency: z.string().length(3),
  totalAmount: z.number().finite().nonnegative(),
  source: z.enum(['PRODUCTION', 'SANDBOX']),
  expiresAt: z.string().datetime().optional(),
  segments: z.array(segmentSchema).min(1),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } }, { status: 401 });
  }

  const parsed = offerSchema.safeParse((await request.json().catch(() => null))?.offer);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'INVALID_OFFER', message: 'The selected flight offer is invalid.', details: parsed.error.flatten() } }, { status: 400 });
  }

  try {
    const result = await addOfferToCart(user.id, parsed.data as NormalizedFlightOffer);
    return NextResponse.json({ cart: result.cart, item: result.item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: 'CART_UPDATE_FAILED', message: error instanceof Error ? error.message : 'The flight could not be added to the cart.' } }, { status: 409 });
  }
}
