'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import type { QuizQuestion } from '@/lib/markdown';

/**
 * Interactive quiz. Answers are never shown up front — a question reveals the
 * correct answer only after the user picks an option, and the score updates
 * as they go.
 */
export function QuizPlayer({ questions }: { questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<Record<number, string>>({});

  const answered = Object.keys(picked).length;
  const score = questions.reduce(
    (s, q) => s + (picked[q.number] && picked[q.number] === q.answer ? 1 : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="sticky top-20 z-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
        <p className="text-sm font-medium">
          Score: <span className="text-brand-600 dark:text-brand-100">{score}</span> / {questions.length}
          <span className="ml-2 text-xs text-slate-400">({answered} answered)</span>
        </p>
        {answered > 0 && (
          <button
            onClick={() => setPicked({})}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        )}
      </div>

      {questions.map((q, qi) => {
        const chosen = picked[q.number];
        const isAnswered = Boolean(chosen);
        return (
          <div
            key={q.number}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 sm:p-6"
          >
            <p className="mb-4 font-medium leading-relaxed">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-slate-700 dark:text-brand-100">
                {qi + 1}
              </span>
              {q.question}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt) => {
                const isChosen = chosen === opt.key;
                const isCorrect = q.answer === opt.key;
                let style =
                  'border-slate-200 hover:border-brand-500 dark:border-slate-600 dark:hover:border-brand-500';
                if (isAnswered) {
                  if (isCorrect) {
                    style = 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                  } else if (isChosen) {
                    style = 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                  } else {
                    style = 'border-slate-200 opacity-60 dark:border-slate-600';
                  }
                }
                return (
                  <button
                    key={opt.key}
                    disabled={isAnswered}
                    onClick={() =>
                      setPicked((p) => ({ ...p, [q.number]: opt.key }))
                    }
                    className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${style}`}
                  >
                    <span className="font-bold">{opt.key}.</span>
                    <span>{opt.text}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0" />}
                    {isAnswered && isChosen && !isCorrect && <XCircle className="ml-auto h-5 w-5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <p
                className={`mt-3 text-sm font-medium ${
                  chosen === q.answer
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {chosen === q.answer
                  ? 'Correct!'
                  : `Incorrect — the correct answer is ${q.answer}.`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
