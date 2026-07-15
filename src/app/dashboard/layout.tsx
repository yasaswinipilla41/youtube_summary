import { requireUser } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/history', label: 'History' },
    ...(profile.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <AppShell profile={profile} links={links}>
      {children}
    </AppShell>
  );
}
