import { AppShell } from '@/components/app-shell/AppShell';
import { OperationalPage } from '@/components/app-shell/OperationalPage';

export default function AuditPage() {
  return <AppShell currentPath="/audit"><OperationalPage title="Audit" description="Traceable agent, provider, document, notification, and operational actions." status="No production audit events exist yet." /></AppShell>;
}
