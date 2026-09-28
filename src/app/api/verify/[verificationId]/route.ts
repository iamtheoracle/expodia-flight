import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function hashClientAddress(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ verificationId: string }> },
) {
  const { verificationId } = await params;

  if (!/^[A-Za-z0-9_-]{20,128}$/.test(verificationId)) {
    return NextResponse.json(
      { error: { code: 'INVALID_VERIFICATION_REFERENCE', message: 'The verification reference is invalid.' } },
      { status: 400 },
    );
  }

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const clientAddress = forwardedFor || request.headers.get('x-real-ip') || 'unknown';

  try {
    const admin = createSupabaseAdminClient();
    const bucketKey = `verify:${hashClientAddress(clientAddress)}`;
    const { data: allowed, error: rateError } = await admin.rpc('consume_verification_rate_limit', {
      p_bucket_key: bucketKey,
      p_limit: 30,
      p_window_seconds: 60,
    });

    if (rateError) {
      return NextResponse.json(
        { error: { code: 'VERIFICATION_UNAVAILABLE', message: 'Verification is temporarily unavailable.' } },
        { status: 503 },
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many verification attempts. Please try again shortly.' } },
        { status: 429 },
      );
    }

    const { data: verification, error: verificationError } = await admin
      .from('verification_records')
      .select('ticket_id, verification_reference, active')
      .eq('verification_reference', verificationId)
      .eq('active', true)
      .maybeSingle();

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No active travel document matches this verification reference.' } },
        { status: 404 },
      );
    }

    const { data: ticket, error: ticketError } = await admin
      .from('tickets')
      .select('id, booking_id, provider_ticket_id, e_ticket_number, status, issued_at')
      .eq('id', verification.ticket_id)
      .maybeSingle();

    if (ticketError || !ticket || ticket.status !== 'ISSUED') {
      return NextResponse.json(
        { error: { code: 'NOT_VALID', message: 'The linked travel document is not currently issued.' } },
        { status: 404 },
      );
    }

    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select('id, provider_name, provider_booking_id, pnr, status, provider_destination_url, provider_manage_url, provider_destination_source, provider_destination_verified_at')
      .eq('id', ticket.booking_id)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: { code: 'VERIFICATION_UNAVAILABLE', message: 'The authoritative booking record could not be resolved.' } },
        { status: 503 },
      );
    }

    const { data: segments, error: segmentError } = await admin
      .from('flight_segments')
      .select('carrier_code, flight_number, origin_iata, destination_iata, departure_local, arrival_local, terminal')
      .eq('booking_id', booking.id)
      .order('departure_local', { ascending: true });

    if (segmentError) {
      return NextResponse.json(
        { error: { code: 'VERIFICATION_UNAVAILABLE', message: 'The itinerary could not be resolved.' } },
        { status: 503 },
      );
    }

    return NextResponse.json({
      verificationReference: verification.verification_reference,
      status: ticket.status,
      ticket: {
        id: ticket.id,
        providerTicketId: ticket.provider_ticket_id,
        eTicketNumber: ticket.e_ticket_number,
        issuedAt: ticket.issued_at,
      },
      booking: {
        providerName: booking.provider_name,
        providerBookingId: booking.provider_booking_id,
        pnr: booking.pnr,
        status: booking.status,
        providerDestination: booking.provider_destination_url ? {
          url: booking.provider_destination_url,
          action: 'LEARN_MORE',
          source: booking.provider_destination_source,
          verifiedAt: booking.provider_destination_verified_at,
        } : null,
        providerManageDestination: booking.provider_manage_url ? {
          url: booking.provider_manage_url,
          action: 'MANAGE_BOOKING',
          source: booking.provider_destination_source,
          verifiedAt: booking.provider_destination_verified_at,
        } : null,
      },
      itinerary: (segments ?? []).map((segment) => ({
        airline: segment.carrier_code,
        flightNumber: segment.flight_number,
        origin: segment.origin_iata,
        destination: segment.destination_iata,
        departure: segment.departure_local,
        arrival: segment.arrival_local,
        terminal: segment.terminal,
      })),
    }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return NextResponse.json(
      { error: { code: 'VERIFICATION_UNAVAILABLE', message: 'Verification is temporarily unavailable.' } },
      { status: 503 },
    );
  }
}
