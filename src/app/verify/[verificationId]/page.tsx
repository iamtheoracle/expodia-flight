import { createSupabaseServerClient } from '@/lib/supabase/server';

type VerificationState =
  | { kind: 'invalid' | 'not-found' | 'not-valid' | 'unavailable' }
  | {
      kind: 'verified';
      verificationReference: string;
      ticketId: string;
      providerTicketId: string | null;
      eTicketNumber: string | null;
      status: string;
    };

export default async function VerificationPage({ params }: { params: Promise<{ verificationId: string }> }) {
  const { verificationId } = await params;
  const state = await loadVerificationState(verificationId);

  if (state.kind === 'invalid') return <VerificationResult title="Ticket not found" message="The verification reference is invalid." />;
  if (state.kind === 'not-found') return <VerificationResult title="Ticket not found" message="No active ticket matches this verification reference." />;
  if (state.kind === 'not-valid') return <VerificationResult title="Ticket not valid" message="The linked ticket is not currently issued." />;
  if (state.kind === 'unavailable') return <VerificationResult title="Verification unavailable" message="The verification service could not be reached. No ticket validity claim was made." />;

  return (
    <main className="verificationPage">
      <section className="verificationCard">
        <div className="verificationBadge">VERIFIED TICKET</div>
        <h1>Ticket verification</h1>
        <p>This record resolves to the authoritative Expodia ticket record.</p>
        <dl className="verificationDetails">
          <div><dt>Verification reference</dt><dd>{state.verificationReference}</dd></div>
          <div><dt>Ticket ID</dt><dd>{state.ticketId}</dd></div>
          <div><dt>Provider ticket</dt><dd>{state.providerTicketId ?? 'Not supplied by provider'}</dd></div>
          <div><dt>E-ticket number</dt><dd>{state.eTicketNumber ?? 'Not supplied by provider'}</dd></div>
          <div><dt>Status</dt><dd>{state.status}</dd></div>
        </dl>
        <p className="verificationNote">Flight times and operational status can change after ticket issuance. Use the current booking or tracking record for live operational information.</p>
      </section>
    </main>
  );
}

async function loadVerificationState(verificationId: string): Promise<VerificationState> {
  if (!verificationId || verificationId.length > 128) return { kind: 'invalid' };

  try {
    const supabase = await createSupabaseServerClient();
    const { data: verification, error } = await supabase
      .from('verification_records')
      .select('ticket_id, verification_reference, active')
      .eq('verification_reference', verificationId)
      .eq('active', true)
      .maybeSingle();

    if (error || !verification) return { kind: 'not-found' };

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, provider_ticket_id, e_ticket_number, status')
      .eq('id', verification.ticket_id)
      .maybeSingle();

    if (ticketError) return { kind: 'unavailable' };
    if (!ticket || ticket.status !== 'ISSUED') return { kind: 'not-valid' };

    return {
      kind: 'verified',
      verificationReference: verification.verification_reference,
      ticketId: ticket.id,
      providerTicketId: ticket.provider_ticket_id,
      eTicketNumber: ticket.e_ticket_number,
      status: ticket.status,
    };
  } catch {
    return { kind: 'unavailable' };
  }
}

function VerificationResult({ title, message }: { title: string; message: string }) {
  return <main className="verificationPage"><section className="verificationCard"><h1>{title}</h1><p>{message}</p></section></main>;
}
