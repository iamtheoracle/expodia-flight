import { AppShell } from '@/components/app-shell/AppShell';
import { OperationalPage } from '@/components/app-shell/OperationalPage';

export default function PassengersPage() {
  return <AppShell currentPath="/passengers"><OperationalPage title="Passengers" description="Passenger records associated with agent-owned customers and bookings." status="No production passenger records exist yet." /></AppShell>;
}
