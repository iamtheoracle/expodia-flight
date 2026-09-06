import { createHash, randomBytes } from 'node:crypto';

import type {
  AvailabilityRevalidation,
  ProviderBookingConfirmation,
  ProviderTicketIssuance,
} from '@/lib/providers/contracts';

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

export function assertBookingTransition(
  from: BookingStatus,
  to: BookingStatus,
  confirmation?: ProviderBookingConfirmation,
): void {
  if (!canTransitionBooking(from, to)) {
    throw new Error(`Invalid booking transition: ${from} -> ${to}`);
  }
  if (to === 'CONFIRMED') {
    if (!confirmation?.confirmed || !confirmation.providerBookingId || !confirmation.confirmedAt) {
      throw new Error('Provider confirmation is required before a booking can be confirmed');
    }
  }
}

export function assertTicketTransition(
  from: BookingStatus,
  to: BookingStatus,
  issuance?: ProviderTicketIssuance,
): void {
  if (!canTransitionBooking(from, to)) {
    throw new Error(`Invalid booking transition: ${from} -> ${to}`);
  }
  if (to === 'TICKETED') {
    if (!issuance?.issued || !issuance.providerTicketId || !issuance.issuedAt) {
      throw new Error('Provider ticket issuance is required before a ticket can be marked ticketed');
    }
  }
}

export function assertRevalidationAccepted(
  revalidation: AvailabilityRevalidation,
  agentAcceptedChangedFare = false,
): void {
  if (!revalidation.available) {
    throw new Error('Provider availability is no longer available');
  }
  if (revalidation.changed && !agentAcceptedChangedFare) {
    throw new Error('Provider price or availability changed; explicit agent acceptance is required');
  }
}

export function assertTicketIdentity(
  ticket: { id: string; bookingId: string; passengerId: string },
  passenger: { id: string; bookingId: string },
  booking: { id: string },
): void {
  if (
    ticket.bookingId !== booking.id ||
    ticket.passengerId !== passenger.id ||
    passenger.bookingId !== booking.id
  ) {
    throw new Error('Ticket identity does not match its passenger and booking');
  }
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
  bookingId?: string;
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
