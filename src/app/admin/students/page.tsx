import Link from 'next/link';
import Image from 'next/image';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const admin = createAdminClient();

  const [usersRes, searchesRes, tokensRes] = await Promise.all([
    admin.from('users').select('*').order('created_at', { ascending: false }),
    admin.from('searches').select('user_id'),
    admin.from('token_usage').select('user_id, total_tokens'),
  ]);

  const users = (usersRes.data ?? []) as UserProfile[];

  const searchCounts = new Map<string, number>();
  for (const s of searchesRes.data ?? []) {
    searchCounts.set(s.user_id, (searchCounts.get(s.user_id) ?? 0) + 1);
  }
  const tokenTotals = new Map<string, number>();
  for (const t of tokensRes.data ?? []) {
    tokenTotals.set(t.user_id, (tokenTotals.get(t.user_id) ?? 0) + (t.total_tokens ?? 0));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All users</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {users.length} registered user{users.length === 1 ? '' : 's'}. Click a row for full activity.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Searches</th>
              <th className="px-5 py-3">Tokens</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Last login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((u) => (
              <tr key={u.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <td className="px-5 py-3">
                  <Link href={`/admin/students/${u.id}`} className="flex items-center gap-3">
                    {u.photo ? (
                      <Image src={u.photo} alt="" width={32} height={32} className="rounded-full" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                        {(u.name ?? u.email)[0]?.toUpperCase()}
                      </span>
                    )}
                    <span>
                      <span className="block font-medium">{u.name ?? '—'}</span>
                      <span className="block text-xs text-slate-400">{u.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      u.role === 'admin'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-brand-50 text-brand-700 dark:bg-slate-700 dark:text-brand-100'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">{searchCounts.get(u.id) ?? 0}</td>
                <td className="px-5 py-3">{formatNumber(tokenTotals.get(u.id) ?? 0)}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDate(u.created_at)}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(u.last_login)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
