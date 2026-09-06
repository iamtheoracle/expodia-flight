import { AppShell } from '@/components/app-shell/AppShell';
import { OperationalPage } from '@/components/app-shell/OperationalPage';

export default function TicketsPage() {
  return <AppShell currentPath="/tickets"><OperationalPage title="Tickets" description="Provider-issued ticket records and document access." status="No provider-issued tickets exist yet." /></AppShell>;
}
