import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { EXPODIA_RECEIPT_TEMPLATE, validateDocumentFields } from '@/lib/documents/templates';
import { renderExpodiaReceiptPdf } from '@/lib/documents/pdf';
import { sha256Hex } from '@/lib/documents/hash';

const PAYMENT_READY = new Set(['SUCCEEDED', 'AUTHORIZED']);
const BOOKING_READY = new Set([
  'PAYMENT_CONFIRMED',
  'BOOKING_PENDING',
  'CONFIRMED',
  'TICKETING_PENDING',
  'TICKET_PENDING',
  'TICKETED',
  'COMPLETED',
]);

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
    .select('id, agent_id, customer_id, status, currency, total_amount')
    .eq('id', bookingId)
    .eq('agent_id', user.id)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND', message: 'The booking was not found for this agent.' } }, { status: 404 });
  }

  if (!BOOKING_READY.has(booking.status)) {
    return NextResponse.json({ error: { code: 'BOOKING_NOT_READY', message: 'The booking has not reached a state where an Expodia payment receipt can be issued.' } }, { status: 409 });
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('email')
    .eq('id', booking.customer_id)
    .eq('agent_id', user.id)
    .single();

  if (customerError || !customer) {
    return NextResponse.json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'The booking customer record could not be verified.' } }, { status: 409 });
  }

  const { data: payment, error: paymentError } = await supabase
    .from('payment_transactions')
    .select('id, amount, currency, status')
    .eq('booking_id', booking.id)
    .eq('agent_id', user.id)
    .in('status', Array.from(PAYMENT_READY))
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError || !payment) {
    return NextResponse.json({ error: { code: 'PAYMENT_NOT_CONFIRMED', message: 'No verified payment transaction is available for this booking.' } }, { status: 409 });
  }

  const documentNumber = `EXP-RCPT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const issuedAt = new Date().toISOString();
  const amount = Number(payment.amount).toFixed(2);
  const data = {
    documentNumber,
    bookingId: booking.id,
    customerEmail: customer.email,
    currency: payment.currency,
    amount,
    paymentStatus: payment.status,
    issuedAt,
  };

  const missing = validateDocumentFields(EXPODIA_RECEIPT_TEMPLATE, data);
  if (missing.length) {
    return NextResponse.json({ error: { code: 'DOCUMENT_VALIDATION_FAILED', message: `Required document fields are missing: ${missing.join(', ')}.` } }, { status: 422 });
  }

  const pdf = await renderExpodiaReceiptPdf(data);
  const hash = sha256Hex(pdf);
  const metadata = {
    ...data,
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
      metadata,
    })
    .select('id, document_number, document_type, document_version, status, mime_type, content_hash, issued_at')
    .single();

  if (documentError || !document) {
    return NextResponse.json({ error: { code: 'DOCUMENT_CREATE_FAILED', message: documentError?.message ?? 'The document record could not be created.' } }, { status: 500 });
  }

  await supabase.from('document_versions').insert({
    document_id: document.id,
    version: 1,
    status: 'READY',
    content_hash: hash,
  });

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
