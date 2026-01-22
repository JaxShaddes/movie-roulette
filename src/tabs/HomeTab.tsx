// ============================================
// MOVIE ROULETTE - HOME TAB
// ============================================

import { useState, useMemo, useCallback, memo } from 'react';
import { GENRES, DATE_NIGHT_GENRES, DATE_NIGHT_TIME } from '@/constants';
import { vibrate } from '@/utils';
import { SearchInput } from '@/components/SearchInput';
import { Icons, VerifiedBadge, Button, ToggleButtons, EmptyState } from '@/components/ui';
import type {
  MovieItem,
  TMDBData,
  MediaType,
  Language,
  Filters,
  TimeFilter,
  CuratorPick,
} from '@/types';

interface HomeTabProps {
  movies: MovieItem[];
  tvShows: MovieItem[];
  homeMode: MediaType;
  setHomeMode: (mode: MediaType) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  apiKey: string;
  language: Language;
  winCount: number;
  curatorPick: CuratorPick | null;
  isSpinning: boolean;
  onAdd: (title: string, metadata: TMDBData | null) => void;
  onToggleIncluded: (id: string, type: MediaType) => void;
  onDelete: (id: string, type: MediaType) => void;
  onSpin: () => void;
  onInfo: (item: { tmdbData: TMDBData; title: string; type: MediaType }) => void;
  onCuratorClick: () => void;
  t: (key: string) => string;
}

