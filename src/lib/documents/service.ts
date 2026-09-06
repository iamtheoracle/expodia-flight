import type { DocumentArtifact, TicketDocumentSnapshot } from './contracts';

export function createTicketDocumentArtifact(snapshot: TicketDocumentSnapshot): DocumentArtifact {
  if (!snapshot.ticketId || !snapshot.bookingId || !snapshot.passengerId || !snapshot.providerTicketId) {
    throw new Error('A ticket document requires authoritative ticket, booking, passenger, and provider ticket identities');
  }

  return {
    documentId: `doc_${snapshot.ticketId}_v${snapshot.documentVersion}`,
    filename: `${snapshot.passengerId}_${snapshot.ticketId}_v${snapshot.documentVersion}.pdf`,
    mimeType: 'application/pdf',
    version: snapshot.documentVersion,
    snapshot,
  };
}
