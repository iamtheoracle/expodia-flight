import { getWalletEligibility, type WalletEligibilityContext, type WalletPassDescriptor, type WalletPlatform, type WalletPassType } from './contracts';
export function prepareWalletPass(context: WalletEligibilityContext, platform: WalletPlatform, passType: WalletPassType): WalletPassDescriptor {
  const eligibility = getWalletEligibility(context);
  if (platform === 'APPLE_WALLET' && !eligibility.apple) throw new Error(eligibility.reason ?? 'Apple Wallet pass is not eligible');
  if (platform === 'GOOGLE_WALLET' && !eligibility.google) throw new Error(eligibility.reason ?? 'Google Wallet pass is not eligible');
  if (passType === 'BOARDING_PASS' && (!context.boardingPassAvailable || context.checkInStatus !== 'CHECKED_IN')) throw new Error('A boarding pass requires actual provider check-in/boarding-pass data');
  return { platform, passType, bookingId: context.bookingId, ticketId: context.ticketId, passengerId: context.passengerId, externalObjectId: 'expodia-' + platform.toLowerCase() + '-' + context.ticketId + '-' + context.passengerId, status: 'ELIGIBLE', providerSource: context.boardingPassAvailable ? 'PROVIDER' : 'EXPODIA' };
}
