import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  /** When set, the whole card becomes a link with a hover affordance. */
  href?: string;
}

function CardBody({ icon: Icon, label, value, hint }: Omit<Props, 'href'>) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-slate-700 dark:text-brand-100">
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </>
  );
}

export function StatCard({ href, ...body }: Props) {
  const base =
    'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800';

  if (href) {
    return (
      <Link
        href={href}
        className={`block ${base} transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md`}
      >
        <CardBody {...body} />
      </Link>
    );
  }
  return (
    <div className={base}>
      <CardBody {...body} />
    </div>
  );
}
