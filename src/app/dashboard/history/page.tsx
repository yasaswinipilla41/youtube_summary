import Link from 'next/link';
import { FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime, formatNumber } from '@/lib/utils';

interface HistoryRow {
  id: string;
  topic: string;
  processing_time_ms: number | null;
  created_at: string;
  summaries: { id: string }[];
  token_usage: { total_tokens: number }[];
}

export default async function HistoryPage() {
  await requireUser();
  const supabase = await createClient();

  // RLS restricts every joined table to this student's own rows.
  const { data } = await supabase
    .from('searches')
    .select('id, topic, processing_time_ms, created_at, summaries(id), token_usage(total_tokens)')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (data ?? []) as unknown as HistoryRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your learning history</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Every search, its generated notes, and the tokens it used. Only you can see this.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
              <th className="px-5 py-3">Topic</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Tokens</th>
              <th className="px-5 py-3">Processing</th>
              <th className="px-5 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  No searches yet.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const tokens = r.token_usage?.reduce((s, t) => s + (t.total_tokens ?? 0), 0) ?? 0;
              const summaryId = r.summaries?.[0]?.id;
              return (
                <tr key={r.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="px-5 py-3 font-medium">{r.topic}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-5 py-3">{formatNumber(tokens)}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {r.processing_time_ms ? `${Math.round(r.processing_time_ms / 1000)}s` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    {summaryId ? (
                      <Link
                        href={`/dashboard/notes/${summaryId}`}
                        className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline dark:text-brand-100"
                      >
                        <FileText className="h-4 w-4" /> View
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
