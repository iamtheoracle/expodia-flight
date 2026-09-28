import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { EXPODIA_RECEIPT_TEMPLATE, validateDocumentFields } from '@/lib/documents/templates';
import { renderExpodiaFlightReceiptPdf } from '@/lib/documents/pdf';
import { sha256Hex } from '@/lib/documents/hash';
import { queueTravelEmail, recordDocumentEvent } from '@/lib/documents/workflow';

const PAYMENT_READY = new Set(['SUCCEEDED']);
const BOOKING_READY = new Set([
  'PAYMENT_CONFIRMED',
  'BOOKING_PENDING',
  'CONFIRMED',
  'TICKETING_PENDING',
  'TICKET_PENDING',
  'TICKETED',
  'COMPLETED',
]);

function money(value: number, currency: string) {
  return { value: Number(value || 0).toFixed(2), currency };
}

function ticketingStatus(tickets: Array<{ status: string; e_ticket_number: string | null }>) {
  if (!tickets.length) return 'TICKETING PENDING';
  if (tickets.every((ticket) => ticket.status === 'ISSUED' && ticket.e_ticket_number)) return 'TICKETED';
  if (tickets.some((ticket) => ticket.status === 'ISSUED')) return 'PARTIALLY TICKETED';
  return 'TICKETING PENDING';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}

