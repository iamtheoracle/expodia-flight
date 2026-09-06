import { AppShell } from '@/components/app-shell/AppShell';
import { OperationalPage } from '@/components/app-shell/OperationalPage';

export default function TrackingPage() {
  return <AppShell currentPath="/tracking"><OperationalPage title="Flight tracking" description="Operational flight status synchronized from an authoritative status provider." status="No active production flights are being tracked." /></AppShell>;
}
