// ============================================
// MOVIE ROULETTE - MAIN APP COMPONENT
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TMDB_BASE_URL, POSTER_CACHE_LIMIT } from './constants';
import {
  useAppState,
  useTranslation,
  useToast,
  useRoulette,
  usePosterCache,
} from './hooks';
import {
  generateId,
  vibrate,
  normalizeMediaType,
  getCredits,
} from './utils';

// Components
import { Icons, ToastContainer, Confetti, VerifiedBadge } from './components/ui';
import { MovieDetailPage } from './components/MovieDetailPage';
import { RateModal } from './components/RateModal';

// Tabs
import { HomeTab } from './tabs/HomeTab';
import { WatchlistTab, HistoryTab } from './tabs/LibraryTabs';
import { DiscoverTab } from './tabs/DiscoverTab';
import { SwipeTab } from './tabs/SwipeTab';
import { SettingsTab } from './tabs/SettingsTab';

import type {
  TabType,
  MediaType,
  Filters,
  MovieItem,
  WatchedItem,
  BacklogItem,
  TMDBData,
  CuratorPick,
  RateModalItem,
} from './types';

export function App() {
  // App State from custom hook
  const {
    movies,
    setMovies,
    tvShows,
    setTvShows,
    backlog,
    setBacklog,
    watched,
    setWatched,
    blacklist,
    setBlacklist,
    apiKey,
    setApiKey,
    language,
    setLanguage,
    soundEnabled,
    setSoundEnabled,
    winCount,
    setWinCount,
  } = useAppState();

  // UI State
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [homeMode, setHomeMode] = useState<MediaType>('movie');
  const [filters, setFilters] = useState<Filters>({ genres: [], time: null });
  const [selectedItem, setSelectedItem] = useState<MovieItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rateModalItem, setRateModalItem] = useState<RateModalItem | null>(null);
  const [infoItem, setInfoItem] = useState<{
    tmdbData: TMDBData | null;
    title: string;
    type?: string;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [curatorPick, setCuratorPick] = useState<CuratorPick | null>(null);

  // Hooks
  const { t } = useTranslation(language);
  const { toasts, showToast } = useToast();

  // Current list based on mode
  const currentList = homeMode === 'movie' ? movies : tvShows;

  // Filter logic for roulette
  const visibleCandidates = useMemo(() => {
    return currentList.filter((item) => {
      if (!item.included) return false;

      if (filters.genres.length === 0 && !filters.time) return true;
      if (!item.tmdbData) return true;

      // Genre filter
      if (filters.genres.length > 0) {
        const itemGenres = item.tmdbData.genre_ids || [];
        if (!filters.genres.some((id) => itemGenres.includes(id))) {
          return false;
        }
      }

      // Time filter
      if (filters.time && item.tmdbData.runtime) {
        const runtime = item.tmdbData.runtime;
        if (filters.time === 'short' && runtime > 90) return false;
        if (filters.time === 'medium' && (runtime <= 90 || runtime > 120)) return false;
        if (filters.time === 'long' && runtime <= 120) return false;
      }

      return true;
    });
  }, [currentList, filters]);

  // Roulette hook
  const handleWin = useCallback(
    (winner: MovieItem) => {
      setSelectedItem(winner);
      setShowResult(true);
      setShowConfetti(true);
      setWinCount((c) => c + 1);
      setTimeout(() => setShowConfetti(false), 4000);
    },
    [setWinCount]
  );

  const { isSpinning, spinningText, spin } = useRoulette({
    candidates: visibleCandidates,
    onWin: handleWin,
    soundEnabled,
  });

  // Cache posters
  usePosterCache([...movies, ...tvShows, ...backlog, ...watched], POSTER_CACHE_LIMIT);

  // Curator Pick - filters out already watched/owned movies
  useEffect(() => {
    if (watched.length < 5 || curatorPick || !apiKey) return;

    const highRated = watched.filter((w) => w.rating && w.rating >= 4 && w.tmdbData);
    if (highRated.length === 0) return;

    const today = new Date().getDate();
    const seed = highRated[today % highRated.length];

    const fetchCurator = async () => {
      try {
        const type = normalizeMediaType(seed.type);
        const endpoint = type === 'movie' ? 'movie' : 'tv';
        const res = await fetch(
          `${TMDB_BASE_URL}/${endpoint}/${seed.tmdbData!.id}/recommendations?api_key=${apiKey}&language=${language}`
        );
        const data = await res.json();

        if (data.results?.length > 0) {
          // Filter out movies that are already watched, in backlog, or in lists
          const validPick = data.results.find((item: TMDBData) => {
            const isWatched = watched.some((w) => w.tmdbData?.id === item.id);
            const isInBacklog = backlog.some((b) => b.tmdbData?.id === item.id);
            const isInMovies = movies.some((m) => m.tmdbData?.id === item.id);
            const isInTvShows = tvShows.some((t) => t.tmdbData?.id === item.id);
            return !isWatched && !isInBacklog && !isInMovies && !isInTvShows;
          });

          if (validPick) {
            setCuratorPick({
              item: validPick,
              because: seed.title,
              reason: t('BECAUSE'),
            });
          }
        }
      } catch (e) {
        console.error('Curator fetch error:', e);
      }
    };

    fetchCurator();
  }, [watched, backlog, movies, tvShows, apiKey, language, curatorPick, t]);

  // Reset filters when mode changes
  useEffect(() => {
    setFilters({ genres: [], time: null });
  }, [homeMode]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAdd = useCallback(
    (title: string, metadata: TMDBData | null) => {
      vibrate(10);
      if (!title?.trim()) return;

      const type: MediaType = metadata?.media_type
        ? normalizeMediaType(metadata.media_type)
        : homeMode;

      const targetList = type === 'tv' ? tvShows : movies;

      // Check for duplicates
      if (
        targetList.some(
          (i) =>
            (metadata && i.tmdbData?.id === metadata.id) ||
            i.title.toLowerCase() === title.toLowerCase()
        )
      ) {
        showToast(t('TOAST_EXIST'));
        return;
      }

      const newItem: MovieItem = {
        id: generateId(),
        title: metadata?.title || metadata?.name || title,
        included: true,
        tmdbData: metadata,
        type,
      };

      if (type === 'tv') {
        setTvShows((prev) => [...prev, newItem]);
      } else {
        setMovies((prev) => [...prev, newItem]);
      }

      showToast(t('TOAST_ADDED'));
    },
    [homeMode, movies, tvShows, setMovies, setTvShows, showToast, t]
  );

  const handleAddRecommendation = useCallback(
    (item: TMDBData) => {
      const title = item.title || item.name || '';
      const type: MediaType = item.name && !item.title ? 'tv' : 'movie';
      handleAdd(title, { ...item, media_type: type });
    },
    [handleAdd]
  );

  const handleAddToWatchlist = useCallback(
    (item: TMDBData) => {
      vibrate(10);

      if (backlog.some((b) => b.tmdbData?.id === item.id)) {
        showToast(t('TOAST_EXIST'));
        return;
      }

      const type: MediaType = item.name && !item.title ? 'tv' : 'movie';

      const newItem: BacklogItem = {
        id: generateId(),
        title: item.title || item.name || '',
        included: true,
        tmdbData: item,
        type,
      };

      setBacklog((prev) => [...prev, newItem]);
      showToast(t('TOAST_ADDED_WATCHLIST'));
    },
    [backlog, setBacklog, showToast, t]
  );

  const handleSeenRecommendation = useCallback(
    (item: TMDBData) => {
      vibrate(10);
      const type: MediaType = item.name && !item.title ? 'tv' : 'movie';

      // Check if already in watched list by TMDB ID
      const alreadyWatched = watched.some((w) => w.tmdbData?.id === item.id);
      if (alreadyWatched) {
        showToast(t('TOAST_EXIST'));
        return;
      }

      setRateModalItem({
        id: generateId(),
        title: item.title || item.name || '',
        tmdbData: item,
        type,
        _isSeenAction: true,
      });
    },
    [watched, showToast, t]
  );

  const handleBlacklist = useCallback(
    (id: number) => {
      setBlacklist((prev) => [...prev, id]);
    },
    [setBlacklist]
  );

  const handlePromoteFromWatchlist = useCallback(
    (item: BacklogItem) => {
      setBacklog((prev) => prev.filter((i) => i.id !== item.id));
      handleAdd(item.title, item.tmdbData);
    },
    [setBacklog, handleAdd]
  );

  const handleToggleIncluded = useCallback(
    (id: string, type: MediaType) => {
      const updater = (prev: MovieItem[]) =>
        prev.map((i) => (i.id === id ? { ...i, included: !i.included } : i));

      if (type === 'tv') {
        setTvShows(updater);
      } else {
        setMovies(updater);
      }
    },
    [setMovies, setTvShows]
  );

  const handleDeleteItem = useCallback(
    (id: string, type: MediaType | 'backlog' | 'history') => {
      vibrate(10);

      if (type === 'backlog') {
        setBacklog((prev) => prev.filter((i) => i.id !== id));
      } else if (type === 'history') {
        setWatched((prev) => prev.filter((i) => i.id !== id));
      } else if (type === 'tv') {
        setTvShows((prev) => prev.filter((i) => i.id !== id));
      } else {
        setMovies((prev) => prev.filter((i) => i.id !== id));
      }
    },
    [setBacklog, setWatched, setMovies, setTvShows]
  );

  const handleUpdateWatchedDate = useCallback(
    (id: string, dateStr: string) => {
      const newDate = new Date(dateStr + 'T12:00:00').toISOString();
      setWatched((prev) =>
        prev.map((w) => (w.id === id ? { ...w, watchedDate: newDate } : w))
      );
    },
    [setWatched]
  );

  const initiateMarkAsWatched = useCallback((item: MovieItem) => {
    setRateModalItem(item);
  }, []);

  const confirmWatched = useCallback(
    async (rating: number | 'skip') => {
      vibrate(20);
      const item = rateModalItem;
      if (!item) return;

      const finalRating = rating === 'skip' ? null : rating;

      // If already in watched (check by internal ID), just update rating
      if (watched.some((w) => w.id === item.id)) {
        setWatched((prev) =>
          prev.map((w) => (w.id === item.id ? { ...w, rating: finalRating } : w))
        );
        setRateModalItem(null);
        return;
      }

      // Also check by TMDB ID to prevent duplicates from external sources
      const existingByTmdbId = watched.find((w) => w.tmdbData?.id === item.tmdbData?.id);
      if (existingByTmdbId && item.tmdbData?.id) {
        // Update the existing entry's rating instead of creating duplicate
        setWatched((prev) =>
          prev.map((w) =>
            w.tmdbData?.id === item.tmdbData?.id ? { ...w, rating: finalRating } : w
          )
        );
        setRateModalItem(null);
        showToast(t('TOAST_ADDED'));
        return;
      }

      const type = normalizeMediaType(item.type);
      const origin = item._isSeenAction ? 'seen' : 'roulette';

      // Fetch credits
      let credits = null;
      if (apiKey && item.tmdbData) {
        credits = await getCredits(item.tmdbData.id, type, apiKey, language);
      }

      const newWatched: WatchedItem = {
        id: generateId(),
        title: item.title || '',
        type,
        watchedDate: new Date().toISOString(),
        tmdbData: item.tmdbData || null,
        rating: finalRating,
        origin,
        credits,
      };

      setWatched((prev) => [...prev, newWatched]);

      // Remove from lists if not a "seen" action
      if (!item._isSeenAction && item.tmdbData) {
        setMovies((prev) => prev.filter((m) => m.tmdbData?.id !== item.tmdbData?.id));
        setTvShows((prev) => prev.filter((t) => t.tmdbData?.id !== item.tmdbData?.id));
        setBacklog((prev) => prev.filter((b) => b.tmdbData?.id !== item.tmdbData?.id));
      }

      // Celebration for 5-star ratings
      if (rating === 5 && soundEnabled) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setShowResult(false);
      setSelectedItem(null);
      setRateModalItem(null);
      showToast(t('TOAST_ADDED'));
    },
    [
      rateModalItem,
      watched,
      apiKey,
      language,
      soundEnabled,
      setWatched,
      setMovies,
      setTvShows,
      setBacklog,
      showToast,
      t,
    ]
  );

  const handleSyncMetadata = useCallback(async () => {
    if (!apiKey) {
      showToast('API KEY REQUIRED');
      return;
    }

    setIsSyncing(true);
    let updatedCount = 0;

    const newWatched = await Promise.all(
      watched.map(async (item) => {
        if (item.tmdbData && !item.credits) {
          const type = normalizeMediaType(item.type);
          const credits = await getCredits(item.tmdbData.id, type, apiKey, language);
          if (credits) {
            updatedCount++;
            return { ...item, credits };
          }
        }
        return item;
      })
    );

    setWatched(newWatched);
    setIsSyncing(false);
    showToast(`Updated ${updatedCount} items`);
  }, [apiKey, language, watched, setWatched, showToast]);

  const handleImport = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (data.movies) {
            setMovies((prev) => [
              ...prev,
              ...data.movies.filter(
                (m: MovieItem) => !prev.some((p) => p.title === m.title)
              ),
            ]);
          }
          if (data.tvShows) {
            setTvShows((prev) => [
              ...prev,
              ...data.tvShows.filter(
                (m: MovieItem) => !prev.some((p) => p.title === m.title)
              ),
            ]);
          }
          if (data.backlog) {
            setBacklog((prev) => [
              ...prev,
              ...data.backlog.filter(
                (m: BacklogItem) => !prev.some((p) => p.title === m.title)
              ),
            ]);
          }
          if (data.watched) {
            setWatched(data.watched);
          }
          if (data.blacklist) {
            setBlacklist(data.blacklist);
          }
          if (data.apiKey) {
            setApiKey(data.apiKey);
          }
          if (data.winCount) {
            setWinCount(data.winCount);
          }

          showToast('Import successful');
        } catch {
          showToast('Import failed');
        }
      };
      reader.readAsText(file);
    },
    [setMovies, setTvShows, setBacklog, setWatched, setBlacklist, setApiKey, setWinCount, showToast]
  );

  const handleClearMovies = useCallback(() => {
    setMovies([]);
  }, [setMovies]);

  const handleClearTV = useCallback(() => {
    setTvShows([]);
  }, [setTvShows]);

  const handleCuratorClick = useCallback(() => {
    if (curatorPick) {
      setInfoItem({
        tmdbData: curatorPick.item,
        title: curatorPick.item.title || curatorPick.item.name || '',
        type: 'movie',
      });
    }
  }, [curatorPick]);

  const handleTabChange = (tab: TabType) => {
    vibrate(5);
    setCurrentTab(tab);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#EFEEE5] text-black relative font-mono select-none">
      <div className="max-w-xl mx-auto p-4 pb-24">
        {/* HOME TAB */}
        {currentTab === 'home' && (
          <HomeTab
            movies={movies}
            tvShows={tvShows}
            homeMode={homeMode}
            setHomeMode={setHomeMode}
            filters={filters}
            setFilters={setFilters}
            apiKey={apiKey}
            language={language}
            winCount={winCount}
            curatorPick={curatorPick}
            isSpinning={isSpinning}
            onAdd={handleAdd}
            onToggleIncluded={handleToggleIncluded}
            onDelete={(id, type) => handleDeleteItem(id, type)}
            onSpin={spin}
            onInfo={(item) => setInfoItem(item)}
            onCuratorClick={handleCuratorClick}
            t={t}
          />
        )}

        {/* WATCHLIST TAB */}
        {currentTab === 'watchlist' && (
          <WatchlistTab
            backlog={backlog}
            onPromote={handlePromoteFromWatchlist}
            onDelete={(id) => handleDeleteItem(id, 'backlog')}
            onInfo={(item) => setInfoItem(item)}
            t={t}
          />
        )}

        {/* DISCOVER TAB */}
        {currentTab === 'discover' && (
          <DiscoverTab
            watched={watched}
            backlog={backlog}
            movies={movies}
            tvShows={tvShows}
            apiKey={apiKey}
            language={language}
            onAdd={handleAddRecommendation}
            onAddToWatchlist={handleAddToWatchlist}
            onSeen={handleSeenRecommendation}
            onInfo={(item) => setInfoItem(item)}
            t={t}
          />
        )}

        {/* SWIPE TAB */}
        {currentTab === 'swipe' && (
          <SwipeTab
            watched={watched}
            backlog={backlog}
            movies={movies}
            tvShows={tvShows}
            blacklist={blacklist}
            apiKey={apiKey}
            language={language}
            soundEnabled={soundEnabled}
            onAddToWatchlist={handleAddToWatchlist}
            onSeen={handleSeenRecommendation}
            onBlacklist={handleBlacklist}
            onInfo={(item) => setInfoItem(item)}
            t={t}
          />
        )}

        {/* HISTORY TAB */}
        {currentTab === 'history' && (
          <HistoryTab
            watched={watched}
            onDelete={(id) => handleDeleteItem(id, 'history')}
            onRate={(item) => setRateModalItem(item)}
            onInfo={(item) => setInfoItem(item)}
            onUpdateDate={handleUpdateWatchedDate}
            t={t}
          />
        )}

        {/* SETTINGS TAB */}
        {currentTab === 'settings' && (
          <SettingsTab
            apiKey={apiKey}
            setApiKey={setApiKey}
            language={language}
            setLanguage={setLanguage}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            isSyncing={isSyncing}
            onSync={handleSyncMetadata}
            onImport={handleImport}
            onClearMovies={handleClearMovies}
            onClearTV={handleClearTV}
            t={t}
            showToast={showToast}
          />
        )}
      </div>

      {/* BOTTOM NAV - Improved with larger touch targets */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-black/10 z-50 flex justify-around items-stretch pb-safe shadow-lg">
        {(['home', 'watchlist', 'discover', 'swipe', 'history', 'settings'] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-3 min-h-[64px] transition-all duration-200 relative ${
                currentTab === tab 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={t(`NAV_${tab.toUpperCase()}`)}
              aria-current={currentTab === tab ? 'page' : undefined}
            >
              {/* Active indicator */}
              {currentTab === tab && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" />
              )}
              {tab === 'home' && <Icons.Home />}
              {tab === 'watchlist' && <Icons.Watchlist />}
              {tab === 'discover' && <Icons.Discover />}
              {tab === 'swipe' && <Icons.Swipe />}
              {tab === 'history' && <Icons.History />}
              {tab === 'settings' && <Icons.Settings />}
              <span className={`text-[10px] font-semibold uppercase mt-1 tracking-wide ${
                currentTab === tab ? 'opacity-100' : 'opacity-70'
              }`}>
                {t(`NAV_${tab.toUpperCase()}`)}
              </span>
            </button>
          )
        )}
      </nav>

      {/* WINNER MODAL - Clean */}
      {showResult && selectedItem && !isSpinning && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowResult(false)}
        >
          <div
            className="bg-black text-white overflow-hidden shadow-2xl relative animate-bounce-in w-full max-w-md rounded-2xl border-2 border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background image */}
            {selectedItem.tmdbData?.backdrop_path && (
              <div className="absolute inset-0 z-0">
                <img
                  src={`https://image.tmdb.org/t/p/w780${selectedItem.tmdbData.backdrop_path}`}
                  alt=""
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-black/80" />
              </div>
            )}

            <div className="relative z-10 p-6">
              {/* Win Badge */}
              <div className="text-center mb-6">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase ${
                  winCount === 1 
                    ? 'bg-[#E0245E] text-white' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}>
                  {winCount === 1 ? t('FIRST_SPIN') : `WIN #${winCount}`}
                </div>
              </div>

              {/* Poster and Info */}
              <div className="flex gap-5">
                {selectedItem.tmdbData?.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${selectedItem.tmdbData.poster_path}`}
                    alt=""
                    className="w-28 h-40 object-cover rounded-xl shadow-2xl flex-shrink-0 ring-2 ring-white/20"
                  />
                ) : (
                  <div className="w-28 h-40 bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                    </svg>
                  </div>
                )}

                <div className="flex-1 text-left">
                  <h2 className="text-xl font-black uppercase leading-tight mb-2 flex items-center flex-wrap gap-1">
                    {selectedItem.title} <VerifiedBadge />
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    <span className="bg-white/10 px-2 py-1 rounded">
                      {selectedItem.tmdbData?.release_date?.split('-')[0] || 'N/A'}
                    </span>
                    {selectedItem.tmdbData && (
                      <span className="bg-white/10 px-2 py-1 rounded">
                        {selectedItem.tmdbData.vote_average?.toFixed(1)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                    {selectedItem.tmdbData?.overview || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => initiateMarkAsWatched(selectedItem)}
                className="w-full mt-6 px-6 py-4 bg-white text-black rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all active:scale-98"
              >
                {t('BTN_WATCHED')}
              </button>
              
              {/* Dismiss hint */}
              <p className="text-center text-xs text-gray-500 mt-4">
                Tap outside to close
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SPINNING OVERLAY - Clean */}
      {isSpinning && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
          <div className="text-center px-8">
            {/* Minimal spinner */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin" />
            </div>
            
            <p className="text-xs uppercase text-gray-500 mb-3 tracking-[0.3em] font-bold">
              {t('SPINNING')}
            </p>
            <p className="text-2xl font-black text-white spin-animation uppercase max-w-xs mx-auto truncate">
              {spinningText}
            </p>
          </div>
        </div>
      )}

      {/* DETAIL PAGE */}
      <MovieDetailPage
        item={infoItem}
        onClose={() => setInfoItem(null)}
        t={t}
        apiKey={apiKey}
        language={language}
        onAdd={handleAddRecommendation}
        onAddToWatchlist={handleAddToWatchlist}
        onSeen={handleSeenRecommendation}
        onBlacklist={handleBlacklist}
        onNavigate={(item) => setInfoItem(item)}
      />

      {/* RATE MODAL */}
      <RateModal
        isOpen={!!rateModalItem}
        onClose={() => setRateModalItem(null)}
        onRate={confirmWatched}
        t={t}
      />

      {/* TOASTS */}
      <ToastContainer toasts={toasts} />

      {/* CONFETTI */}
      {showConfetti && <Confetti isFirstSpin={winCount === 1} />}
    </div>
  );
}
