import type { Database } from '@/lib/supabase/types';

export type BookingStatus = Database['public']['Enums']['booking_status'];

const transitions: Record<BookingStatus, readonly BookingStatus[]> = {
  SEARCHING: ['PRICE_CHECK', 'FAILED', 'EXPIRED'],
  PRICE_CHECK: ['AWAITING_CONFIRMATION', 'FAILED', 'EXPIRED', 'REQUIRES_REVIEW'],
  AWAITING_CONFIRMATION: ['CONFIRMED', 'FAILED', 'EXPIRED', 'REQUIRES_REVIEW'],
  CONFIRMED: ['TICKET_PENDING', 'CANCEL_REQUESTED', 'COMPLETED', 'REQUIRES_REVIEW'],
  TICKET_PENDING: ['TICKETED', 'FAILED', 'REQUIRES_REVIEW'],
  TICKETED: ['COMPLETED', 'CANCEL_REQUESTED', 'REQUIRES_REVIEW'],
  FAILED: ['SEARCHING', 'CANCELLED', 'REQUIRES_REVIEW'],
  CANCELLED: ['REFUND_PENDING', 'COMPLETED'],
  EXPIRED: ['SEARCHING'],
  REFUND_PENDING: ['REFUNDED', 'REQUIRES_REVIEW'],
  REFUNDED: ['COMPLETED'],
  DRAFT: ['CART', 'FAILED'],
  CART: ['PASSENGERS_PENDING', 'EXPIRED', 'FAILED'],
  PASSENGERS_PENDING: ['VERIFICATION_PENDING', 'FAILED', 'EXPIRED'],
  VERIFICATION_PENDING: ['PAYMENT_PENDING', 'REQUIRES_REVIEW', 'FAILED'],
  PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'FAILED', 'REQUIRES_REVIEW'],
  PAYMENT_CONFIRMED: ['BOOKING_PENDING', 'FAILED', 'REQUIRES_REVIEW'],
  BOOKING_PENDING: ['CONFIRMED', 'TICKETING_PENDING', 'FAILED', 'REQUIRES_REVIEW'],
  TICKETING_PENDING: ['TICKETED', 'FAILED', 'REQUIRES_REVIEW'],
  COMPLETED: [],
  CANCEL_REQUESTED: ['CANCELLED', 'REFUND_PENDING', 'REQUIRES_REVIEW'],
  REQUIRES_REVIEW: ['PRICE_CHECK', 'VERIFICATION_PENDING', 'PAYMENT_PENDING', 'BOOKING_PENDING', 'TICKETING_PENDING', 'CANCEL_REQUESTED', 'FAILED'],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return transitions[from].includes(to);
}

export function assertBookingTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid booking transition: ${from} → ${to}`);
  }
}

export function getAllowedBookingTransitions(status: BookingStatus): readonly BookingStatus[] {
  return transitions[status];
}