function duration(minutes: number | null) {
  if (minutes == null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { bookingId?: string } | null;
  const bookingId = body?.bookingId?.trim();
  if (!bookingId) {
    return NextResponse.json({ error: { code: 'INVALID_BOOKING', message: 'A booking ID is required.' } }, { status: 400 });
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, agent_id, customer_id, status, currency, total_amount, provider_name, provider_booking_id, pnr, confirmed_at, created_at')
    .eq('id', bookingId)
    .eq('agent_id', user.id)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND', message: 'The booking was not found for this agent.' } }, { status: 404 });
  }

  if (!BOOKING_READY.has(booking.status)) {
    return NextResponse.json({ error: { code: 'BOOKING_NOT_READY', message: 'The booking has not reached a state where an Expodia flight receipt can be issued.' } }, { status: 409 });
  }

  const [{ data: customer }, { data: agent }, { data: bookingPassengers }, { data: segments }, { data: payments }, { data: tickets }] = await Promise.all([
    supabase.from('customers').select('email').eq('id', booking.customer_id).eq('agent_id', user.id).single(),
    supabase.from('agents').select('display_name,email').eq('id', user.id).single(),
    supabase.from('booking_passengers').select('passenger_id, passengers(id,given_name,family_name)').eq('booking_id', booking.id),
    supabase.from('flight_segments').select('provider_name,carrier_code,flight_number,origin_iata,destination_iata,departure_local,arrival_local,duration_minutes,aircraft_code,stops').eq('booking_id', booking.id).order('departure_local'),
    supabase.from('payment_transactions').select('id,amount,currency,status,provider_transaction_id,created_at').eq('booking_id', booking.id).eq('agent_id', user.id).order('created_at', { ascending: false }),
    supabase.from('tickets').select('passenger_id,provider_name,provider_ticket_id,e_ticket_number,verification_reference,status,issued_at').eq('booking_id', booking.id),
  ]);

  if (!customer) {
    return NextResponse.json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'The booking customer record could not be verified.' } }, { status: 409 });
  }

  const successfulPayments = (payments ?? []).filter((payment) => PAYMENT_READY.has(payment.status));
  if (!successfulPayments.length) {
    return NextResponse.json({ error: { code: 'PAYMENT_NOT_CONFIRMED', message: 'No verified payment transaction is available for this booking.' } }, { status: 409 });
  }

  const totalPaid = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalAmount = Number(booking.total_amount ?? totalPaid);
  const outstanding = Math.max(0, totalAmount - totalPaid);
  const currency = booking.currency || successfulPayments[0]?.currency || 'USD';
  const documentNumber = `EXP-RCPT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const issuedAt = new Date().toISOString();

  const passengerRows = (bookingPassengers ?? []).map((row) => {
    const passenger = Array.isArray(row.passengers) ? row.passengers[0] : row.passengers;
    const ticket = (tickets ?? []).find((item) => item.passenger_id === row.passenger_id);
    return {
      name: passenger ? `${passenger.given_name} ${passenger.family_name}` : 'Passenger information pending',
      type: passenger?.date_of_birth ? 'Traveler' : 'Traveler',
      ticketStatus: ticket?.status === 'ISSUED' ? 'TICKETED' : ticket?.status === 'VOIDED' ? 'VOIDED' : 'PENDING',
      ticketNumber: ticket?.e_ticket_number ?? null,
      providerConfirmation: booking.pnr ?? booking.provider_booking_id ?? null,
      seat: null,
      baggage: null,
    };
  });

  const segmentRows = (segments ?? []).map((segment, index) => ({
    direction: index === 0 ? 'OUTBOUND' as const : 'OTHER' as const,
    date: formatDate(segment.departure_local),
    origin: segment.origin_iata,
    destination: segment.destination_iata,
    carrier: segment.provider_name || segment.carrier_code,
    flightNumber: segment.flight_number,
    departure: formatDateTime(segment.departure_local),
    arrival: formatDateTime(segment.arrival_local),
    duration: duration(segment.duration_minutes),
    stops: segment.stops === 0 ? 'Nonstop' : `${segment.stops} stop${segment.stops === 1 ? '' : 's'}`,
    cabin: null,
    fareClass: null,
    terminalDeparture: null,
    terminalArrival: null,
    aircraft: segment.aircraft_code,
    status: 'Confirmed by booking record',
  }));

  // When the booking contains more than one journey, the return/other direction is identified by route reversal.
  if (segmentRows.length > 1) {
    const first = segmentRows[0];
    segmentRows.forEach((segment, index) => {
      if (index > 0 && segment.origin === first.destination && segment.destination === first.origin) segment.direction = 'RETURN';
    });
  }

  const receiptData = {
    issuer: 'Expodia Flights',
    documentTitle: 'Flight Booking Confirmation / Receipt',
    bookingReference: documentNumber,
    providerBookingReference: booking.pnr ?? booking.provider_booking_id ?? null,
    bookingStatus: booking.status,
    ticketingStatus: ticketingStatus(tickets ?? []),
    issueDate: issuedAt,
    currency,
    passengers: passengerRows,
    segments: segmentRows,
    totalAmount: money(totalAmount, currency).value,
    amountPaid: money(totalPaid, currency).value,
    amountOutstanding: money(outstanding, currency).value,
    paymentStatus: outstanding > 0 ? 'PARTIALLY PAID' : 'PAID',
    paymentReference: successfulPayments[0]?.provider_transaction_id ?? successfulPayments[0]?.id ?? null,
    paymentDate: successfulPayments[0]?.created_at ?? null,
    customerEmail: customer.email,
    agentName: agent?.display_name ?? null,
    agentEmail: agent?.email ?? null,
  };

  const requiredData = {
    documentNumber,
    bookingId: booking.id,
    customerEmail: customer.email,
    currency,
    amount: money(totalAmount, currency).value,
    paymentStatus: receiptData.paymentStatus,
    issuedAt,
  };
  const missing = validateDocumentFields(EXPODIA_RECEIPT_TEMPLATE, requiredData);
  if (missing.length) {
    return NextResponse.json({ error: { code: 'DOCUMENT_VALIDATION_FAILED', message: `Required document fields are missing: ${missing.join(', ')}.` } }, { status: 422 });
  }

  const pdf = await renderExpodiaFlightReceiptPdf(receiptData);
  const hash = sha256Hex(pdf);
  const metadata = {
    ...receiptData,
    templateId: EXPODIA_RECEIPT_TEMPLATE.id,
    templateVersion: EXPODIA_RECEIPT_TEMPLATE.version,
    issuerType: EXPODIA_RECEIPT_TEMPLATE.issuerType,
    issuerName: EXPODIA_RECEIPT_TEMPLATE.issuerName,
  };

  const { data: document, error: documentError } = await supabase
    .from('documents')
    .insert({
      booking_id: booking.id,
      agent_id: user.id,
      document_type: EXPODIA_RECEIPT_TEMPLATE.documentType,
      document_number: documentNumber,
      status: 'READY',
      document_version: 1,
      template_id: EXPODIA_RECEIPT_TEMPLATE.id,
      template_version: EXPODIA_RECEIPT_TEMPLATE.version,
      issuer_type: EXPODIA_RECEIPT_TEMPLATE.issuerType,
      issuer_name: EXPODIA_RECEIPT_TEMPLATE.issuerName,
      language_code: EXPODIA_RECEIPT_TEMPLATE.languageCode,
      mime_type: 'application/pdf',
      content_hash: hash,
      issued_at: issuedAt,
      storage_path: `${booking.id}/receipts/${documentNumber}.pdf`,
      metadata,
    })
    .select('id, document_number, document_type, document_version, status, mime_type, content_hash, issued_at')
    .single();

  if (documentError || !document) {
    return NextResponse.json({ error: { code: 'DOCUMENT_CREATE_FAILED', message: documentError?.message ?? 'The document record could not be created.' } }, { status: 500 });
  }

  const storagePath = `${booking.id}/receipts/${documentNumber}.pdf`;
  const upload = await supabase.storage.from('travel-documents').upload(storagePath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: false });
  if (upload.error && !upload.error.message.toLowerCase().includes('already exists')) {
    return NextResponse.json({ error: { code: 'DOCUMENT_STORAGE_FAILED', message: 'The receipt was created but could not be stored.' } }, { status: 503 });
  }

  await supabase.from('documents').update({ storage_path: storagePath }).eq('id', document.id);
  await supabase.from('document_versions').insert({ document_id: document.id, version: 1, status: 'READY', content_hash: hash });
  await recordDocumentEvent(supabase, { documentId: document.id, bookingId: booking.id, eventType: 'DOCUMENT_CREATED', actorType: 'AI', metadata: { worker: 'document_renderer', documentVersion: 1 } });
  await recordDocumentEvent(supabase, { documentId: document.id, bookingId: booking.id, eventType: 'DOCUMENT_VERIFIED', actorType: 'AI', metadata: { paymentIds: successfulPayments.map((payment) => payment.id), bookingStatus: booking.status } });
  await recordDocumentEvent(supabase, { documentId: document.id, bookingId: booking.id, eventType: 'DOCUMENT_PUBLISHED', actorType: 'AI', metadata: { surfaces: ['documents', 'payment-workflow'] } });
  await queueTravelEmail(supabase, { templateId: 'payment-receipt', documentId: document.id, bookingId: booking.id, recipientEmail: customer.email, metadata: { paymentIds: successfulPayments.map((payment) => payment.id), documentVersion: 1 } });

  return new Response(pdf as BodyInit, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${documentNumber}.pdf"`,
      'x-expodia-document-id': document.id,
      'x-expodia-document-hash': hash,
    },
  });
}
