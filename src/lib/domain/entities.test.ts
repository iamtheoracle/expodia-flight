import { describe, expect, it } from 'vitest';
import { createVerificationReference, canTransitionBooking } from './entities';

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
});
