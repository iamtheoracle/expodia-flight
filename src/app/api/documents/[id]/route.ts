import { createSupabaseServerClient } from '@/lib/supabase/server';
import { renderExpodiaReceiptPdf } from '@/lib/documents/pdf';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new Response('Authentication required.', { status: 401 });

  const { id } = await context.params;
  const { data: document, error } = await supabase
    .from('documents')
    .select('id, agent_id, document_type, document_number, status, mime_type, metadata')
    .eq('id', id)
    .eq('agent_id', user.id)
    .single();

  if (error || !document) return new Response('Document not found.', { status: 404 });
  if (document.status !== 'READY') return new Response('Document is not available.', { status: 409 });
  if (document.document_type !== 'EXPODIA_RECEIPT') return new Response('This document type is not renderer-enabled.', { status: 409 });

  const metadata = document.metadata as Record<string, unknown>;
  const required = ['documentNumber','bookingId','customerEmail','currency','amount','paymentStatus','issuedAt'];
  if (required.some((key) => typeof metadata[key] !== 'string')) {
    return new Response('Stored document metadata failed validation.', { status: 422 });
  }

  const pdf = await renderExpodiaReceiptPdf({
    documentNumber: String(metadata.documentNumber),
    bookingId: String(metadata.bookingId),
    customerEmail: String(metadata.customerEmail),
    currency: String(metadata.currency),
    amount: String(metadata.amount),
    paymentStatus: String(metadata.paymentStatus),
    issuedAt: String(metadata.issuedAt),
  });

  return new Response(pdf as BodyInit, {
    status: 200,
    headers: {
      'content-type': document.mime_type,
      'content-disposition': `attachment; filename="${document.document_number}.pdf"`,
    },
  });
}
