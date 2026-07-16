'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * Client-side back navigation — no full page load, and Next.js restores the
 * previous page's scroll position and client state (filters, search) on back.
 */
export function BackButton({ label }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-brand-100"
      aria-label={label ?? 'Go back'}
      title={label ?? 'Go back'}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
