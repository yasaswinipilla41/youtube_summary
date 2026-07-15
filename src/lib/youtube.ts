import 'server-only';

import type { YouTubeVideoMeta } from '@/lib/types';

const API = 'https://www.googleapis.com/youtube/v3';

/** ISO 8601 duration (PT1H2M3S) → "1:02:03". */
export function formatDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return iso;
  const [, h, min, s] = m;
  const parts = [h, h ? (min ?? '0').padStart(2, '0') : (min ?? '0'), (s ?? '0').padStart(2, '0')];
  return parts.filter((p) => p !== undefined && p !== null && p !== '').join(':') || '0:00';
}

/**
 * Search YouTube for the topic and return the top `limit` videos with full
 * metadata (title, thumbnail, channel, duration, views, published date, URL).
 */
export async function searchYouTube(topic: string, limit = 10): Promise<YouTubeVideoMeta[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY is not configured');

  const searchUrl = new URL(`${API}/search`);
  searchUrl.search = new URLSearchParams({
    part: 'snippet',
    q: `${topic} tutorial`,
    type: 'video',
    maxResults: String(limit),
    order: 'relevance',
    relevanceLanguage: 'en',
    videoCaption: 'any',
    key,
  }).toString();

  const searchRes = await fetch(searchUrl, { cache: 'no-store' });
  if (!searchRes.ok) {
    throw new Error(`YouTube search failed (${searchRes.status}): ${await searchRes.text()}`);
  }
  const searchJson = await searchRes.json();
  const ids: string[] = (searchJson.items ?? [])
    .map((i: { id?: { videoId?: string } }) => i.id?.videoId)
    .filter(Boolean);

  if (ids.length === 0) return [];

  const detailsUrl = new URL(`${API}/videos`);
  detailsUrl.search = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: ids.join(','),
    key,
  }).toString();

  const detailsRes = await fetch(detailsUrl, { cache: 'no-store' });
  if (!detailsRes.ok) {
    throw new Error(`YouTube details failed (${detailsRes.status}): ${await detailsRes.text()}`);
  }
  const detailsJson = await detailsRes.json();

  return (detailsJson.items ?? []).map(
    (v: {
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } };
      };
      contentDetails: { duration: string };
      statistics?: { viewCount?: string };
    }) => ({
      youtubeId: v.id,
      title: v.snippet.title,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      thumbnail:
        v.snippet.thumbnails?.high?.url ??
        v.snippet.thumbnails?.medium?.url ??
        v.snippet.thumbnails?.default?.url ??
        '',
      channel: v.snippet.channelTitle,
      duration: formatDuration(v.contentDetails.duration),
      views: Number(v.statistics?.viewCount ?? 0),
      publishedAt: v.snippet.publishedAt,
    }),
  );
}