// Filter Panel Component
const FilterPanel = memo(function FilterPanel({
  isOpen,
  onClose,
  filters,
  setFilters,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  t: (key: string) => string;
}) {
  if (!isOpen) return null;

  const toggleGenre = (id: number) => {
    const newGenres = filters.genres.includes(id)
      ? filters.genres.filter((g) => g !== id)
      : [...filters.genres, id];
    setFilters({ ...filters, genres: newGenres });
  };

  const toggleTime = (val: TimeFilter) => {
    setFilters({ ...filters, time: filters.time === val ? null : val });
  };

  return (
    <div className="mb-6 p-4 border-2 border-black bg-white/50 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase text-xs tracking-wider">{t('FILTERS')}</h3>
        <button onClick={onClose} className="text-xs underline">
          CLOSE
        </button>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase mb-2 text-gray-500">{t('FILTER_TIME')}</p>
        <div className="flex flex-wrap gap-2">
          {(['short', 'medium', 'long'] as const).map((time) => (
            <button
              key={time}
              onClick={() => toggleTime(time)}
              className={`px-2 py-1 text-[10px] uppercase border transition-colors ${
                filters.time === time
                  ? 'bg-black text-[#EFEEE5] border-black'
                  : 'border-gray-400 text-gray-500 hover:border-black hover:text-black'
              }`}
            >
              {time === 'short'
                ? t('TIME_SHORT')
                : time === 'medium'
                  ? t('TIME_MED')
                  : t('TIME_LONG')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase mb-2 text-gray-500">{t('FILTER_GENRE')}</p>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {Object.entries(GENRES).map(([id, name]) => (
            <button
              key={id}
              onClick={() => toggleGenre(parseInt(id))}
              className={`px-2 py-1 text-[10px] uppercase border transition-colors ${
                filters.genres.includes(parseInt(id))
                  ? 'bg-black text-[#EFEEE5] border-black'
                  : 'border-gray-400 text-gray-500 hover:border-black hover:text-black'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export const HomeTab = memo(function HomeTab({
  movies,
  tvShows,
  homeMode,
  setHomeMode,
  filters,
  setFilters,
  apiKey,
  language,
  winCount,
  curatorPick,
  isSpinning,
  onAdd,
  onToggleIncluded,
  onDelete,
  onSpin,
  onInfo,
  onCuratorClick,
  t,
}: HomeTabProps) {
  const [showFilters, setShowFilters] = useState(false);

  const currentList = homeMode === 'movie' ? movies : tvShows;

  // Filter logic
  const filterItem = useCallback(
    (item: MovieItem): boolean => {
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
      if (filters.time) {
        let runtime = item.tmdbData.runtime;
        if (!runtime && item.tmdbData.episode_run_time?.length) {
          runtime = item.tmdbData.episode_run_time.reduce((a, b) => a + b, 0) /
            item.tmdbData.episode_run_time.length;
        }

        if (runtime) {
          if (filters.time === 'short' && runtime > 90) return false;
          if (filters.time === 'medium' && (runtime <= 90 || runtime > 120)) return false;
          if (filters.time === 'long' && runtime <= 120) return false;
        }
      }

      return true;
    },
    [filters]
  );

  const visibleCandidates = useMemo(
    () => currentList.filter(filterItem),
    [currentList, filterItem]
  );

  const displayList = useMemo(() => {
    if (filters.genres.length === 0 && !filters.time) return currentList;
    return currentList.filter((item) => filterItem({ ...item, included: true }));
  }, [currentList, filters, filterItem]);

  const handleDateNight = () => {
    setFilters({ genres: DATE_NIGHT_GENRES, time: DATE_NIGHT_TIME });
  };

  const handleClearFilters = () => {
    setFilters({ genres: [], time: null });
  };

  const hasActiveFilters = filters.genres.length > 0 || filters.time;

  return (
    <div className="pb-32">
      {/* Header - Minimal Brutalist */}
      <header className="relative overflow-hidden rounded-2xl bg-black mb-8 shadow-xl">
        <div className="relative p-8 text-center">
          <h1 className="text-4xl font-black tracking-tight leading-none text-white mb-2">
            <span className="text-[#E0245E]">MOVIE</span> ROULETTE
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium">
            {t('SUBTITLE')}
          </p>
          {winCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 rounded-full">
              <span className="text-xs font-bold text-white">
                {winCount} {winCount === 1 ? 'WIN' : 'WINS'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Curator's Pick */}
      {curatorPick && (
        <button
          onClick={onCuratorClick}
          className="w-full mb-6 p-6 border-4 border-[#E0245E] bg-black text-[#EFEEE5] text-center animate-fade-in cursor-pointer"
        >
          <p className="text-xs uppercase text-[#E0245E] mb-2 tracking-widest">
            ★ {t('CURATOR_TITLE')}
          </p>
          <p className="text-2xl font-black font-sans uppercase">
            {curatorPick.item.title || curatorPick.item.name}
          </p>
          <p className="text-[10px] mt-2 opacity-70 uppercase">
            {t('CURATOR_SUB')} {curatorPick.because}
          </p>
        </button>
      )}

      {/* Mode Toggle */}
      <ToggleButtons
        options={[
          { value: 'movie', label: t('TOGGLE_MOVIES') },
          { value: 'tv', label: t('TOGGLE_TV') },
        ]}
        value={homeMode}
        onChange={(v) => setHomeMode(v as MediaType)}
        className="mb-6"
      />

      {/* Quick Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={handleDateNight}
          className="flex-shrink-0 px-4 py-2 text-[11px] font-bold uppercase border-2 border-[#E0245E] text-[#E0245E] hover:bg-[#E0245E] hover:text-white transition-all whitespace-nowrap rounded-full"
        >
          {t('DATE_NIGHT')}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex-shrink-0 px-4 py-2 text-[11px] font-bold uppercase border border-gray-400 text-gray-500 hover:border-black hover:text-black transition-all rounded-full"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <SearchInput
          type={homeMode}
          apiKey={apiKey}
          language={language}
          placeholder={homeMode === 'movie' ? t('PLACEHOLDER_MOVIES') : t('PLACEHOLDER_TV')}
          onAdd={(title, metadata) => onAdd(title, metadata)}
        />
        <Button variant="primary" size="md">
          ADD
        </Button>
      </div>

      {/* List Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-xs uppercase tracking-widest">
          {t('HEADER_MOVIES')} ({displayList.length})
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`text-[10px] font-bold border border-black px-2 py-1 uppercase transition-colors ${
            showFilters || hasActiveFilters ? 'bg-black text-[#EFEEE5]' : ''
          }`}
        >
          {t('FILTERS')}
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        t={t}
      />

      {/* Movie List */}
      <div className="mb-6 max-h-64 overflow-y-auto border-t-2 border-b-2 border-black/10">
        {displayList.length === 0 ? (
          <EmptyState 
            icon="film"
            title={t('EMPTY_LIST')} 
            message="Add movies or TV shows to get started"
          />
        ) : (
          displayList.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 py-3 border-b border-gray-200 ${
                !item.included ? 'opacity-50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={item.included}
                onChange={() => {
                  vibrate(10);
                  onToggleIncluded(item.id, homeMode);
                }}
                className="checkbox-receipt"
                aria-label={`Include ${item.title}`}
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold uppercase text-sm truncate block">
                  {item.title} {item.tmdbData && <VerifiedBadge />}
                </span>
                {item.tmdbData && (
                  <span className="text-[10px] text-gray-500 uppercase">
                    {item.tmdbData.release_date?.split('-')[0]} •{' '}
                    {item.tmdbData.vote_average?.toFixed(1)} ★
                  </span>
                )}
              </div>
              {item.tmdbData && (
                <button
                  onClick={() =>
                    onInfo({
                      tmdbData: item.tmdbData!,
                      title: item.title,
                      type: homeMode,
                    })
                  }
                  className="text-gray-400 hover:text-black"
                  aria-label={`View info for ${item.title}`}
                >
                  <Icons.Info />
                </button>
              )}
              <button
                onClick={() => {
                  vibrate(10);
                  onDelete(item.id, homeMode);
                }}
                className="text-gray-400 hover:text-red-500 px-2"
                aria-label={`Delete ${item.title}`}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Spin Button - Clean */}
      <button
        onClick={onSpin}
        disabled={isSpinning || visibleCandidates.filter((i) => i.included).length === 0}
        className="w-full bg-black text-white py-5 text-xl font-black uppercase tracking-wider rounded-xl hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-gray-400"
      >
        {isSpinning ? t('SPINNING') : t('SPIN_BTN')}
      </button>
      
      {/* Candidate count hint */}
      <p className="text-center text-xs text-gray-400 mt-3">
        {visibleCandidates.filter((i) => i.included).length} items in the wheel
      </p>
    </div>
  );
});
