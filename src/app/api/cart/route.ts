import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { addOfferToCart } from '@/lib/flights/carts';

const schema = z.object({ offerId: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'INVALID_OFFER', message: 'A valid selected offer ID is required.' } }, { status: 400 });
  }

  try {
    const result = await addOfferToCart(user.id, parsed.data.offerId);
    return NextResponse.json({ cart: result.cart, item: result.item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: 'CART_UPDATE_FAILED', message: error instanceof Error ? error.message : 'The flight could not be added to the cart.' } }, { status: 409 });
  }
}
