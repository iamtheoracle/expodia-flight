import { AppShell } from '@/components/app-shell/AppShell';
import { OperationalPage } from '@/components/app-shell/OperationalPage';

export default function BookingsPage() {
  return <AppShell currentPath="/bookings"><OperationalPage title="Bookings" description="Confirmed and in-progress booking records from connected providers." status="No production booking records exist yet." /></AppShell>;
}
