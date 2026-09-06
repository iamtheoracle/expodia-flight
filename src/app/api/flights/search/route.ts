import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProductionProviderRegistry } from '@/lib/providers/registry';
import { ProviderNotConfiguredError } from '@/lib/providers/errors';

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
    return NextResponse.json(
      { error: { code: 'INVALID_SEARCH_REQUEST', message: 'Search parameters are invalid.', details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  if (parsed.data.tripType === 'ROUND_TRIP' && !parsed.data.returnDate) {
    return NextResponse.json(
      { error: { code: 'RETURN_DATE_REQUIRED', message: 'A return date is required for round-trip searches.' } },
      { status: 400 },
    );
  }

  if (parsed.data.originIata === parsed.data.destinationIata) {
    return NextResponse.json(
      { error: { code: 'INVALID_ROUTE', message: 'Origin and destination must be different.' } },
      { status: 400 },
    );
  }

  try {
    const provider = createProductionProviderRegistry().getProductionProvider();
    const offers = await provider.search(parsed.data);
    return NextResponse.json({ source: 'PRODUCTION', offers });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: 'Production flight search is unavailable because no approved flight-ticket provider is configured.',
          },
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: { code: 'FLIGHT_SEARCH_FAILED', message: 'The connected flight provider could not complete the search.' } },
      { status: 502 },
    );
  }
}
