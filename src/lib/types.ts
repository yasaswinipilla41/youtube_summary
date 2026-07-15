export type Role = 'admin' | 'student';

export interface UserProfile {
  id: string;
  google_id: string | null;
  name: string | null;
  email: string;
  photo: string | null;
  role: Role;
  created_at: string;
  last_login: string;
}

export interface Search {
  id: string;
  user_id: string;
  topic: string;
  processing_time_ms: number | null;
  created_at: string;
}

export interface Video {
  id: string;
  search_id: string;
  youtube_id: string;
  title: string;
  youtube_url: string;
  thumbnail: string | null;
  channel: string | null;
  duration: string | null;
  views: number | null;
  published_at: string | null;
}

export interface Summary {
  id: string;
  user_id: string;
  search_id: string;
  topic: string;
  summary: string;
  pdf_url: string | null;
  created_at: string;
}

export interface TokenUsage {
  id: string;
  user_id: string;
  search_id: string | null;
  topic: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
}

export interface YouTubeVideoMeta {
  youtubeId: string;
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  duration: string;
  views: number;
  publishedAt: string;
}
