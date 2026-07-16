import Link from 'next/link';
import { BookOpen, Coins, ExternalLink, FileText, SearchIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SearchBox } from '@/components/SearchBox';
import { StatCard } from '@/components/StatCard';
import { formatNumber, timeAgo } from '@/lib/utils';
import type { Search, Summary } from '@/lib/types';

export default async function DashboardPage() {
  const profile = await requireUser();
  const supabase = await createClient();

  // All queries below are RLS-scoped to this student's own rows.
  const [searchesRes, summariesRes, tokensRes, searchCountRes, summaryCountRes] =
    await Promise.all([
      supabase
        .from('searches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('summaries')
        .select('id, topic, created_at')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('token_usage').select('total_tokens'),
      supabase.from('searches').select('id', { count: 'exact', head: true }),
      supabase.from('summaries').select('id', { count: 'exact', head: true }),
    ]);

  const searches = (searchesRes.data ?? []) as Search[];
  const summaries = (summariesRes.data ?? []) as Pick<Summary, 'id' | 'topic' | 'created_at'>[];
  const totalTokens = (tokensRes.data ?? []).reduce(
    (sum, r) => sum + (r.total_tokens ?? 0),
    0,
  );
  const searchCount = searchCountRes.count ?? 0;
  const summaryCount = summaryCountRes.count ?? 0;

  const firstName = (profile.name ?? profile.email).split(' ')[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {firstName} 👋</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          What do you want to learn today?
        </p>
      </div>

      <SearchBox />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={SearchIcon} label="Total searches" value={String(searchCount)} hint="Recent activity shown below" />
        <StatCard icon={FileText} label="Study notes generated" value={String(summaryCount)} />
        <StatCard icon={Coins} label="AI tokens used" value={formatNumber(totalTokens)} hint="Across all your searches" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <SearchIcon className="h-4 w-4 text-brand-600" /> Recent searches
          </h2>
          {searches.length === 0 ? (
            <p className="text-sm text-slate-400">No searches yet — try a topic above.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {searches.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5">
                  <span className="truncate font-medium">{s.topic}</span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">{timeAgo(s.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <BookOpen className="h-4 w-4 text-brand-600" /> Generated notes
          </h2>
          {summaries.length === 0 ? (
            <p className="text-sm text-slate-400">Your AI study notes will appear here.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {summaries.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2.5">
                  <Link
                    href={`/dashboard/notes/${s.id}`}
                    className="min-w-0 flex-1 truncate font-medium transition hover:text-brand-600 dark:hover:text-brand-100"
                  >
                    {s.topic}
                  </Link>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(s.created_at)}</span>
                  <Link
                    href={`/dashboard/notes/${s.id}/content`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 dark:hover:text-brand-100"
                    title="Open study content"
                    aria-label={`Open study content for ${s.topic}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
