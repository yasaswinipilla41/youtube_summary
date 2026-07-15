import { notFound } from 'next/navigation';
import { Youtube } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NotesPanel } from '@/components/NotesPanel';
import { VideoCard } from '@/components/VideoCard';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import { formatDate } from '@/lib/utils';
import type { Summary, Video } from '@/lib/types';

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireUser();
  const supabase = await createClient();

  // RLS guarantees a student can only load their OWN summary — a foreign id
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-100">
            Study notes
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{summary.topic}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generated from {videos.length} videos · {formatDate(summary.created_at)}
          </p>
        </div>
        <ExportPdfButton
          summaryId={summary.id}
          topic={summary.topic}
          studentName={profile.name ?? profile.email}
          searchDate={formatDate(summary.created_at)}
          markdown={summary.summary}
        />
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
