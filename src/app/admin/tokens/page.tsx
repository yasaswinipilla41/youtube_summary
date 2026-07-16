import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { TokensOverTimeChart } from '@/components/AdminCharts';
import { formatDateTime, formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  user_id: string;
  topic: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
  users: { name: string | null; email: string } | null;
}

/** Admin → Token Analytics: platform-wide AI token usage and reports. */
export default async function AdminTokensPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from('token_usage')
    .select(
      'id, user_id, topic, prompt_tokens, completion_tokens, total_tokens, created_at, users(name, email)',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as Row[];
  const total = rows.reduce((s, r) => s + (r.total_tokens ?? 0), 0);

  const byDay = new Map<string, number>();
  for (const r of rows) {
    const day = new Date(r.created_at).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + (r.total_tokens ?? 0));
  }
  const dailyTokens = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tokens]) => ({ date: date.slice(5), tokens }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Token analytics</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {formatNumber(total)} tokens across the {rows.length} most recent generations.
        </p>
      </div>

      {dailyTokens.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 font-semibold">Token usage over time</h2>
          <TokensOverTimeChart data={dailyTokens} />
        </section>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Topic</th>
              <th className="px-5 py-3">Prompt</th>
              <th className="px-5 py-3">Completion</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  No token usage recorded yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/students/${r.user_id}`}
                    className="text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
                  >
                    {r.users?.name ?? r.users?.email ?? '—'}
                  </Link>
                </td>
                <td className="max-w-[14rem] truncate px-5 py-3 font-medium">{r.topic ?? '—'}</td>
                <td className="px-5 py-3">{formatNumber(r.prompt_tokens)}</td>
                <td className="px-5 py-3">{formatNumber(r.completion_tokens)}</td>
                <td className="px-5 py-3 font-semibold">{formatNumber(r.total_tokens)}</td>
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
