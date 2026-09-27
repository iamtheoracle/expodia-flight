import { describe, expect, it } from 'vitest';
import { prepareWalletPass } from './service';

const issuedTicket = {
  bookingId: 'booking-1',
  ticketId: 'ticket-1',
  passengerId: 'passenger-1',
  bookingStatus: 'TICKETED',
  ticketStatus: 'ISSUED' as const,
  providerName: 'provider',
  providerTicketId: 'provider-ticket-1',
  eTicketNumber: '1234567890123',
};

describe('wallet eligibility', () => {
  it('allows Apple and Google ticket passes only after verified ticket issuance', () => {
    expect(prepareWalletPass(issuedTicket, 'APPLE_WALLET', 'TICKET').status).toBe('ELIGIBLE');
    expect(prepareWalletPass(issuedTicket, 'GOOGLE_WALLET', 'TICKET').status).toBe('ELIGIBLE');
  });

  it('rejects a boarding pass before actual provider check-in data exists', () => {
    expect(() => prepareWalletPass(issuedTicket, 'APPLE_WALLET', 'BOARDING_PASS')).toThrow(
      'actual provider check-in/boarding-pass data',
    );
  });

  it('rejects wallet passes when ticketing is not complete', () => {
    expect(() => prepareWalletPass({ ...issuedTicket, ticketStatus: 'PENDING' }, 'GOOGLE_WALLET', 'TICKET')).toThrow(
      'verified issued ticket',
    );
  });
});
