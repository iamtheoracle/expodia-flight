import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function VerificationPage({ params }: { params: Promise<{ verificationId: string }> }) {
  const { verificationId } = await params;

  if (!verificationId || verificationId.length > 128) {
    return <VerificationResult title="Ticket not found" message="The verification reference is invalid." />;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: verification, error } = await supabase
      .from('verification_records')
      .select('ticket_id, verification_reference, active')
      .eq('verification_reference', verificationId)
      .eq('active', true)
      .maybeSingle();

    if (error || !verification) {
      return <VerificationResult title="Ticket not found" message="No active ticket matches this verification reference." />;
    }

    const { data: ticket } = await supabase
      .from('tickets')
      .select('id, booking_id, passenger_id, provider_ticket_id, e_ticket_number, status, document_version')
      .eq('id', verification.ticket_id)
      .maybeSingle();

    if (!ticket || ticket.status !== 'ISSUED') {
      return <VerificationResult title="Ticket not valid" message="The linked ticket is not currently issued." />;
    }

    return (
      <main className="verificationPage">
        <section className="verificationCard">
          <div className="verificationBadge">VERIFIED TICKET</div>
          <h1>Ticket verification</h1>
          <p>This record resolves to the authoritative Expodia ticket record.</p>
          <dl className="verificationDetails">
            <div><dt>Verification reference</dt><dd>{verification.verification_reference}</dd></div>
            <div><dt>Ticket ID</dt><dd>{ticket.id}</dd></div>
            <div><dt>Provider ticket</dt><dd>{ticket.provider_ticket_id ?? 'Not supplied by provider'}</dd></div>
            <div><dt>E-ticket number</dt><dd>{ticket.e_ticket_number ?? 'Not supplied by provider'}</dd></div>
            <div><dt>Status</dt><dd>{ticket.status}</dd></div>
          </dl>
          <p className="verificationNote">Flight times and operational status can change after ticket issuance. Use the current booking or tracking record for live operational information.</p>
        </section>
      </main>
    );
  } catch {
    return <VerificationResult title="Verification unavailable" message="The verification service could not be reached. No ticket validity claim was made." />;
  }
}

function VerificationResult({ title, message }: { title: string; message: string }) {
  return <main className="verificationPage"><section className="verificationCard"><h1>{title}</h1><p>{message}</p></section></main>;
}
