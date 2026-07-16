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
      const margin = 48;
      const usable = pageWidth - margin * 2;
      let y = 0;

      // Cover header
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 120, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(heading, margin, 52);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Topic: ${topic}`, margin, 78);
      doc.text(`User: ${userName}    |    Date: ${searchDate}`, margin, 96);
      doc.setTextColor(30, 41, 59);
      y = 150;

      const newPageIfNeeded = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Simple markdown → PDF rendering (headings, bullets, paragraphs).
      const lines = markdown.split('\n');
      for (const raw of lines) {
        const line = raw.trimEnd();
        if (!line.trim()) {
          y += 6;
          continue;
        }

        let text = line;
        let fontSize = 10.5;
        let style: 'normal' | 'bold' = 'normal';
        let indent = 0;
        let gapBefore = 0;

        if (line.startsWith('# ')) {
          text = line.slice(2);
          fontSize = 16;
          style = 'bold';
          gapBefore = 16;
        } else if (line.startsWith('## ')) {
          text = line.slice(3);
          fontSize = 13;
          style = 'bold';
          gapBefore = 12;
        } else if (line.startsWith('### ')) {
          text = line.slice(4);
          fontSize = 11.5;
          style = 'bold';
          gapBefore = 8;
        } else if (/^\s*[-*]\s+/.test(line)) {
          text = `•  ${line.replace(/^\s*[-*]\s+/, '')}`;
          indent = 12;
        } else if (/^\s*\d+\.\s+/.test(line)) {
          indent = 12;
        }

        // Strip inline markdown tokens for clean PDF text.
        text = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\*(.+?)\*/g, '$1');

        doc.setFont('helvetica', style);
        doc.setFontSize(fontSize);
        const wrapped: string[] = doc.splitTextToSize(text, usable - indent);
        const lineHeight = fontSize * 1.35;

        y += gapBefore;
        newPageIfNeeded(wrapped.length * lineHeight);

        if (fontSize === 16) {
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(1);
          doc.line(margin, y + 6, margin + usable, y + 6);
          y += 12;
        }

        for (const w of wrapped) {
          newPageIfNeeded(lineHeight);
          doc.text(w, margin + indent, y + fontSize);
          y += lineHeight;
        }
      }

      // Footer page numbers
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pages}`, pageWidth / 2, pageHeight - 24, { align: 'center' });
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
