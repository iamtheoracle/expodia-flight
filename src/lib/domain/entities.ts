import { createHash, randomBytes } from 'node:crypto';

export const BOOKING_STATUSES = [
  'SEARCHING',
  'PRICE_CHECK',
  'AWAITING_CONFIRMATION',
  'CONFIRMED',
  'TICKET_PENDING',
  'TICKETED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
  'REFUND_PENDING',
  'REFUNDED',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

const transitions: Record<BookingStatus, readonly BookingStatus[]> = {
  SEARCHING: ['PRICE_CHECK', 'FAILED', 'EXPIRED'],
  PRICE_CHECK: ['AWAITING_CONFIRMATION', 'FAILED', 'EXPIRED'],
  AWAITING_CONFIRMATION: ['CONFIRMED', 'FAILED', 'EXPIRED'],
  CONFIRMED: ['TICKET_PENDING', 'CANCELLED', 'REFUND_PENDING'],
  TICKET_PENDING: ['TICKETED', 'FAILED', 'CANCELLED'],
  TICKETED: ['CANCELLED', 'REFUND_PENDING'],
  FAILED: [],
  CANCELLED: ['REFUND_PENDING'],
  EXPIRED: [],
  REFUND_PENDING: ['REFUNDED', 'FAILED'],
  REFUNDED: [],
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return transitions[from].includes(to);
}

export function createVerificationReference(ticketId: string): string {
  const entropy = randomBytes(18).toString('hex');
  const digest = createHash('sha256').update(`${ticketId}:${entropy}`).digest('hex').slice(0, 24);
  return `expv_${digest}`;
}

export interface Customer {
  id: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Passenger {
  id: string;
  customerId: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  nationality?: string;
  documentNumber?: string;
}

export interface FlightSegment {
  id: string;
  bookingId: string;
  providerFlightId: string;
  carrierCode: string;
  flightNumber: string;
  originIata: string;
  destinationIata: string;
  departureLocal: string;
  arrivalLocal: string;
}

export interface Booking {
  id: string;
  customerId: string;
  status: BookingStatus;
  providerBookingId?: string;
  pnr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  passengerId: string;
  providerTicketId?: string;
  eTicketNumber?: string;
  verificationReference: string;
  status: 'PENDING' | 'ISSUED' | 'VOIDED';
}
