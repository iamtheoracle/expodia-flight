import TravelerSecurityGate from '@/components/traveler/TravelerSecurityGate';

export default function TravelerLayout({ children }: { children: React.ReactNode }) {
  return <TravelerSecurityGate>{children}</TravelerSecurityGate>;
}
