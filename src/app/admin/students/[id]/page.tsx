import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Coins, FileDown, FileText, LogIn, Search as SearchIcon } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { StatCard } from '@/components/StatCard';
import { formatDateTime, formatNumber } from '@/lib/utils';
import type { Search, Summary, TokenUsage, UserProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: student } = await admin
    .from('users')
    .select('*')
    .eq('id', id)
    .single<UserProfile>();
  if (!student) notFound();

  const [searchesRes, summariesRes, tokensRes, loginsRes, pdfsRes] = await Promise.all([
    admin
      .from('searches')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    admin
      .from('summaries')
      .select('id, topic, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
    admin
      .from('token_usage')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    admin
      .from('login_history')
      .select('id, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('pdf_exports')
      .select('id, topic, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const searches = (searchesRes.data ?? []) as Search[];
  const summaries = (summariesRes.data ?? []) as Pick<Summary, 'id' | 'topic' | 'created_at'>[];
  const tokens = (tokensRes.data ?? []) as TokenUsage[];
  const logins = loginsRes.data ?? [];
  const pdfs = pdfsRes.data ?? [];
  const totalTokens = tokens.reduce((s, t) => s + (t.total_tokens ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        {student.photo ? (
          <Image src={student.photo} alt="" width={56} height={56} className="rounded-full" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">
            {(student.name ?? student.email)[0]?.toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold">{student.name ?? student.email}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {student.email} · <span className="capitalize">{student.role}</span> · Last login{' '}
            {formatDateTime(student.last_login)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={SearchIcon} label="Searches" value={String(searches.length)} />
        <StatCard icon={FileText} label="Notes generated" value={String(summaries.length)} />
        <StatCard icon={Coins} label="Tokens used" value={formatNumber(totalTokens)} />
        <StatCard icon={FileDown} label="PDF exports" value={String(pdfs.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <SearchIcon className="h-4 w-4 text-brand-600" /> Search history
          </h2>
          {searches.length === 0 ? (
            <p className="text-sm text-slate-400">No searches yet.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-700">
              {searches.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="truncate font-medium">{s.topic}</span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">
                    {formatDateTime(s.created_at)}
                    {s.processing_time_ms
                      ? ` · ${Math.round(s.processing_time_ms / 1000)}s`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Coins className="h-4 w-4 text-brand-600" /> Token usage
          </h2>
          {tokens.length === 0 ? (
            <p className="text-sm text-slate-400">No token usage yet.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3">Topic</th>
                    <th className="pb-2 pr-3">Prompt</th>
                    <th className="pb-2 pr-3">Completion</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {tokens.map((t) => (
                    <tr key={t.id}>
                      <td className="max-w-[10rem] truncate py-2 pr-3 font-medium">{t.topic ?? '—'}</td>
                      <td className="py-2 pr-3">{formatNumber(t.prompt_tokens)}</td>
                      <td className="py-2 pr-3">{formatNumber(t.completion_tokens)}</td>
                      <td className="py-2 font-semibold">{formatNumber(t.total_tokens)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <LogIn className="h-4 w-4 text-brand-600" /> Login history
          </h2>
          {logins.length === 0 ? (
            <p className="text-sm text-slate-400">No logins recorded.</p>
          ) : (
            <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto text-sm dark:divide-slate-700">
              {logins.map((l) => (
                <li key={l.id} className="py-2 text-slate-600 dark:text-slate-300">
                  {formatDateTime(l.created_at)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <FileDown className="h-4 w-4 text-brand-600" /> PDF export history
          </h2>
          {pdfs.length === 0 ? (
            <p className="text-sm text-slate-400">No PDFs exported.</p>
          ) : (
            <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto text-sm dark:divide-slate-700">
              {pdfs.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span className="truncate font-medium">{p.topic ?? '—'}</span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">
                    {formatDateTime(p.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
