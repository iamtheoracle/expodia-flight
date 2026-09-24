import { describe, expect, it } from 'vitest';
import { assertBookingTransition, canTransition } from '@/lib/bookings/state-machine';

describe('booking state machine', () => {
  it('allows the normal Expodia checkout path', () => {
    expect(canTransition('DRAFT', 'CART')).toBe(true);
    expect(canTransition('CART', 'PASSENGERS_PENDING')).toBe(true);
    expect(canTransition('PASSENGERS_PENDING', 'VERIFICATION_PENDING')).toBe(true);
    expect(canTransition('VERIFICATION_PENDING', 'PAYMENT_PENDING')).toBe(true);
    expect(canTransition('PAYMENT_PENDING', 'PAYMENT_CONFIRMED')).toBe(true);
    expect(canTransition('PAYMENT_CONFIRMED', 'BOOKING_PENDING')).toBe(true);
    expect(canTransition('BOOKING_PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'TICKET_PENDING')).toBe(true);
    expect(canTransition('TICKET_PENDING', 'TICKETED')).toBe(true);
  });

  it('rejects impossible transitions', () => {
    expect(canTransition('COMPLETED', 'CONFIRMED')).toBe(false);
    expect(() => assertBookingTransition('COMPLETED', 'CONFIRMED')).toThrow(/Invalid booking transition/);
  });
});
