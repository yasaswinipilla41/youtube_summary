import { requireAdmin } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side role check — non-admins are redirected before any admin data
  // is fetched. All admin pages use the service-role client behind this gate.
  const profile = await requireAdmin();

  const links = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/students', label: 'Students' },
    { href: '/dashboard', label: 'My Dashboard' },
  ];

  return (
    <AppShell profile={profile} links={links}>
      {children}
    </AppShell>
  );
}
