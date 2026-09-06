import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProductionProviderRegistry } from '@/lib/providers/registry';
import { ProviderNotConfiguredError } from '@/lib/providers/errors';

const schema = z.object({ providerOfferId: z.string().trim().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_REVALIDATION_REQUEST', message: 'A provider offer ID is required.' } },
      { status: 400 },
    );
  }

  try {
    const provider = createProductionProviderRegistry().getProductionProvider();
    const result = await provider.revalidate(parsed.data.providerOfferId);
    return NextResponse.json({ source: 'PRODUCTION', result });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json(
        { error: { code: error.code, message: 'Production fare revalidation is unavailable because no approved provider is configured.' } },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: { code: 'FLIGHT_REVALIDATION_FAILED', message: 'The connected provider could not revalidate the offer.' } },
      { status: 502 },
    );
  }
}
