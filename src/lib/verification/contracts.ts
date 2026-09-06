export interface TicketVerificationRecord {
  verificationReference: string;
  ticketId: string;
  bookingId: string;
  passengerId: string;
  status: 'ISSUED' | 'VOIDED';
  verifiedAt: string;
}
