import { AppShell } from '@/components/app-shell/AppShell';
import { OperationalPage } from '@/components/app-shell/OperationalPage';

export default function NotificationsPage() {
  return <AppShell currentPath="/notifications"><OperationalPage title="Notifications" description="Confirmed operational notifications and delivery outcomes." status="No production notifications have been generated." /></AppShell>;
}
