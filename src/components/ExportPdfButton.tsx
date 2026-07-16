'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  summaryId: string;
  topic: string;
  userName: string;
  searchDate: string;
  markdown: string;
  /** PDF header title. Defaults to the full study-notes heading. */
  heading?: string;
  /** Button label. Defaults to "Export as PDF". */
  label?: string;
  /** Filename suffix, e.g. "interview-questions". */
  fileSuffix?: string;
}

// ── Layout constants ────────────────────────────────────────────────────────
const MARGIN = 40;
const FOOTER_SPACE = 28;
const BODY_SIZE = 11;
const BODY_LH = 1.55;
const HEADING_LH = 1.3;

/**
 * Normalize AI-generated text into characters the built-in Helvetica font can
 * measure and render — unsupported unicode is what causes clipped and
 * strangely letter-spaced output.
 */
function sanitizeText(s: string): string {
  return s
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[\u00A0\u2000-\u200B\u202F\u3000]/g, ' ')
    .replace(/[→➡]/g, '->')
    .replace(/[•●◦‣⁃]/g, '-')
    // Anything else outside printable Latin-1 gets dropped rather than
    // rendered as a broken glyph.
    .replace(/[^\x20-\x7EÀ-ÿ]/g, '')
    .replace(/[ \t]{2,}/g, '  ');
}

/**
 * Repair letter-spaced artifacts like "S h a z e e r ,  N i k i" — lines
 * where most tokens are single characters. Words are recovered from the
 * wider (2+ space) gaps between them.
 */
function fixLetterSpacing(line: string): string {
  const tokens = line.trim().split(/\s+/);
  if (tokens.length < 10) return line;
  const singles = tokens.filter((t) => t.length === 1 && /[A-Za-z]/.test(t)).length;
  if (singles / tokens.length <= 0.6) return line;
  return line
    .trim()
    .split(/\s{2,}/)
    .map((w) => w.replace(/(?<=\S) (?=\S)/g, ''))
    .join(' ');
}

const stripInline = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

