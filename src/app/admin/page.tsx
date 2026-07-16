import { Coins, FileText, Search as SearchIcon, Users } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { StatCard } from '@/components/StatCard';
import { TopTopicsChart, TokensOverTimeChart } from '@/components/AdminCharts';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  // Admin gate already enforced by the layout (requireAdmin).
  const admin = createAdminClient();

  const [studentsRes, searchesRes, summariesRes, tokensRes] = await Promise.all([
    admin.from('users').select('id', { count: 'exact', head: true }),
    admin.from('searches').select('topic'),
    admin.from('summaries').select('id', { count: 'exact', head: true }),
    admin.from('token_usage').select('total_tokens, created_at'),
  ]);

  const searches = searchesRes.data ?? [];
  const tokenRows = tokensRes.data ?? [];
  const totalTokens = tokenRows.reduce((s, r) => s + (r.total_tokens ?? 0), 0);

  // Most searched topics (case-insensitive grouping)
  const topicCounts = new Map<string, { topic: string; count: number }>();
  for (const s of searches) {
    const key = s.topic.trim().toLowerCase();
    const entry = topicCounts.get(key);
    if (entry) entry.count += 1;
    else topicCounts.set(key, { topic: s.topic.trim(), count: 1 });
  }
  const topTopics = [...topicCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Token usage per day, last 30 days
  const byDay = new Map<string, number>();
  for (const r of tokenRows) {
    const day = new Date(r.created_at).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + (r.total_tokens ?? 0));
  }
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const dailyTokens = [...byDay.entries()]
    .filter(([day]) => new Date(day).getTime() >= cutoff)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tokens]) => ({ date: date.slice(5), tokens }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin overview</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Platform-wide activity across all users.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Registered users" value={String(studentsRes.count ?? 0)} />
        <StatCard icon={SearchIcon} label="Total searches" value={String(searches.length)} />
        <StatCard icon={FileText} label="Notes generated" value={String(summariesRes.count ?? 0)} />
        <StatCard icon={Coins} label="Total tokens used" value={formatNumber(totalTokens)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 font-semibold">Most searched topics</h2>
          {topTopics.length === 0 ? (
            <p className="text-sm text-slate-400">No searches yet.</p>
          ) : (
            <TopTopicsChart data={topTopics} />
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 font-semibold">Token usage — last 30 days</h2>
          {dailyTokens.length === 0 ? (
            <p className="text-sm text-slate-400">No token usage recorded yet.</p>
          ) : (
            <TokensOverTimeChart data={dailyTokens} />
          )}
        </section>
      </div>
    </div>
  );
}
