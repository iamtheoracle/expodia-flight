import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateTicketDocument } from '@/lib/documents/service';

export async function GET(_request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  if (!ticketId || ticketId.length > 128) {
    return new Response('Invalid ticket ID', { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id, booking_id, passenger_id, provider_name, provider_ticket_id, e_ticket_number, verification_reference, status, document_version')
      .eq('id', ticketId)
      .maybeSingle();

    if (error || !ticket) return new Response('Ticket not found', { status: 404 });
    if (ticket.status !== 'ISSUED' || !ticket.provider_ticket_id) {
      return new Response('A provider-issued ticket is required before a document can be generated', { status: 409 });
    }

    const [{ data: passenger }, { data: booking }, { data: segments }] = await Promise.all([
      supabase.from('passengers').select('id, given_name, family_name').eq('id', ticket.passenger_id).maybeSingle(),
      supabase.from('bookings').select('id, pnr, currency, total_amount').eq('id', ticket.booking_id).maybeSingle(),
      supabase.from('flight_segments').select('carrier_code, flight_number, origin_iata, destination_iata, departure_local, arrival_local, aircraft_code, stops').eq('booking_id', ticket.booking_id).order('departure_local'),
    ]);

    if (!passenger || !booking || !segments?.length) return new Response('Ticket data is incomplete', { status: 409 });

    const artifact = await generateTicketDocument({
      ticketId: ticket.id,
      bookingId: booking.id,
      passengerId: passenger.id,
      passengerName: `${passenger.given_name} ${passenger.family_name}`,
      providerName: ticket.provider_name ?? 'Provider',
      providerTicketId: ticket.provider_ticket_id,
      eTicketNumber: ticket.e_ticket_number ?? undefined,
      pnr: booking.pnr ?? undefined,
      verificationReference: ticket.verification_reference,
      currency: booking.currency ?? undefined,
      totalAmount: booking.total_amount ?? undefined,
      segments: segments.map((segment) => ({
        carrierCode: segment.carrier_code,
        flightNumber: segment.flight_number,
        originIata: segment.origin_iata,
        destinationIata: segment.destination_iata,
        departureLocal: segment.departure_local,
        arrivalLocal: segment.arrival_local,
      })),
      generatedAt: new Date().toISOString(),
      documentVersion: ticket.document_version,
    });

    return new Response(Buffer.from(artifact.bytes), {
      status: 200,
      headers: {
        'content-type': artifact.mimeType,
        'content-disposition': `attachment; filename="${artifact.filename}"`,
        'cache-control': 'private, no-store',
      },
    });
  } catch {
    return new Response('Ticket document generation is unavailable', { status: 503 });
  }
}
