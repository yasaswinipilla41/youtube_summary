import Image from 'next/image';
import { Eye, Clock } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import type { Video } from '@/lib/types';

export function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-900">
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-100">
          {video.title}
        </h3>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{video.channel}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {formatNumber(video.views)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {formatDate(video.published_at)}
          </span>
        </div>
      </div>
    </a>
  );
}
