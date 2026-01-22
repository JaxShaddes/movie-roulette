// ============================================
// MOVIE ROULETTE - PROFILE STATS COMPONENT
// ============================================

import { useMemo, memo } from 'react';
import { GENRES } from '@/constants';
import { PosterImage } from './ui';
import type { WatchedItem } from '@/types';

interface ProfileStatsProps {
  watched: WatchedItem[];
  t: (key: string) => string;
}

interface ActorData {
  count: number;
  img: string | null;
}

export const ProfileStats = memo(function ProfileStats({ watched, t }: ProfileStatsProps) {
  const stats = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    const actorCounts: Record<string, ActorData> = {};
    const directorCounts: Record<string, number> = {};

    watched.forEach((item) => {
      // Count genres
      if (item.tmdbData?.genre_ids) {
        item.tmdbData.genre_ids.forEach((id) => {
          const genreName = GENRES[id];
          if (genreName) {
            genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
          }
        });
      }

      // Count actors and directors from credits
      if (item.credits) {
        item.credits.cast?.forEach((c) => {
          if (!actorCounts[c.name]) {
            actorCounts[c.name] = { count: 0, img: c.profile_path };
          }
          actorCounts[c.name].count += 1;
        });

        if (item.credits.director) {
          const dirName = item.credits.director.name;
          directorCounts[dirName] = (directorCounts[dirName] || 0) + 1;
        }
      }
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topActors = Object.entries(actorCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4);

    const topDirectors = Object.entries(directorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const total = watched.length;
    const ratedItems = watched.filter((w) => w.rating && typeof w.rating === 'number');
    const avgScore =
      ratedItems.length > 0
        ? (ratedItems.reduce((a, b) => a + (b.rating ?? 0), 0) / ratedItems.length).toFixed(1)
        : '-';

    return { topGenres, topActors, topDirectors, total, avgScore };
  }, [watched]);

  const maxGenreCount = stats.topGenres[0]?.[1] || 1;

  return (
    <div className="mb-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black text-[#EFEEE5] p-4 text-center">
          <div className="text-3xl font-black">{stats.total}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            {t('STATS_TOTAL')}
          </div>
        </div>
        <div className="bg-white border-2 border-black p-4 text-center">
          <div className="text-3xl font-black">{stats.avgScore}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            {t('STATS_RATING')}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Genres */}
        {stats.topGenres.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-xs mb-3 tracking-widest text-gray-500">
              {t('STATS_GENRE')}
            </h3>
            <div className="space-y-2">
              {stats.topGenres.map(([genre, count], i) => (
                <div key={genre} className="flex items-center gap-2">
                  <div className="w-6 text-xs font-bold text-gray-400">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold uppercase mb-1">
                      <span>{genre}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 bg-gray-200 w-full">
                      <div
                        className="h-full bg-black transition-all"
                        style={{ width: `${(count / maxGenreCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Actors */}
        {stats.topActors.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-xs mb-3 tracking-widest text-gray-500">
              {t('TOP_ACTORS')}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {stats.topActors.map(([name, data]) => (
                <div key={name} className="flex-shrink-0 text-center w-16">
                  <PosterImage
                    path={data.img}
                    alt={name}
                    size="md"
                    className="w-16 h-16 rounded-full object-cover border-2 border-black mb-1"
                  />
                  <p className="text-[9px] font-bold uppercase leading-tight truncate">
                    {name}
                  </p>
                  <p className="text-[8px] text-gray-500">{data.count} movies</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Directors */}
        {stats.topDirectors.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-xs mb-3 tracking-widest text-gray-500">
              {t('TOP_DIRECTORS')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.topDirectors.map(([name, count]) => (
                <div
                  key={name}
                  className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-[10px] font-bold uppercase"
                >
                  {name} <span className="text-gray-500 ml-1">({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
