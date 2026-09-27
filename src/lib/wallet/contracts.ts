export type WalletPlatform = 'APPLE_WALLET' | 'GOOGLE_WALLET';
export type WalletPassType = 'BOARDING_PASS' | 'TICKET' | 'ITINERARY';
export interface WalletEligibilityContext { bookingId: string; ticketId: string; passengerId: string; bookingStatus: string; ticketStatus: 'PENDING' | 'ISSUED' | 'VOIDED'; providerName?: string; providerTicketId?: string; eTicketNumber?: string; airlineCode?: string; flightNumber?: string; originIata?: string; destinationIata?: string; departureLocal?: string; checkInStatus?: 'NOT_AVAILABLE' | 'AVAILABLE' | 'CHECKED_IN'; boardingPassAvailable?: boolean; }
export interface WalletPassDescriptor { platform: WalletPlatform; passType: WalletPassType; bookingId: string; ticketId: string; passengerId: string; externalObjectId: string; status: 'ELIGIBLE' | 'PENDING' | 'ISSUED' | 'REVOKED'; providerSource: 'PROVIDER' | 'EXPODIA'; }
export function getWalletEligibility(context: WalletEligibilityContext) {
  if (context.ticketStatus !== 'ISSUED') return { apple: false, google: false, reason: 'A verified issued ticket is required.' };
  if (!context.providerTicketId && !context.eTicketNumber) return { apple: false, google: false, reason: 'A provider ticket identifier is required.' };
  return { apple: true, google: true };
}
