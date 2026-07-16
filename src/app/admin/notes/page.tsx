import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  user_id: string;
  topic: string;
  created_at: string;
  users: { name: string | null; email: string } | null;
}

/** Admin → Generated Notes: every AI-generated study document. */
export default async function AdminNotesPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from('summaries')
    .select('id, user_id, topic, created_at, users(name, email)')
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generated notes</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Every AI-generated study document across the platform.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
              <th className="px-5 py-3">Topic</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-slate-400">
                  No notes generated yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <td className="px-5 py-3 font-medium">{r.topic}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/students/${r.user_id}`}
                    className="text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
                  >
                    {r.users?.name ?? r.users?.email ?? '—'}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                  {formatDateTime(r.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
