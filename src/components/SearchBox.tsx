'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'React',
  'Python',
  'Machine Learning',
  'DevOps',
  'Docker',
  'Kubernetes',
  'Data Science',
  'Cyber Security',
  'Cloud Computing',
];

const STAGES = [
  'Searching YouTube for the best videos…',
  'Extracting transcripts and captions…',
  'AI is reading through the videos…',
  'Merging everything into one study document…',
];

export function SearchBox() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function search(t: string) {
    const query = t.trim();
    if (!query || loading) return;
    setLoading(true);
    setError(null);
    setStage(0);

    // Advance the status line while the server works.
    const ticker = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      12_000,
    );

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Search failed');
      router.push(`/dashboard/notes/${json.summaryId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    } finally {
      clearInterval(ticker);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(topic);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Search any topic — React, Python, DevOps, AI…"
            disabled={loading}
            maxLength={200}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          <span className="hidden sm:inline">{loading ? 'Working…' : 'summarize'}</span>
        </button>
      </form>

      {loading && (
        <div className="mt-4">
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-1000"
              style={{ width: `${((stage + 1) / (STAGES.length + 1)) * 100}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{STAGES[stage]}</p>
          <p className="mt-1 text-xs text-slate-400">
            Processing 10 videos usually takes 1–3 minutes.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      {!loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setTopic(s);
                search(s);
              }}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:text-slate-300 dark:hover:text-brand-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
