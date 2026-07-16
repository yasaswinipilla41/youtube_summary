import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { TopTopicsChart } from '@/components/AdminCharts';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  user_id: string;
  topic: string;
  processing_time_ms: number | null;
  created_at: string;
  users: { name: string | null; email: string } | null;
}

/** Admin → Search History & Analytics: every search across all users. */
export default async function AdminSearchesPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from('searches')
    .select('id, user_id, topic, processing_time_ms, created_at, users(name, email)')
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as Row[];

  const topicCounts = new Map<string, { topic: string; count: number }>();
  for (const r of rows) {
    const key = r.topic.trim().toLowerCase();
    const entry = topicCounts.get(key);
    if (entry) entry.count += 1;
    else topicCounts.set(key, { topic: r.topic.trim(), count: 1 });
  }
  const topTopics = [...topicCounts.values()].sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Search history</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          All searches across the platform, most recent first.
        </p>
      </div>

      {topTopics.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 font-semibold">Most searched topics</h2>
          <TopTopicsChart data={topTopics} />
        </section>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
              <th className="px-5 py-3">Topic</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Processing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                  No searches yet.
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
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                  {r.processing_time_ms ? `${Math.round(r.processing_time_ms / 1000)}s` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
