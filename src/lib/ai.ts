import 'server-only';

import OpenAI from 'openai';
import type { YouTubeVideoMeta } from '@/lib/types';

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

export interface TokenCount {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface VideoDigest {
  video: YouTubeVideoMeta;
  digest: string;
  hadTranscript: boolean;
}

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  return new OpenAI({ apiKey });
}

function addUsage(total: TokenCount, usage?: OpenAI.CompletionUsage | null) {
  if (!usage) return;
  total.promptTokens += usage.prompt_tokens ?? 0;
  total.completionTokens += usage.completion_tokens ?? 0;
  total.totalTokens += usage.total_tokens ?? 0;
}

/**
 * Stage 1 — condense one video (transcript or metadata) into key points.
 * Kept short so ten of these fit comfortably into the combine prompt.
 */
export async function digestVideo(
  video: YouTubeVideoMeta,
  transcript: string | null,
  tokens: TokenCount,
): Promise<VideoDigest> {
  const openai = getClient();

  const source = transcript
    ? `Transcript (may be auto-generated, tolerate errors):\n${transcript}`
    : `No transcript is available. Use the title, channel, and your own knowledge of this well-known topic to infer what such a tutorial covers.`;

  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert technical educator. Extract the substantive teaching content from a YouTube video for later merging into study notes. Output concise markdown: key concepts, explanations, examples, and notable tips. No preamble.',
      },
      {
        role: 'user',
        content: `Video: "${video.title}" by ${video.channel} (${video.duration})\n\n${source}`,
      },
    ],
    max_tokens: 700,
  });

  addUsage(tokens, res.usage);
  return {
    video,
    digest: res.choices[0]?.message?.content ?? '',
    hadTranscript: Boolean(transcript),
  };
}

/**
 * Stage 2 — merge all video digests into one deduplicated, structured study
 * document following the platform's required section layout.
 */
export async function combineNotes(
  topic: string,
  digests: VideoDigest[],
  tokens: TokenCount,
): Promise<string> {
  const openai = getClient();

  const corpus = digests
    .map((d, i) => `--- Video ${i + 1}: "${d.video.title}" (${d.video.channel}) ---\n${d.digest}`)
    .join('\n\n');

  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `You are an expert curriculum author. Merge notes from multiple videos on the same topic into ONE high-quality study document. Remove duplicate content, resolve contradictions, and organize logically. The result must be better than any single video's notes.

Output GitHub-flavored markdown with EXACTLY these top-level sections, in this order:

# Overview
Short introduction to the topic.

# Key Concepts
The important concepts, each named and defined in one line.

# Detailed Explanation
Explain each key concept in depth.

# Examples
Real-world examples (code where appropriate).

# Important Points
A bullet list of must-remember points.

# Interview Questions
8-12 realistic interview questions with brief model answers.

# Quiz
Exactly 10 multiple-choice questions, options A-D, with an answer key at the end.

# Practical Exercises
3-5 hands-on tasks of increasing difficulty.

# Resources
Additional learning resources (official docs, books, courses).`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}\n\nNotes extracted from ${digests.length} videos:\n\n${corpus}`,
      },
    ],
    max_tokens: 4000,
  });

  addUsage(tokens, res.usage);
  return res.choices[0]?.message?.content ?? '';
}
