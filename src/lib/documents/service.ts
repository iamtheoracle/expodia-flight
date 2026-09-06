import type { TicketDocumentSnapshot } from './contracts';
import { renderTicketDocument } from './render-ticket';

export async function generateTicketDocument(snapshot: TicketDocumentSnapshot) {
  if (snapshot.documentVersion < 1) {
    throw new Error('Ticket document version must be positive');
  }
  return renderTicketDocument(snapshot);
}
