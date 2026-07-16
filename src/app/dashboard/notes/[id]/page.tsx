import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ListChecks, MessageSquareText, Youtube } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NotesPanel } from '@/components/NotesPanel';
import { VideoCard } from '@/components/VideoCard';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import { BackButton } from '@/components/BackButton';
import { formatDate } from '@/lib/utils';
import type { Summary, Video } from '@/lib/types';

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireUser();
  const supabase = await createClient();

  // RLS guarantees a user can only load their OWN summary — a foreign id
  // simply returns no rows and 404s.
  const { data: summary } = await supabase
    .from('summaries')
    .select('*')
    .eq('id', id)
    .single<Summary>();

  if (!summary) notFound();

  const { data: videoRows } = await supabase
    .from('videos')
    .select('*')
    .eq('search_id', summary.search_id)
    .order('created_at', { ascending: true });

  const videos = (videoRows ?? []) as Video[];

  const modules = [
    {
      href: `/dashboard/notes/${summary.id}/content`,
      label: 'Study Content',
      icon: BookOpen,
      desc: 'Learning material only',
    },
    {
      href: `/dashboard/notes/${summary.id}/interview`,
      label: 'Interview Questions',
      icon: MessageSquareText,
      desc: 'Practice + download PDF',
    },
    {
      href: `/dashboard/notes/${summary.id}/quiz`,
      label: 'Quiz',
      icon: ListChecks,
      desc: 'Test yourself',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <BackButton label="Back to History" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-100">
              Study notes
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{summary.topic}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Generated from {videos.length} videos · {formatDate(summary.created_at)}
            </p>
          </div>
        </div>
        <ExportPdfButton
          summaryId={summary.id}
          topic={summary.topic}
          userName={profile.name ?? profile.email}
          searchDate={formatDate(summary.created_at)}
          markdown={summary.summary}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-slate-700 dark:text-brand-100">
              <m.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-100">
                {m.label}
              </span>
              <span className="block text-xs text-slate-400">{m.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      {videos.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Youtube className="h-5 w-5 text-red-500" /> Source videos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      <NotesPanel markdown={summary.summary} />
    </div>
  );
}
