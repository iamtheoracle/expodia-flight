import type { Metadata } from 'next';
import { ToastProvider } from '@/components/notifications/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Expodia Flights',
  description: 'Professional flight booking for travel agents.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
