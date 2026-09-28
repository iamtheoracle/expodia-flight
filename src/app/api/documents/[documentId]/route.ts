import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { recordDocumentEvent } from '@/lib/documents/workflow';

export async function GET(_request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: document, error } = await supabase
    .from('documents')
    .select('id, booking_id, document_number, document_version, status, mime_type, storage_path, metadata')
    .eq('id', documentId)
    .single();
  if (error || !document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  if (document.status !== 'READY' || document.mime_type !== 'application/pdf' || !document.storage_path) {
    return NextResponse.json({ error: 'Document is not available for download' }, { status: 409 });
  }

  const { data: booking } = await supabase.from('bookings').select('id,agent_id').eq('id', document.booking_id).single();
  if (!booking || booking.agent_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: file, error: storageError } = await supabase.storage.from('travel-documents').download(document.storage_path);
  if (storageError || !file) return NextResponse.json({ error: 'Stored document is unavailable' }, { status: 404 });

  await recordDocumentEvent(supabase, {
    documentId: document.id,
    bookingId: document.booking_id,
    eventType: 'DOCUMENT_DOWNLOADED',
    actorType: 'HUMAN_AGENT',
    actorId: user.id,
    metadata: { documentVersion: document.document_version },
  });

  return new NextResponse(file, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${document.document_number || document.id}-v${document.document_version}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
