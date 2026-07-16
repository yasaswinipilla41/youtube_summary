/**
 * Utilities for slicing the AI-generated study document into modules
 * (content-only view, interview questions, quiz) without changing how the
 * document itself is generated or stored.
 */

export interface MarkdownSection {
  title: string;
  body: string;
}

/** Split a markdown document on its top-level `# ` headings. */
export function splitSections(md: string): MarkdownSection[] {
  const lines = md.split(/\r?\n/);
  const sections: MarkdownSection[] = [];
  let current: MarkdownSection | null = null;
  const preamble: string[] = [];

  for (const line of lines) {
    const heading = line.match(/^#\s+(.+?)\s*$/);
    if (heading) {
      if (current) sections.push(current);
      current = { title: heading[1].trim(), body: '' };
    } else if (current) {
      current.body += `${line}\n`;
    } else {
      preamble.push(line);
    }
  }
  if (current) sections.push(current);

  if (sections.length === 0) return [{ title: '', body: md }];
  const pre = preamble.join('\n').trim();
  if (pre) sections.unshift({ title: '', body: `${pre}\n` });
  return sections;
}

function sectionMatches(title: string, keywords: string[]): boolean {
  const t = title.toLowerCase();
  return keywords.some((k) => t.includes(k));
}

function toMarkdown(sections: MarkdownSection[]): string {
  return sections
    .map((s) => (s.title ? `# ${s.title}\n${s.body}` : s.body))
    .join('\n')
    .trim();
}

/** Markdown containing only the sections whose titles match the keywords. */
export function extractSections(md: string, keywords: string[]): string {
  return toMarkdown(splitSections(md).filter((s) => sectionMatches(s.title, keywords)));
}

/** Markdown with the matching sections removed. */
export function excludeSections(md: string, keywords: string[]): string {
  return toMarkdown(splitSections(md).filter((s) => !sectionMatches(s.title, keywords)));
}

// ── Quiz parsing ────────────────────────────────────────────────────────────

export interface QuizOption {
  key: string;
  text: string;
}

export interface QuizQuestion {
  number: number;
  question: string;
  options: QuizOption[];
  answer: string | null;
}

const stripMd = (s: string) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();

/**
 * Best-effort parser for the AI-generated quiz section: numbered questions,
 * options A-D, and an "Answer Key" block at the end. Returns [] when the
 * format is unrecognizable so callers can fall back to rendering markdown.
 */
export function parseQuiz(quizMd: string): QuizQuestion[] {
  const lines = quizMd.split(/\r?\n/);

  const keyIdx = lines.findIndex((l) => /answer\s*key/i.test(l));
  const questionLines = keyIdx >= 0 ? lines.slice(0, keyIdx) : lines;
  const answerLines = keyIdx >= 0 ? lines.slice(keyIdx + 1) : [];

  const answers = new Map<number, string>();
  for (const raw of answerLines) {
    const m = stripMd(raw).match(/^\(?(\d+)\)?[.):\-–\s]+\(?([A-D])\)?/i);
    if (m) answers.set(Number(m[1]), m[2].toUpperCase());
  }

  const questions: QuizQuestion[] = [];
  let current: QuizQuestion | null = null;

  for (const raw of questionLines) {
    const line = stripMd(raw);
    if (!line) continue;

    const option = line.match(/^[-*]?\s*\(?([A-D])\)?[.):]\s*(.+)$/);
    const numbered = line.match(/^\(?(\d+)\)?[.)]\s*(.+)$/);

    if (option && current) {
      current.options.push({ key: option[1].toUpperCase(), text: option[2].trim() });
    } else if (numbered) {
      if (current) questions.push(current);
      const num = Number(numbered[1]);
      current = {
        number: num,
        question: numbered[2].trim(),
        options: [],
        answer: answers.get(num) ?? null,
      };
    } else if (current && current.options.length === 0 && !line.startsWith('#')) {
      current.question += ` ${line}`; // wrapped question text
    }
  }
  if (current) questions.push(current);

  const valid = questions.filter((q) => q.options.length >= 2);
  // A quiz is only playable when we know the answers.
  return valid.every((q) => q.answer) && valid.length > 0 ? valid : [];
}
