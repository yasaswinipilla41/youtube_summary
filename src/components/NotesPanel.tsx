import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function NotesPanel({ markdown }: { markdown: string }) {
  return (
    <article className="notes-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 sm:p-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  );
}
