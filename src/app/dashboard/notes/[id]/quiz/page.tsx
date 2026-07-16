import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NotesPanel } from '@/components/NotesPanel';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import { BackButton } from '@/components/BackButton';
import { QuizPlayer } from '@/components/QuizPlayer';
import { extractSections, parseQuiz } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import type { Summary } from '@/lib/types';

/**
 * Quiz module — interactive when the quiz can be parsed (answers hidden
 * until the user attempts each question), with PDF download.
 */
export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: summary } = await supabase
    .from('summaries')
    .select('*')
    .eq('id', id)
    .single<Summary>();

  if (!summary) notFound();

  const quizMd = extractSections(summary.summary, ['quiz']);
  const questions = quizMd ? parseQuiz(quizMd) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <BackButton />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-100">
              Quiz
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{summary.topic}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {questions.length > 0
                ? `${questions.length} questions — answers stay hidden until you attempt each one`
                : formatDate(summary.created_at)}
            </p>
          </div>
        </div>
        {quizMd && (
          <ExportPdfButton
            summaryId={summary.id}
            topic={summary.topic}
            userName={profile.name ?? profile.email}
            searchDate={formatDate(summary.created_at)}
            markdown={quizMd}
            heading="Quiz"
            label="Download PDF"
            fileSuffix="quiz"
          />
        )}
      </div>

      {questions.length > 0 ? (
        <QuizPlayer questions={questions} />
      ) : quizMd ? (
        <NotesPanel markdown={quizMd} />
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-700 dark:bg-slate-800">
          This study document has no quiz section.
        </p>
      )}
    </div>
  );
}
