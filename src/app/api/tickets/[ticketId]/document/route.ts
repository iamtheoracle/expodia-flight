import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateTicketDocument } from '@/lib/documents/service';
import { queueTravelEmail, recordDocumentEvent } from '@/lib/documents/workflow';

export async function GET(_request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  if (!ticketId || ticketId.length > 128) return new Response('Invalid ticket ID', { status: 400 });

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

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
      supabase.from('bookings').select('id, agent_id, customer_id, pnr, currency, total_amount').eq('id', ticket.booking_id).maybeSingle(),
      supabase.from('flight_segments').select('carrier_code, flight_number, origin_iata, destination_iata, departure_local, arrival_local, aircraft_code, stops').eq('booking_id', ticket.booking_id).order('departure_local'),
    ]);

    if (!booking || booking.agent_id !== user.id) return new Response('Forbidden', { status: 403 });
    const { data: customer } = await supabase.from('customers').select('email').eq('id', booking.customer_id).eq('agent_id', user.id).maybeSingle();
    if (!passenger || !segments?.length) return new Response('Ticket data is incomplete', { status: 409 });

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

    const storagePath = `${booking.id}/tickets/${ticket.id}/v${artifact.version}.pdf`;
    const upload = await supabase.storage.from('travel-documents').upload(storagePath, Buffer.from(artifact.bytes), {
      contentType: artifact.mimeType,
      upsert: false,
    });
    if (upload.error && !upload.error.message.toLowerCase().includes('already exists')) {
      return new Response('Document storage is unavailable', { status: 503 });
    }

    const documentNumber = ticket.e_ticket_number ?? ticket.provider_ticket_id;
    const hash = await crypto.subtle.digest('SHA-256', artifact.bytes).then((buffer) => Buffer.from(buffer).toString('hex'));
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        booking_id: booking.id,
        agent_id: user.id,
        document_type: 'EXPODIA_ETICKET',
        document_number: documentNumber,
        status: 'READY',
        storage_path: storagePath,
        document_version: artifact.version,
        template_id: 'expodia-standard-eticket-v1',
        template_version: String(artifact.version),
        issuer_type: 'EXPODIA',
        issuer_name: 'Expodia',
        language_code: 'en',
        mime_type: artifact.mimeType,
        content_hash: hash,
        issued_at: artifact.snapshot.generatedAt,
        metadata: { ticketId: ticket.id, providerTicketId: ticket.provider_ticket_id, verificationReference: ticket.verification_reference },
      })
      .select('id, document_number, document_version')
      .single();

    if (documentError || !document) return new Response('Document record could not be created', { status: 500 });

    await recordDocumentEvent(supabase, {
      documentId: document.id,
      bookingId: booking.id,
      eventType: 'DOCUMENT_CREATED',
      actorType: 'AI',
      metadata: { worker: 'document_renderer', documentVersion: artifact.version },
    });
    await recordDocumentEvent(supabase, {
      documentId: document.id,
      bookingId: booking.id,
      eventType: 'DOCUMENT_VERIFIED',
      actorType: 'AI',
      metadata: { providerTicketId: ticket.provider_ticket_id, verificationReference: ticket.verification_reference },
    });
    await recordDocumentEvent(supabase, {
      documentId: document.id,
      bookingId: booking.id,
      eventType: 'DOCUMENT_PUBLISHED',
      actorType: 'AI',
      metadata: { surfaces: ['documents', 'ticket-workflow'] },
    });

    if (customer?.email) {
      await queueTravelEmail(supabase, {
        templateId: 'ticket-issued',
        documentId: document.id,
        bookingId: booking.id,
        recipientEmail: customer.email,
        metadata: { ticketId: ticket.id, documentVersion: artifact.version },
      });
    }

    return new Response(Buffer.from(artifact.bytes), {
      status: 200,
      headers: {
        'content-type': artifact.mimeType,
        'content-disposition': `attachment; filename="${artifact.filename}"`,
        'cache-control': 'private, no-store',
        'x-expodia-document-id': document.id,
      },
    });
  } catch {
    return new Response('Ticket document generation is unavailable', { status: 503 });
  }
}
