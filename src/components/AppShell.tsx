'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { UserProfile } from '@/lib/types';

interface NavLink {
  href: string;
  label: string;
}

export function AppShell({
  profile,
  links,
  children,
}: {
  profile: UserProfile;
  links: NavLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">AI Learning Platform</span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== '/dashboard' && l.href !== '/admin' && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-100'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2">
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={profile.name ?? 'avatar'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {(profile.name ?? profile.email)[0]?.toUpperCase()}
                </span>
              )}
              <div className="hidden text-left md:block">
                <p className="max-w-[10rem] truncate text-sm font-medium leading-tight">
                  {profile.name ?? profile.email}
                </p>
                <p className="text-xs capitalize text-slate-400">{profile.role}</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
