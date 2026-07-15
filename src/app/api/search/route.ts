import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { searchYouTube } from '@/lib/youtube';
import { getTranscript } from '@/lib/transcript';
import { digestVideo, combineNotes, type TokenCount, type VideoDigest } from '@/lib/ai';

// Processing 10 videos + AI generation takes a while.
export const maxDuration = 300;

// Digest a few videos at a time — free-tier providers (Groq) have
// per-minute token limits that 10 simultaneous calls would blow through.
const DIGEST_CONCURRENCY = 3;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: 'fulfilled', value: await fn(items[i]) };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let topic: string;
  try {
    const body = await request.json();
    topic = String(body.topic ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!topic || topic.length > 200) {
    return NextResponse.json({ error: 'Topic must be 1-200 characters' }, { status: 400 });
  }

  const startedAt = Date.now();
  const tokens: TokenCount = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  try {
    // 1. Record the search (RLS: insert own row only).
    const { data: search, error: searchErr } = await supabase
      .from('searches')
      .insert({ user_id: user.id, topic })
      .select('id')
      .single();
    if (searchErr || !search) throw new Error(searchErr?.message ?? 'Failed to create search');

    // 2. Top 10 YouTube videos with full metadata.
    const videos = await searchYouTube(topic, 10);
    if (videos.length === 0) {
      return NextResponse.json({ error: 'No YouTube videos found for this topic' }, { status: 404 });
    }

    await supabase.from('videos').insert(
      videos.map((v) => ({
        search_id: search.id,
        youtube_id: v.youtubeId,
        title: v.title,
        youtube_url: v.url,
        thumbnail: v.thumbnail,
        channel: v.channel,
        duration: v.duration,
        views: v.views,
        published_at: v.publishedAt,
      })),
    );

    // 3. Transcript (or captions) → per-video digest, rate-limit-friendly.
    const digestResults = await mapWithConcurrency(videos, DIGEST_CONCURRENCY, async (video) => {
      const transcript = await getTranscript(video.youtubeId);
      return digestVideo(video, transcript, tokens);
    });
    const digests = digestResults
      .filter((r): r is PromiseFulfilledResult<VideoDigest> => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((d) => d.digest.trim().length > 0);

    if (digests.length === 0) {
      const firstFailure = digestResults.find(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      );
      const cause =
        firstFailure?.reason instanceof Error
          ? firstFailure.reason.message
          : String(firstFailure?.reason ?? 'unknown error');
      throw new Error(`Could not generate notes from any of the videos — ${cause}`);
    }

    // 4. Merge into one deduplicated study document.
    const combined = await combineNotes(topic, digests, tokens);

    // 5. Persist summary (RLS) and token usage (server-write-only table).
    const { data: summary, error: summaryErr } = await supabase
      .from('summaries')
      .insert({ user_id: user.id, search_id: search.id, topic, summary: combined })
      .select('id')
      .single();
    if (summaryErr || !summary) throw new Error(summaryErr?.message ?? 'Failed to save summary');

    const admin = createAdminClient();
    await admin.from('token_usage').insert({
      user_id: user.id,
      search_id: search.id,
      topic,
      prompt_tokens: tokens.promptTokens,
      completion_tokens: tokens.completionTokens,
      total_tokens: tokens.totalTokens,
    });

    const processingMs = Date.now() - startedAt;
    await supabase
      .from('searches')
      .update({ processing_time_ms: processingMs })
      .eq('id', search.id);

    return NextResponse.json({
      summaryId: summary.id,
      searchId: search.id,
      videosProcessed: digests.length,
      totalTokens: tokens.totalTokens,
      processingMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
