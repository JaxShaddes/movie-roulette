// ============================================
// MOVIE ROULETTE - SWIPE TAB
// ============================================

import { useState, useEffect, useCallback, memo } from 'react';
import { TMDB_BASE_URL } from '@/constants';
import { useAbortController } from '@/hooks';
import { vibrate, playSwipe } from '@/utils';
import { Icons, ToggleButtons, PosterImage, Spinner, EmptyState, Button } from '@/components/ui';
import type {
  WatchedItem,
  BacklogItem,
  MovieItem,
  TMDBData,
  MediaType,
  Language,
} from '@/types';

interface SwipeTabProps {
  watched: WatchedItem[];
  backlog: BacklogItem[];
  movies: MovieItem[];
  tvShows: MovieItem[];
  blacklist: number[];
  apiKey: string;
  language: Language;
  soundEnabled: boolean;
  onAddToWatchlist: (item: TMDBData) => void;
  onSeen: (item: TMDBData) => void;
  onBlacklist: (id: number) => void;
  onInfo: (item: { tmdbData: TMDBData; title: string; type: MediaType }) => void;
  t: (key: string) => string;
}

type StampType = 'love' | 'nope' | 'seen' | null;

export const SwipeTab = memo(function SwipeTab({
  watched,
  backlog,
  movies,
  tvShows,
  blacklist,
  apiKey,
  language,
  soundEnabled,
  onAddToWatchlist,
  onSeen,
  onBlacklist,
  onInfo,
  t,
}: SwipeTabProps) {
  const [queue, setQueue] = useState<TMDBData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [swipeType, setSwipeType] = useState<MediaType>('movie');
  const [showStamp, setShowStamp] = useState<StampType>(null);

  // Touch state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const { getSignal } = useAbortController();

  // Reset queue when type changes
  useEffect(() => {
    setQueue([]);
    setPage(1);
  }, [swipeType]);

  // Fetch more cards when queue is low
  useEffect(() => {
    if (queue.length > 2 || !apiKey) return;

    const fetchBatch = async () => {
      setLoading(true);
      const signal = getSignal();

      try {
        const type = swipeType === 'movie' ? 'movie' : 'tv';
        const endpoint = page % 2 === 0 ? 'top_rated' : 'popular';

        const res = await fetch(
          `${TMDB_BASE_URL}/${type}/${endpoint}?api_key=${apiKey}&language=${language}&page=${page}`,
          { signal }
        );
        const data = await res.json();

        if (data.results) {
          const newItems = data.results.filter((item: TMDBData) => {
            const isOwned =
              movies.some((m) => m.tmdbData?.id === item.id) ||
              tvShows.some((t) => t.tmdbData?.id === item.id);
            const isWatched = watched.some((w) => w.tmdbData?.id === item.id);
            const isBacklog = backlog.some((b) => b.tmdbData?.id === item.id);
            const isBlacklisted = blacklist.includes(item.id);
            const isInQueue = queue.some((q) => q.id === item.id);

            return !isOwned && !isWatched && !isBacklog && !isBlacklisted && !isInQueue;
          });

          setQueue((prev) => [...prev, ...newItems]);
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Swipe fetch error:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [queue.length, apiKey, language, page, swipeType, movies, tvShows, backlog, watched, blacklist, getSignal]);

  const handleAction = useCallback(
    (action: 'nope' | 'like' | 'seen') => {
      if (queue.length === 0) return;

      const item = queue[0];

      setShowStamp(action === 'nope' ? 'nope' : action === 'like' ? 'love' : 'seen');
      if (soundEnabled) playSwipe();
      vibrate(10);

      setTimeout(() => {
        if (action === 'nope') {
          onBlacklist(item.id);
        } else if (action === 'like') {
          onAddToWatchlist(item);
        } else if (action === 'seen') {
          onSeen(item);
        }

        setQueue((prev) => prev.slice(1));
        setShowStamp(null);

        if (queue.length < 5) {
          setPage((p) => p + 1);
        }
      }, 300);
    },
    [queue, soundEnabled, onBlacklist, onAddToWatchlist, onSeen]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleAction('nope');
    if (isRightSwipe) handleAction('like');
  };

  const currentCard = queue[0];

  return (
    <div className="flex flex-col h-[75vh] items-center justify-center relative">
      {/* Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex justify-center items-center p-4 bg-[#EFEEE5]/80 backdrop-blur-sm border-b-2 border-black/10">
        <ToggleButtons
          options={[
            { value: 'movie', label: t('DISC_TAB_MOVIES') },
            { value: 'tv', label: t('DISC_TAB_TV') },
          ]}
          value={swipeType}
          onChange={(v) => setSwipeType(v as MediaType)}
          className="mr-4"
        />
        <h1 className="text-xl font-black uppercase">{t('SWIPE_TITLE')}</h1>
      </div>

      {currentCard ? (
        <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center relative animate-slide-up mt-12">
          {/* Card */}
          <div
            className="relative w-full aspect-[2/3] border-[6px] border-black bg-black shadow-2xl touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
          >
            <PosterImage
              path={currentCard.poster_path}
              alt={currentCard.title || currentCard.name || ''}
              size="xl"
              className="w-full h-full pointer-events-none"
            />

            {/* Stamps */}
            <div
              className={`stamp-love ${showStamp === 'love' ? 'show' : ''}`}
              aria-hidden="true"
            >
              LOVE
            </div>
            <div
              className={`stamp-nope ${showStamp === 'nope' ? 'show' : ''}`}
              aria-hidden="true"
            >
              NOPE
            </div>

            {/* Info Button */}
            <button
              onClick={() =>
                onInfo({
                  tmdbData: currentCard,
                  title: currentCard.title || currentCard.name || '',
                  type: swipeType,
                })
              }
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-2 border-white/50 text-white rounded-full p-2 hover:bg-white hover:text-black transition-colors z-10 shadow-lg"
              aria-label="View info"
            >
              <Icons.Info />
            </button>

            {/* Info Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-24 text-[#EFEEE5] pointer-events-none">
              <h2 className="text-2xl font-black uppercase leading-none mb-1">
                {currentCard.title || currentCard.name}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {(currentCard.release_date || currentCard.first_air_date || '').split('-')[0]} •
                ★ {currentCard.vote_average?.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 mt-8">
            <button
              onClick={() => handleAction('nope')}
              className="w-16 h-16 rounded-full border-4 border-black bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
              aria-label="Dislike"
            >
              <Icons.ThumbDown />
            </button>
            <button
              onClick={() => handleAction('like')}
              className="w-20 h-20 rounded-full border-4 border-black bg-black text-[#EFEEE5] flex items-center justify-center hover:scale-105 transition-transform shadow-xl -mt-2"
              aria-label="Like"
            >
              <Icons.Heart />
            </button>
            <button
              onClick={() => handleAction('seen')}
              className="w-16 h-16 rounded-full border-4 border-black bg-[#1D9BF0] text-white flex items-center justify-center hover:bg-[#1A8CD8] transition-colors shadow-lg"
              aria-label="Already seen"
            >
              <Icons.Eye />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-10 max-w-xs">
          {loading ? (
            <Spinner className="mx-auto mb-4" />
          ) : (
            <div>
              <EmptyState message={t('SWIPE_EMPTY')} />
              <Button
                variant="primary"
                size="md"
                onClick={() => setPage((p) => p + 1)}
                className="mt-4"
              >
                {t('BTN_LOAD_MORE')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
