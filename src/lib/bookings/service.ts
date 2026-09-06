import { assertBookingTransition, assertRevalidationAccepted } from '@/lib/domain/entities';
import type { AvailabilityProvider, BookingProvider, ProviderBookingConfirmation } from '@/lib/providers/contracts';

export interface BookingExecutionInput {
  providerOfferId: string;
  customerId: string;
  passengerIds: string[];
  agentAcceptedChangedFare?: boolean;
}

export interface BookingExecutionResult {
  confirmation: ProviderBookingConfirmation;
  status: 'CONFIRMED' | 'FAILED' | 'PENDING';
}

export async function createBooking(
  input: BookingExecutionInput,
  dependencies: { availability: AvailabilityProvider; booking: BookingProvider },
): Promise<BookingExecutionResult> {
  const revalidation = await dependencies.availability.revalidate(input.providerOfferId);
  assertRevalidationAccepted(revalidation, input.agentAcceptedChangedFare === true);

  const confirmation = await dependencies.booking.book({
    providerOfferId: input.providerOfferId,
    customerId: input.customerId,
    passengerIds: input.passengerIds,
  });

  if (confirmation.status === 'CONFIRMED') {
    assertBookingTransition('AWAITING_CONFIRMATION', 'CONFIRMED', confirmation);
  }

  return {
    confirmation,
    status: confirmation.status,
  };
}
