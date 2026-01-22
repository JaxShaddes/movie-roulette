// ============================================
// MOVIE ROULETTE - DISCOVER TAB
// ============================================

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { TMDB_BASE_URL, GENRES } from '@/constants';
import { useAbortController } from '@/hooks';
import { normalizeMediaType } from '@/utils';
import { Button, ToggleButtons, EmptyState } from '@/components/ui';
import { OptimizedPoster } from '@/components/LazyImage';
import { CardSkeleton } from '@/components/Skeleton';
import type {
  WatchedItem,
  BacklogItem,
  MovieItem,
  TMDBData,
  MediaType,
  Language,
  DiscoverFilterMode,
  RecommendationItem,
} from '@/types';

interface DiscoverTabProps {
  watched: WatchedItem[];
  backlog: BacklogItem[];
  movies: MovieItem[];
  tvShows: MovieItem[];
  apiKey: string;
  language: Language;
  onAdd: (item: TMDBData) => void;
  onAddToWatchlist: (item: TMDBData) => void;
  onSeen: (item: TMDBData) => void;
  onInfo: (item: { tmdbData: TMDBData; title: string; type: MediaType }) => void;
  t: (key: string) => string;
}

export const DiscoverTab = memo(function DiscoverTab({
  watched,
  backlog,
  movies,
  tvShows,
  apiKey,
  language,
  onAdd,
  onAddToWatchlist,
  onSeen,
  onInfo,
  t,
}: DiscoverTabProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [topMatches, setTopMatches] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [filterMode, setFilterMode] = useState<DiscoverFilterMode>('top');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [discoverType, setDiscoverType] = useState<MediaType>('movie');
  const [page, setPage] = useState(1);
  const [antiRut, setAntiRut] = useState(false);

  const { getSignal } = useAbortController();

  const highRatedItems = useMemo(
    () => watched.filter((w) => w.rating && w.rating >= 4 && w.tmdbData),
    [watched]
  );

  // Reset when filters change
  useEffect(() => {
    setPage(1);
    setRecommendations([]);
    setTopMatches([]);
  }, [filterMode, selectedGenre, discoverType, antiRut]);

  // Fetch recommendations
  useEffect(() => {
    if (!apiKey) return;
    if (filterMode === 'top' && highRatedItems.length < 3 && !antiRut) return;

    const fetchRecs = async () => {
      setLoading(true);
      setLoadingProgress('Analysing...');
      const signal = getSignal();

      try {
        let allRecs: TMDBData[] = [];

        if (filterMode !== 'top') {
          // Genre / Soon / New - Standard Logic
          let endpoint = '';
          let params = '';

          if (filterMode === 'genre' && selectedGenre) {
            endpoint = `discover/${discoverType}`;
            params = `&with_genres=${selectedGenre}&sort_by=popularity.desc`;
          } else if (filterMode === 'soon') {
            endpoint = discoverType === 'movie' ? 'movie/upcoming' : 'tv/on_the_air';
          } else if (filterMode === 'new') {
            endpoint = discoverType === 'movie' ? 'movie/now_playing' : 'tv/airing_today';
          }

          if (endpoint) {
            const res = await fetch(
              `${TMDB_BASE_URL}/${endpoint}?api_key=${apiKey}&language=${language}&page=${page}${params}`,
              { signal }
            );
            const data = await res.json();
            if (data.results) allRecs = data.results;
          }
        } else {
          // Smart Recommendations
          if (antiRut) {
            // Random genre mode
            const genreIds = Object.keys(GENRES);
            const randomGenre = genreIds[Math.floor(Math.random() * genreIds.length)];
            const res = await fetch(
              `${TMDB_BASE_URL}/discover/${discoverType}?api_key=${apiKey}&language=${language}&with_genres=${randomGenre}&page=${page}`,
              { signal }
            );
            const data = await res.json();
            if (data.results) allRecs = data.results;
          } else {
            // Based on high-rated items
            const validSeeds = highRatedItems.filter((i) => {
              const type = normalizeMediaType(i.type);
              return type === discoverType;
            });

            const seeds = validSeeds.sort(() => 0.5 - Math.random()).slice(0, 5);
            setLoadingProgress('Checking seeds...');

            for (const seed of seeds) {
              if (!seed.tmdbData) continue;

              const type = normalizeMediaType(seed.type);
              const endpoint = type === 'movie' ? 'movie' : 'tv';

              // Get recommendations
              const mainRes = await fetch(
                `${TMDB_BASE_URL}/${endpoint}/${seed.tmdbData.id}/recommendations?api_key=${apiKey}&language=${language}`,
                { signal }
              );
              const mainData = await mainRes.json();
              if (mainData.results) {
                allRecs.push(
                  ...mainData.results.map((r: TMDBData) => ({
                    ...r,
                    seedTitle: seed.title,
                    source: 'similar' as const,
                  }))
                );
              }

              // Cast-based discovery
              if (seed.credits?.cast) {
                for (const actor of seed.credits.cast.slice(0, 2)) {
                  const personCredits = discoverType === 'tv' ? 'tv_credits' : 'movie_credits';
                  const personRes = await fetch(
                    `${TMDB_BASE_URL}/person/${actor.id}/${personCredits}?api_key=${apiKey}`,
                    { signal }
                  );
                  const personData = await personRes.json();

                  if (personData.cast) {
                    const topMovies = personData.cast
                      .filter((m: TMDBData) => m.vote_average > 7.0 && !m.genre_ids?.includes(99))
                      .sort((a: TMDBData, b: TMDBData) => (b.popularity ?? 0) - (a.popularity ?? 0))
                      .slice(0, 2);

                    allRecs.push(
                      ...topMovies.map((r: TMDBData) => ({
                        ...r,
                        source: 'cast' as const,
                        seedTitle: seed.title,
                        actorName: actor.name,
                      }))
                    );
                  }
                }
              }
            }
          }
        }

        // Dedupe and process
        const unique = [...new Map(allRecs.map((item) => [item.id, item])).values()];

        const processed: RecommendationItem[] = unique.map((r) => ({
          ...r,
          matchScore: Math.min(99, Math.round((r.vote_average ?? 0) * 10 + (r.popularity ?? 0) / 10)),
          releaseDate: new Date(r.release_date || r.first_air_date || 0),
        }));

        // Filter out owned/watched/backlog items
        const cleanMatches = processed
          .filter((r) => {
            const isOwned =
              movies.some((m) => m.tmdbData?.id === r.id) ||
              tvShows.some((t) => t.tmdbData?.id === r.id);
            const isWatched = watched.some((w) => w.tmdbData?.id === r.id);
            const isBacklog = backlog.some((b) => b.tmdbData?.id === r.id);
            return !isOwned && !isWatched && !isBacklog;
          })
          .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

        if (page === 1) {
          setRecommendations(cleanMatches);
          if (filterMode === 'top' && !antiRut) {
            setTopMatches(cleanMatches.slice(0, 10));
          }
        } else {
          setRecommendations((prev) => {
            const existingIds = new Set(prev.map((x) => x.id));
            return [...prev, ...cleanMatches.filter((x) => !existingIds.has(x.id))];
          });
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Discover error:', e);
        }
      } finally {
        setLoading(false);
        setLoadingProgress('');
      }
    };

    fetchRecs();
  }, [
    apiKey,
    language,
    page,
    filterMode,
    selectedGenre,
    discoverType,
    antiRut,
    highRatedItems,
    movies,
    tvShows,
    watched,
    backlog,
    getSignal,
  ]);

  // Real-time filtering
  const visibleRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      const isWatched = watched.some((w) => w.tmdbData?.id === r.id);
      const isBacklog = backlog.some((b) => b.tmdbData?.id === r.id);
      const isOwned =
        movies.some((m) => m.tmdbData?.id === r.id) ||
        tvShows.some((t) => t.tmdbData?.id === r.id);
      return !isWatched && !isBacklog && !isOwned;
    });
  }, [recommendations, watched, backlog, movies, tvShows]);

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      setFilterMode('genre');
      setAntiRut(false);
      setSelectedGenre(parseInt(value));
    }
  };

  const handleInfoClick = useCallback(
    (rec: RecommendationItem) => {
      onInfo({
        tmdbData: rec,
        title: rec.title || rec.name || '',
        type: discoverType,
      });
    },
    [discoverType, onInfo]
  );

  // Locked state
  if (highRatedItems.length < 3 && filterMode === 'top' && !antiRut) {
    return (
      <EmptyState
        message={`${t('DISCOVER_LOCKED')} (${highRatedItems.length}/3 rated 4+)`}
      />
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Type Toggle */}
      <ToggleButtons
        options={[
          { value: 'movie', label: t('DISC_TAB_MOVIES') },
          { value: 'tv', label: t('DISC_TAB_TV') },
        ]}
        value={discoverType}
        onChange={(v) => setDiscoverType(v as MediaType)}
      />

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
        {(['top', 'new', 'soon'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setFilterMode(m);
              setAntiRut(false);
            }}
            className={`flex-shrink-0 px-3 py-1 text-[10px] font-bold uppercase border border-black transition-colors ${
              filterMode === m && !antiRut ? 'bg-black text-[#EFEEE5]' : ''
            }`}
          >
            {m === 'top' ? t('DISC_TOP') : m === 'new' ? t('DISC_NEW') : t('DISC_SOON')}
          </button>
        ))}

        <select
          value={filterMode === 'genre' ? String(selectedGenre) : ''}
          onChange={handleGenreChange}
          className={`flex-shrink-0 px-3 py-1 text-[10px] font-bold uppercase border border-black bg-transparent outline-none ${
            filterMode === 'genre' ? 'bg-black text-[#EFEEE5]' : ''
          }`}
        >
          <option value="">{t('DISC_GENRE')}</option>
          {Object.entries(GENRES).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setFilterMode('top');
            setAntiRut(!antiRut);
          }}
          className={`flex-shrink-0 px-3 py-1 text-[10px] font-bold uppercase border border-black transition-colors ${
            antiRut ? 'bg-[#E0245E] text-white border-[#E0245E]' : 'text-gray-500'
          }`}
        >
          {t('ANTI_RUT')}
        </button>
      </div>

      {/* Loading State */}
      {loading && loadingProgress && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold uppercase text-gray-500">{loadingProgress}</p>
        </div>
      )}
      
      {/* Skeleton grid while loading initial data */}
      {loading && !loadingProgress && visibleRecommendations.length === 0 && (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Top Matches Carousel */}
      {topMatches.length > 0 && !antiRut && filterMode === 'top' && (
        <div>
          <h3 className="font-bold uppercase text-xs mb-2 tracking-widest text-[#1D9BF0]">
            {t('DISC_TOP')}
          </h3>
          <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
            {topMatches.map((m) => (
              <button
                key={m.id}
                onClick={() => handleInfoClick(m)}
                className="w-28 flex-shrink-0 relative text-left"
              >
                <OptimizedPoster
                  path={m.poster_path}
                  alt={m.title || m.name || ''}
                  size="lg"
                  className="w-full h-40 border border-black"
                />
                <div className="absolute top-0 right-0 bg-[#1D9BF0] text-white text-[9px] font-bold px-1">
                  {m.matchScore}%
                </div>
                {m.source && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[7px] font-bold px-1 py-0.5 uppercase truncate">
                    {m.source === 'cast'
                      ? `★ ${m.actorName?.split(' ')[0]}`
                      : m.source === 'director'
                        ? `🎬 ${m.directorName?.split(' ')[1] || 'Dir'}`
                        : m.source}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-2 gap-4">
        {visibleRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="border border-black bg-black text-[#EFEEE5] flex flex-col h-full animate-fade-in"
          >
            <button
              className="relative aspect-[2/3] w-full"
              onClick={() => handleInfoClick(rec)}
            >
              <OptimizedPoster
                path={rec.poster_path}
                alt={rec.title || rec.name || ''}
                size="lg"
                className="w-full h-full"
              />
              <div className="absolute top-2 right-2 bg-[#1D9BF0] text-white text-[10px] font-bold px-1.5 py-0.5">
                {rec.matchScore}%
              </div>
            </button>

            <div className="p-2 flex flex-col gap-2 flex-1">
              <p className="font-bold text-[10px] uppercase leading-tight line-clamp-2 flex-1">
                {rec.title || rec.name}
              </p>

              {(rec.seedTitle || rec.source) && (
                <p className="text-[8px] text-gray-400 truncate">
                  {rec.source === 'cast' && rec.actorName
                    ? `★ ${rec.actorName}`
                    : rec.source === 'director' && rec.directorName
                      ? `🎬 ${rec.directorName}`
                      : rec.seedTitle
                        ? `${t('BECAUSE')} ${rec.seedTitle}`
                        : ''}
                </p>
              )}

              <div className="grid grid-cols-2 gap-1 mt-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAdd(rec)}
                  className="bg-[#EFEEE5] text-black hover:bg-white"
                >
                  + ADD
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddToWatchlist(rec)}
                  className="border-[#EFEEE5] text-[#EFEEE5] hover:bg-[#EFEEE5] hover:text-black"
                >
                  {t('BTN_ADD_WATCHLIST')}
                </Button>
              </div>
              <button
                onClick={() => onSeen(rec)}
                className="py-1 bg-gray-800 text-gray-400 text-[8px] font-bold uppercase hover:text-white text-center w-full"
              >
                ✓ {t('BTN_SEEN')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {visibleRecommendations.length > 0 && !loading && (
        <Button
          variant="secondary"
          size="lg"
          onClick={() => setPage((p) => p + 1)}
          className="w-full"
        >
          {t('BTN_LOAD_MORE')}
        </Button>
      )}

      {loading && !loadingProgress && visibleRecommendations.length > 0 && (
        <div className="p-4 text-center text-xs animate-pulse font-bold">
          {t('DISCOVER_EMPTY')}
        </div>
      )}
    </div>
  );
});
