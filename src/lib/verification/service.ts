import type { TicketVerificationRecord } from './contracts';

export function verifyTicket(record: TicketVerificationRecord): TicketVerificationRecord {
  if (record.status !== 'ISSUED') {
    throw new Error('Only an issued ticket can be verified');
  }
  return { ...record, verifiedAt: new Date().toISOString() };
}
