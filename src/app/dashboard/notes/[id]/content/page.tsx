import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NotesPanel } from '@/components/NotesPanel';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import { BackButton } from '@/components/BackButton';
import { excludeSections } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import type { Summary } from '@/lib/types';

/**
 * Learning-content-only view: the study material without YouTube videos,
 * interview questions, or quiz — those live in their own modules.
 */
export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: summary } = await supabase
    .from('summaries')
    .select('*')
    .eq('id', id)
    .single<Summary>();

  if (!summary) notFound();

  const content = excludeSections(summary.summary, ['interview', 'quiz']);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <BackButton />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-100">
              Study content
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{summary.topic}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatDate(summary.created_at)}
            </p>
          </div>
        </div>
        <ExportPdfButton
          summaryId={summary.id}
          topic={summary.topic}
          userName={profile.name ?? profile.email}
          searchDate={formatDate(summary.created_at)}
          markdown={content}
          heading="AI Learning Platform — Study Content"
          fileSuffix="study-content"
        />
      </div>

      <NotesPanel markdown={content} />
    </div>
  );
}
