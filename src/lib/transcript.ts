import 'server-only';

import { YoutubeTranscript } from 'youtube-transcript';

const MAX_TRANSCRIPT_CHARS = 12_000;

/**
 * Best-effort transcript for a video. Tries the transcript API (which also
 * covers auto-generated captions); returns null when nothing is available so
 * the caller can fall back to title/metadata-based notes.
 */
export async function getTranscript(youtubeId: string): Promise<string | null> {
  try {
    const items = await YoutubeTranscript.fetchTranscript(youtubeId);
    if (!items?.length) return null;
    const text = items
      .map((i) => i.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return null;
    return text.length > MAX_TRANSCRIPT_CHARS ? `${text.slice(0, MAX_TRANSCRIPT_CHARS)} …` : text;
  } catch {
    return null; // no transcript and no captions — caller falls back
  }
}
