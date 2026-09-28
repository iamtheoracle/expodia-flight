import { TravelerShell } from '@/components/traveler/TravelerShell';

export default function TravelerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <TravelerShell>{children}</TravelerShell>;
}
