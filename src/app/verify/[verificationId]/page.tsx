import { headers } from 'next/headers';

type VerificationState =
  | { kind: 'invalid' }
  | { kind: 'not-found' }
  | { kind: 'not-valid' }
  | { kind: 'unavailable' }
  | {
      kind: 'verified';
      verificationReference: string;
      ticketId: string;
      providerTicketId: string | null;
      eTicketNumber: string | null;
      status: string;
      providerName: string | null;
      pnr: string | null;
      providerDestination: { url: string; action: string; source: string | null; verifiedAt: string | null } | null;
      providerManageDestination: { url: string; action: string; source: string | null; verifiedAt: string | null } | null;
      itinerary: Array<{
        airline: string;
        flightNumber: string;
        origin: string;
        destination: string;
        departure: string;
        arrival: string;
      }>;
    };

export default async function VerificationPage({ params }: { params: Promise<{ verificationId: string }> }) {
  const { verificationId } = await params;
  const state = await loadVerificationState(verificationId);

  if (state.kind === 'invalid') return <VerificationResult title="Travel document not found" message="The verification reference is invalid." />;
  if (state.kind === 'not-found') return <VerificationResult title="Travel document not found" message="No active travel document matches this verification reference." />;
  if (state.kind === 'not-valid') return <VerificationResult title="Travel document not valid" message="The linked travel document is not currently issued." />;
  if (state.kind === 'unavailable') return <VerificationResult title="Verification unavailable" message="The verification service could not be reached. No validity claim was made." />;

  return (
    <main className="verificationPage">
      <section className="verificationCard">
        <div className="verificationBadge">VERIFIED TRAVEL DOCUMENT</div>
        <h1>Expodia document verification</h1>
        <p>This result is resolved from the authoritative Expodia booking and ticket records.</p>
        <dl className="verificationDetails">
          <div><dt>Verification reference</dt><dd>{state.verificationReference}</dd></div>
          <div><dt>Provider</dt><dd>{state.providerName ?? 'Not supplied'}</dd></div>
          <div><dt>Booking reference</dt><dd>{state.pnr ?? 'Not supplied by provider'}</dd></div>
          <div><dt>Provider ticket</dt><dd>{state.providerTicketId ?? 'Not supplied by provider'}</dd></div>
          <div><dt>E-ticket number</dt><dd>{state.eTicketNumber ?? 'Not supplied by provider'}</dd></div>
          <div><dt>Status</dt><dd>{state.status}</dd></div>
        </dl>
        <div className="verificationActions">
          {state.providerDestination && <a className="verificationProviderLink" href={state.providerDestination.url} target="_blank" rel="noreferrer">More information with provider ↗</a>}
          {state.providerManageDestination && <a className="verificationProviderLink secondary" href={state.providerManageDestination.url} target="_blank" rel="noreferrer">Manage booking with provider ↗</a>}
        </div>
        <section>
          <h2>Journey</h2>
          {state.itinerary.length === 0 ? (
            <p>Authoritative itinerary details are not available.</p>
          ) : (
            state.itinerary.map((segment, index) => (
              <div className="card" key={`${segment.flightNumber}-${index}`}>
                <strong>{segment.airline} {segment.flightNumber}</strong>
                <p>{segment.origin} → {segment.destination}</p>
                <p>Departure: {new Date(segment.departure).toLocaleString()}</p>
                <p>Arrival: {new Date(segment.arrival).toLocaleString()}</p>
              </div>
            ))
          )}
        </section>
        <p className="verificationNote">Only limited verification information is public. Passport data, date of birth, payment data, internal IDs and private agent notes are not exposed. Flight times and operational status can change after issuance.</p>
      </section>
    </main>
  );
}

async function loadVerificationState(verificationId: string): Promise<VerificationState> {
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(verificationId)) return { kind: 'invalid' };

  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get('host');
    if (!host) return { kind: 'unavailable' };

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const response = await fetch(`${protocol}://${host}/api/verify/${encodeURIComponent(verificationId)}`, {
      cache: 'no-store',
      headers: {
        'x-forwarded-for': requestHeaders.get('x-forwarded-for') ?? 'unknown',
      },
    });

    if (response.status === 400) return { kind: 'invalid' };
    if (response.status === 404) {
      const body = await response.json().catch(() => null);
      return body?.error?.code === 'NOT_VALID' ? { kind: 'not-valid' } : { kind: 'not-found' };
    }
    if (!response.ok) return { kind: 'unavailable' };

    const body = await response.json();
    return {
      kind: 'verified',
      verificationReference: body.verificationReference,
      ticketId: body.ticket.id,
      providerTicketId: body.ticket.providerTicketId,
      eTicketNumber: body.ticket.eTicketNumber,
      status: body.status,
      providerName: body.booking?.providerName ?? null,
      pnr: body.booking?.pnr ?? null,
      providerDestination: body.booking?.providerDestination ?? null,
      providerManageDestination: body.booking?.providerManageDestination ?? null,
      itinerary: (body.itinerary ?? []).map((segment: { airline: string; flightNumber: string; origin: string; destination: string; departure: string; arrival: string }) => ({
        airline: segment.airline,
        flightNumber: segment.flightNumber,
        origin: segment.origin,
        destination: segment.destination,
        departure: segment.departure,
        arrival: segment.arrival,
      })),
    };
  } catch {
    return { kind: 'unavailable' };
  }
}

function VerificationResult({ title, message }: { title: string; message: string }) {
  return <main className="verificationPage"><section className="verificationCard"><h1>{title}</h1><p>{message}</p></section></main>;
}
