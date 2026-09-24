import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell/AppShell';

export default async function DocumentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: documents } = user
    ? await supabase
        .from('documents')
        .select('id, booking_id, document_type, document_number, document_version, status, mime_type, issued_at, created_at')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <AppShell currentPath="/documents">
      <section className="content">
        <div className="pageIntro">
          <div>
            <h1>Documents</h1>
            <p className="subtitle">Download only documents that Expodia has actually issued from verified booking and payment data.</p>
          </div>
          <Link className="secondary" href="/bookings">Bookings</Link>
        </div>

        {!documents?.length ? (
          <section className="card empty">No Expodia documents are available yet. Tickets and issuer documents appear only after the real booking/ticketing workflow produces them.</section>
        ) : (
          <div className="cartList">
            {documents.map((document) => (
              <article className="card cartItem" key={document.id}>
                <div className="cartItemHeader">
                  <div>
                    <div className="eyebrow">{document.document_type} · v{document.document_version}</div>
                    <h2>{document.document_number}</h2>
                  </div>
                  <strong>{document.status}</strong>
                </div>
                <div className="cartFooter">
                  <span>{document.issued_at ? new Date(document.issued_at).toLocaleString() : 'Not issued'}</span>
                  {document.status === 'READY' && document.mime_type === 'application/pdf' ? (
                    <a className="secondary" href={`/api/documents/${document.id}`}>Download PDF</a>
                  ) : (
                    <span>Unavailable</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
