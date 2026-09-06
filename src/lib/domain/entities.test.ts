import { describe, expect, it } from 'vitest';
import {
  assertBookingTransition,
  assertTicketTransition,
  assertRevalidationAccepted,
  assertTicketIdentity,
  createVerificationReference,
  canTransitionBooking,
} from './entities';

describe('Expodia domain integrity', () => {
  it('creates a non-guessable verification reference from a ticket identity', () => {
    const reference = createVerificationReference('ticket-123');
    expect(reference).toMatch(/^expv_/);
    expect(reference).not.toBe('ticket-123');
  });

  it('allows only valid booking lifecycle transitions', () => {
    expect(canTransitionBooking('AWAITING_CONFIRMATION', 'CONFIRMED')).toBe(true);
    expect(canTransitionBooking('SEARCHING', 'TICKETED')).toBe(false);
    expect(canTransitionBooking('TICKETED', 'CONFIRMED')).toBe(false);
  });

  it('rejects confirmation without provider confirmation evidence', () => {
    expect(() => assertBookingTransition('AWAITING_CONFIRMATION', 'CONFIRMED')).toThrow(
      'Provider confirmation is required before a booking can be confirmed',
    );
  });

  it('accepts confirmation only when provider confirmation is authoritative', () => {
    expect(() =>
      assertBookingTransition('AWAITING_CONFIRMATION', 'CONFIRMED', {
        confirmed: true,
        providerBookingId: 'provider-booking-1',
        confirmedAt: '2026-09-06T12:00:00Z',
      }),
    ).not.toThrow();
  });

  it('rejects ticket issuance without provider issuance evidence', () => {
    expect(() => assertTicketTransition('TICKET_PENDING', 'TICKETED')).toThrow(
      'Provider ticket issuance is required before a ticket can be marked ticketed',
    );
  });

  it('rejects a changed fare unless the agent explicitly accepts it', () => {
    expect(() =>
      assertRevalidationAccepted({
        available: true,
        providerOfferId: 'offer-1',
        currency: 'USD',
        totalAmount: 125,
        changed: true,
        checkedAt: '2026-09-06T12:00:00Z',
      }),
    ).toThrow('Provider price or availability changed; explicit agent acceptance is required');
  });

  it('prevents a ticket from pointing at the wrong passenger or booking', () => {
    expect(() =>
      assertTicketIdentity(
        { id: 'ticket-1', bookingId: 'booking-2', passengerId: 'passenger-1' },
        { id: 'passenger-1', bookingId: 'booking-1' },
        { id: 'booking-1' },
      ),
    ).toThrow('Ticket identity does not match its passenger and booking');
  });
});
