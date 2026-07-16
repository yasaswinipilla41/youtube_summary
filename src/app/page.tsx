import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Check,
  Clock,
  FileDown,
  FileText,
  Globe,
  GraduationCap,
  ListOrdered,
  Mail,
  NotebookText,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Youtube,
} from 'lucide-react';
import { getProfile } from '@/lib/auth';

const NAV_LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#about', label: 'About Us' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' },
];

const WAVE_HEIGHTS = [
  8, 14, 10, 18, 12, 22, 16, 9, 20, 13, 24, 11, 17, 8, 21, 15, 10, 19, 12, 23,
  14, 9, 18, 11, 22, 13, 16, 8, 20, 12, 24, 10, 17, 14, 9, 21, 15, 19, 11, 23,
];

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/90 ${className}`}
    >
      {children}
    </div>
  );
}

export default async function LandingPage() {
  const profile = await getProfile();
  const appHref = profile ? (profile.role === 'admin' ? '/admin' : '/dashboard') : '/login';
  const ctaLabel = profile ? 'Go to Dashboard' : 'Get Started Free';

  return (
    <div id="top" className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="#top" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <span className="text-sm font-extrabold tracking-wide sm:text-base">
              YOUTUBE <span className="text-indigo-600 dark:text-indigo-400">SUMMARY</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  i === 0
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400'
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!profile && (
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 sm:block"
              >
                Log In
              </Link>
            )}
            <Link
              href={appHref}
              className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90 sm:px-5"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-6 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 sm:p-10 lg:p-14">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300">
                <Users className="h-4 w-4" /> Trusted by 10K+ Learners
              </span>

              <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                YOUTUBE
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  SUMMARY
                </span>
              </h1>

              <p className="mt-5 text-lg font-semibold text-slate-700 dark:text-slate-200">
                Learn Smarter. Save Time. Get Key Insights Instantly.
              </p>
              <p className="mt-3 max-w-md text-slate-500 dark:text-slate-400">
                Search any topic and get the best 10 YouTube videos, AI-powered summaries, notes,
                quizzes, and interview questions – all in one place.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  { icon: Youtube, color: 'bg-red-50 text-red-500 dark:bg-red-900/30', label: 'Top 10 Videos from YouTube' },
                  { icon: Sparkles, color: 'bg-violet-50 text-violet-500 dark:bg-violet-900/30', label: 'AI Powered Summaries' },
                  { icon: FileDown, color: 'bg-blue-50 text-blue-500 dark:bg-blue-900/30', label: 'Export Notes as PDF' },
                  { icon: ShieldCheck, color: 'bg-green-50 text-green-500 dark:bg-green-900/30', label: 'Secure & Private' },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-2 text-center">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.color}`}>
                      <f.icon className="h-6 w-6" />
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={appHref}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
                >
                  {ctaLabel} <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                  Learn More
                </a>
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Check className="h-4 w-4 text-green-500" />
                No credit card required &bull; Free forever plan available
              </p>
            </div>

            {/* Right — feature card mosaic */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <Card>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                      <Bot className="h-6 w-6" />
                    </span>
                    <p className="font-semibold">AI Summarizer</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Get concise, accurate summaries powered by advanced AI.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['bg-amber-400', 'bg-rose-400', 'bg-sky-400'].map((c) => (
                        <span key={c} className={`h-7 w-7 rounded-full border-2 border-white ${c} dark:border-slate-800`} />
                      ))}
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-xs font-bold text-white dark:border-slate-800">
                        +
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">20K+ Users</span>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      <NotebookText className="h-6 w-6" />
                    </span>
                    <p className="font-semibold">Smart Notes</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Well-structured notes to help you learn and revise quickly.
                  </p>
                  <div className="mt-3 flex gap-2">
                    {[
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
                      'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
                      'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
                    ].map((c, i) => (
                      <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-xl ${c}`}>
                        <FileText className="h-4 w-4" />
                      </span>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ListOrdered className="h-6 w-6" />
                    </span>
                    <p className="font-semibold">Auto Chaptering</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    AI detects key chapters and organizes content automatically.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                    <div className="flex h-8 flex-1 items-center gap-[3px] overflow-hidden">
                      {WAVE_HEIGHTS.map((h, i) => (
                        <span
                          key={i}
                          className="w-[3px] shrink-0 rounded-full bg-violet-400/80"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="overflow-hidden p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-indigo-500 via-purple-500 to-slate-800">
                    <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                    <span className="absolute right-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white">
                      TOP 10 VIDEOS
                    </span>
                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur">
                      <Play className="h-6 w-6 fill-current" />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">The Future of Artificial Intelligence</p>
                    <p className="mt-1 text-xs text-slate-400">12:45 &bull; 1.2M views &bull; 3 days ago</p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                        <FileDown className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="font-semibold">Export Anywhere</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Download your summaries, notes, and quizzes in PDF format.
                        </p>
                      </div>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-500 dark:bg-red-900/30">
                      PDF
                    </span>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
                      <Globe className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-semibold">Multi-language Support</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Summaries available in multiple languages for global learners.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['English', 'Hindi', 'Spanish', 'French', '+10'].map((l) => (
                      <span
                        key={l}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-2 gap-6 rounded-2xl border border-white/70 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 lg:grid-cols-4">
            {[
              { icon: Users, color: 'text-violet-500', value: '50K+', label: 'Happy Users' },
              { icon: FileText, color: 'text-orange-500', value: '200K+', label: 'Summaries Generated' },
              { icon: Clock, color: 'text-sky-500', value: '1M+', label: 'Hours Saved' },
              { icon: Star, color: 'text-green-500', value: '4.8/5', label: 'User Rating' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-center gap-3">
                <s.icon className={`h-7 w-7 ${s.color}`} />
                <div>
                  <p className="text-xl font-extrabold">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────────── */}
      <section id="about" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              About Us
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Turn YouTube into your personal classroom
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              YouTube Summary is an AI-powered learning platform. Search any topic — from React to
              Machine Learning — and we fetch the 10 best videos, read through every transcript,
              and merge everything into one clean, structured study document: key concepts,
              detailed explanations, examples, interview questions, quizzes, and practical
              exercises.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'One study document distilled from 10 expert videos',
                'Interactive quizzes with hidden answers and live scoring',
                'Interview questions and notes downloadable as PDF',
                'Your history, tokens, and notes are private to your account',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white sm:p-10">
            <GraduationCap className="h-10 w-10" />
            <h3 className="mt-4 text-2xl font-bold">How it works</h3>
            <ol className="mt-5 space-y-4">
              {[
                'Sign in with Google — your account is created instantly.',
                'Search any topic you want to learn.',
                'We fetch the top 10 YouTube videos and their transcripts.',
                'AI merges everything into one structured study document.',
                'Study, take the quiz, and export your notes as PDF.',
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-indigo-50">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 bg-slate-50 py-20 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Everything you need to learn faster</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Youtube, title: 'Top 10 Video Curation', desc: 'Every search pulls the 10 most relevant YouTube videos with title, channel, duration, views, and publish date.' },
              { icon: Bot, title: 'AI Study Notes', desc: 'Transcripts from all videos are merged into one deduplicated document — better than any single video.' },
              { icon: ListOrdered, title: 'Interactive Quizzes', desc: '10 MCQs per topic with answers hidden until you attempt each question, plus live scoring.' },
              { icon: NotebookText, title: 'Interview Prep', desc: 'A dedicated interview questions module for every topic, downloadable as a clean PDF.' },
              { icon: FileDown, title: 'PDF Export', desc: 'Export study notes, interview questions, and quizzes as professionally formatted PDFs.' },
              { icon: ShieldCheck, title: 'Private & Secure', desc: 'Google sign-in with row-level security — your history, notes, and tokens are yours alone.' },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-slate-700 dark:text-indigo-300">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Start free, upgrade when you grow</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              name: 'Free',
              price: '$0',
              tagline: 'For getting started',
              features: ['5 topic searches / month', 'AI study notes', 'Interactive quizzes', 'PDF export'],
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$9',
              tagline: 'For serious learners',
              features: ['Unlimited searches', 'Priority AI generation', 'Interview prep module', 'Full history & analytics'],
              highlight: true,
            },
            {
              name: 'Team',
              price: '$29',
              tagline: 'For classrooms & teams',
              features: ['Everything in Pro', 'Admin dashboard', 'Usage monitoring', 'Priority support'],
              highlight: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border p-8 ${
                p.highlight
                  ? 'border-indigo-600 bg-gradient-to-b from-indigo-600 to-violet-700 text-white shadow-xl'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              <p className={`text-sm font-semibold ${p.highlight ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {p.name}
              </p>
              <p className="mt-2 text-4xl font-extrabold">
                {p.price}
                <span className={`text-base font-medium ${p.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>
                  /month
                </span>
              </p>
              <p className={`mt-1 text-sm ${p.highlight ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {p.tagline}
              </p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? 'text-white' : 'text-green-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={appHref}
                className={`mt-8 block rounded-full py-3 text-center font-semibold transition ${
                  p.highlight
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90'
                }`}
              >
                {ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Blog ───────────────────────────────────────────────────────── */}
      <section id="blog" className="scroll-mt-20 bg-slate-50 py-20 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Blog
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Learning tips & product updates</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { tag: 'Study Tips', title: 'How to learn any tech topic in a weekend', blurb: 'A practical system for compressing 10 hours of video into 2 hours of focused study.', gradient: 'from-indigo-500 to-violet-500' },
              { tag: 'Product', title: 'Quizzes now hide answers until you attempt', blurb: 'Our quiz module now scores you live and never spoils the answer before you try.', gradient: 'from-fuchsia-500 to-rose-500' },
              { tag: 'AI', title: 'Why 10 videos beat 1 — the science of synthesis', blurb: 'Merging multiple expert explanations fills the gaps any single tutorial leaves behind.', gradient: 'from-sky-500 to-indigo-500' },
            ].map((b) => (
              <article
                key={b.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div className={`h-36 bg-gradient-to-br ${b.gradient}`} />
                <div className="p-6">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-slate-700 dark:text-indigo-300">
                    {b.tag}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold leading-snug">{b.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{b.blurb}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────────────────── */}
      <section id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-10 text-center text-white sm:p-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Contact</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">We&apos;d love to hear from you</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Questions, feedback, or feature requests — reach out and we&apos;ll get back to you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:support@symbiosystech.com"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              <Mail className="h-4 w-4" /> support@symbiosystech.com
            </a>
            <Link
              href={appHref}
              className="flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              {ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} YouTube Summary — AI Learning Platform
          </p>
          <nav className="flex flex-wrap gap-4">
            {NAV_LINKS.slice(1).map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-slate-400 transition hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