/** Renders the given markdown into a professionally formatted PDF client-side. */
export function ExportPdfButton({
  summaryId,
  topic,
  userName,
  searchDate,
  markdown,
  heading = 'AI Learning Platform — Study Notes',
  label = 'Export as PDF',
  fileSuffix = 'study-notes',
}: Props) {
  const [busy, setBusy] = useState(false);

  async function exportPdf() {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usable = pageWidth - MARGIN * 2;
      const bottomLimit = pageHeight - MARGIN - FOOTER_SPACE;
      let y = 0;

      // ── Cover header ──────────────────────────────────────────────────
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 118, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(21);
      doc.text(doc.splitTextToSize(sanitizeText(heading), usable), MARGIN, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(sanitizeText(`Topic: ${topic}`), MARGIN, 80);
      doc.text(sanitizeText(`User: ${userName}    |    Date: ${searchDate}`), MARGIN, 97);
      doc.setTextColor(30, 41, 59);
      y = 148;

      const ensureRoom = (needed: number) => {
        if (y + needed > bottomLimit) {
          doc.addPage();
          y = MARGIN;
        }
      };

      /**
       * Write a wrapped block of text. All lines share the same left edge
       * (margin + indent), so continuation lines align cleanly under the
       * first — no clipping, no overflow past the right margin.
       */
      const writeBlock = (
        text: string,
        opts: {
          size?: number;
          style?: 'normal' | 'bold' | 'italic';
          indent?: number;
          lh?: number;
        } = {},
      ) => {
        const { size = BODY_SIZE, style = 'normal', indent = 0, lh = BODY_LH } = opts;
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        const lines: string[] = doc.splitTextToSize(text, usable - indent);
        const lineH = size * lh;
        for (const ln of lines) {
          ensureRoom(lineH);
          doc.text(ln, MARGIN + indent, y + size);
          y += lineH;
        }
      };

      /** A list item with a hanging indent: marker at `indent`, text beside it. */
      const writeListItem = (marker: string, text: string, indent: number, markerBold = false) => {
        doc.setFont('helvetica', markerBold ? 'bold' : 'normal');
        doc.setFontSize(BODY_SIZE);
        const markerW = Math.max(doc.getTextWidth(`${marker} `), 14);
        const lines: string[] = doc.splitTextToSize(text, usable - indent - markerW);
        const lineH = BODY_SIZE * BODY_LH;
        ensureRoom(lineH);
        doc.text(marker, MARGIN + indent, y + BODY_SIZE);
        doc.setFont('helvetica', 'normal');
        lines.forEach((ln) => {
          ensureRoom(lineH);
          doc.text(ln, MARGIN + indent + markerW, y + BODY_SIZE);
          y += lineH;
        });
      };

      // ── Render markdown line by line ──────────────────────────────────
      const rawLines = markdown.split('\n');
      let lastWasBlank = false;

      for (const raw of rawLines) {
        const cleaned = sanitizeText(fixLetterSpacing(stripInline(raw))).trimEnd();
        const trimmed = cleaned.trim();

        if (!trimmed) {
          // Paragraph gap — collapse consecutive blanks into one.
          if (!lastWasBlank) y += 10;
          lastWasBlank = true;
          continue;
        }
        lastWasBlank = false;

        // Heading text must not include the markdown "#" markers.
        const headingText = trimmed.replace(/^#+\s*/, '');

        if (raw.startsWith('# ')) {
          // Keep heading attached to at least two lines of the section body.
          y += 18;
          ensureRoom(24 * HEADING_LH + 2 * BODY_SIZE * BODY_LH + 20);
          writeBlock(headingText, { size: 17, style: 'bold', lh: HEADING_LH });
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(1);
          doc.line(MARGIN, y + 3, MARGIN + usable, y + 3);
          y += 12;
        } else if (raw.startsWith('## ')) {
          y += 12;
          ensureRoom(15 * HEADING_LH + 2 * BODY_SIZE * BODY_LH + 12);
          writeBlock(headingText, { size: 14, style: 'bold', lh: HEADING_LH });
          y += 5;
        } else if (raw.startsWith('### ')) {
          y += 10;
          ensureRoom(13 * HEADING_LH + 2 * BODY_SIZE * BODY_LH + 10);
          writeBlock(headingText, { size: 12.5, style: 'bold', lh: HEADING_LH });
          y += 4;
        } else if (/^\s*[-*+]\s+/.test(raw)) {
          const nested = /^\s{2,}/.test(raw);
          writeListItem('-', trimmed.replace(/^[-*+]\s+/, ''), nested ? 16 : 2);
          y += 3;
        } else if (/^\s*\d+[.)]\s+/.test(raw)) {
          // Numbered item (e.g. an interview or quiz question): breathing
          // room before it, bold number, hanging indent for wrapped lines.
          const m = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
          y += 10;
          writeListItem(`${m?.[1] ?? ''}.`, m?.[2] ?? trimmed, 2, true);
          y += 3;
        } else if (/^\s*[A-D][.)]\s+/.test(trimmed)) {
          // Quiz option — indented under its question.
          writeListItem(trimmed.slice(0, 2), trimmed.replace(/^[A-D][.)]\s+/, ''), 18, true);
          y += 2;
        } else if (/^(answer|explanation)\b/i.test(trimmed)) {
          y += 4;
          writeBlock(trimmed, { indent: 18, style: 'italic' });
          y += 4;
        } else {
          writeBlock(trimmed);
          y += 4;
        }
      }

      // ── Footer page numbers ───────────────────────────────────────────
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pages}`, pageWidth / 2, pageHeight - 22, { align: 'center' });
        doc.setTextColor(30, 41, 59);
      }

      doc.save(`${topic.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${fileSuffix}.pdf`);

      // Log the export (RLS: insert own row only).
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('pdf_exports').insert({
          user_id: user.id,
          summary_id: summaryId,
          topic,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={exportPdf}
      disabled={busy}
      className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {label}
    </button>
  );
}
