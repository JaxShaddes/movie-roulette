// ============================================
// MOVIE ROULETTE - LIBRARY TABS (Watchlist & History)
// ============================================

import { useState, useMemo, memo } from 'react';
import { sortItems, formatDate, vibrate } from '@/utils';
import { ProfileStats } from '@/components/ProfileStats';
import {
  Icons,
  VerifiedBadge,
  RouletteBadge,
  Button,
  ToggleButtons,
  EmptyState,
  PosterImage,
} from '@/components/ui';
import type {
  BacklogItem,
  WatchedItem,
  MediaType,
  SortMode,
  OriginFilter,
  TMDBData,
} from '@/types';

// ============================================
// WATCHLIST TAB
// ============================================

interface WatchlistTabProps {
  backlog: BacklogItem[];
  onPromote: (item: BacklogItem) => void;
  onDelete: (id: string) => void;
  onInfo: (item: { tmdbData: TMDBData; title: string; type: MediaType }) => void;
  t: (key: string) => string;
}

export const WatchlistTab = memo(function WatchlistTab({
  backlog,
  onPromote,
  onDelete,
  onInfo,
  t,
}: WatchlistTabProps) {
  const [tab, setTab] = useState<MediaType>('movie');
  const [sort, setSort] = useState<SortMode>('added');

  const sortedBacklog = useMemo(() => {
    const filtered = backlog.filter((i) => (tab === 'movie' ? i.type === 'movie' : i.type !== 'movie'));
    return sortItems(filtered, sort);
  }, [backlog, tab, sort]);

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
        {t('HEADER_WATCHLIST')}
      </h1>

      <ToggleButtons
        options={[
          { value: 'movie', label: t('TOGGLE_MOVIES') },
          { value: 'tv', label: t('TOGGLE_TV') },
        ]}
        value={tab}
        onChange={(v) => setTab(v as MediaType)}
        className="mb-4"
      />

      <div className="flex justify-end mb-4">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="bg-transparent text-[10px] font-bold uppercase border-none outline-none text-right"
        >
          <option value="added">{t('SORT_ADDED')}</option>
          <option value="alphabetical">{t('SORT_ALPHA')}</option>
          <option value="release_new">{t('SORT_RELEASE_NEW')}</option>
          <option value="release_old">{t('SORT_RELEASE_OLD')}</option>
          <option value="rating">{t('SORT_RATING')}</option>
          <option value="runtime">{t('SORT_RUNTIME')}</option>
        </select>
      </div>

      {sortedBacklog.length === 0 ? (
        <EmptyState 
          icon="bookmark"
          title={t('EMPTY_WATCHLIST')} 
          message="Save movies and shows here to watch later"
        />
      ) : (
        sortedBacklog.map((item) => (
          <div key={item.id} className="flex gap-3 py-3 border-b border-gray-300">
            <PosterImage
              path={item.tmdbData?.poster_path ?? null}
              alt={item.title}
              size="sm"
              className="w-12 h-18 border border-black"
            />
            <div className="flex-1">
              <span className="font-bold uppercase text-sm">{item.title}</span>
              <div className="text-[10px] text-gray-500 uppercase mt-1 mb-2">
                {item.type} • {item.tmdbData?.release_date?.split('-')[0]} •{' '}
                {item.tmdbData?.vote_average?.toFixed(1)}★
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    vibrate(10);
                    onPromote(item);
                  }}
                >
                  {t('BTN_MOVE_TO_ROULETTE')}
                </Button>
                <button
                  onClick={() => {
                    vibrate(10);
                    onDelete(item.id);
                  }}
                  className="text-red-500 text-[10px] font-bold uppercase underline"
                >
                  Remove
                </button>
              </div>
            </div>
            {item.tmdbData && (
              <button
                onClick={() =>
                  onInfo({
                    tmdbData: item.tmdbData!,
                    title: item.title,
                    type: item.type,
                  })
                }
                className="text-gray-400 hover:text-black self-start"
                aria-label={`View info for ${item.title}`}
              >
                <Icons.Info />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
});

// ============================================
// HISTORY TAB
// ============================================

interface HistoryTabProps {
  watched: WatchedItem[];
  onDelete: (id: string) => void;
  onRate: (item: WatchedItem) => void;
  onInfo: (item: { tmdbData: TMDBData; title: string; type: MediaType }) => void;
  onUpdateDate: (id: string, date: string) => void;
  t: (key: string) => string;
}

export const HistoryTab = memo(function HistoryTab({
  watched,
  onDelete,
  onRate,
  onInfo,
  onUpdateDate,
  t,
}: HistoryTabProps) {
  const [tab, setTab] = useState<MediaType>('movie');
  const [sort, setSort] = useState<SortMode>('added');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [editingDateId, setEditingDateId] = useState<string | null>(null);

  const sortedHistory = useMemo(() => {
    let filtered = watched.filter((i) => (tab === 'movie' ? i.type === 'movie' : i.type !== 'movie'));

    if (originFilter === 'roulette') {
      filtered = filtered.filter((i) => i.origin === 'roulette');
    } else if (originFilter === 'seen') {
      filtered = filtered.filter((i) => i.origin !== 'roulette');
    }

    return sortItems(filtered, sort);
  }, [watched, tab, sort, originFilter]);

  const handleDateChange = (id: string, dateStr: string) => {
    onUpdateDate(id, dateStr);
    setEditingDateId(null);
  };

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
        {t('NAV_HISTORY')}
      </h1>

      {/* Profile Stats */}
      <ProfileStats watched={watched} t={t} />

      <ToggleButtons
        options={[
          { value: 'movie', label: t('TOGGLE_MOVIES') },
          { value: 'tv', label: t('TOGGLE_TV') },
        ]}
        value={tab}
        onChange={(v) => setTab(v as MediaType)}
        className="mb-4"
      />

      <div className="flex justify-between mb-4">
        <select
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value as OriginFilter)}
          className="bg-transparent text-[10px] font-bold uppercase border-none outline-none"
        >
          <option value="all">{t('FILTER_SOURCE_ALL')}</option>
          <option value="roulette">{t('FILTER_SOURCE_ROULETTE')}</option>
          <option value="seen">{t('FILTER_SOURCE_SEEN')}</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="bg-transparent text-[10px] font-bold uppercase border-none outline-none text-right"
        >
          <option value="added">{t('SORT_ADDED')}</option>
          <option value="alphabetical">{t('SORT_ALPHA')}</option>
          <option value="release_new">{t('SORT_RELEASE_NEW')}</option>
          <option value="release_old">{t('SORT_RELEASE_OLD')}</option>
          <option value="rating">{t('SORT_RATING')}</option>
          <option value="runtime">{t('SORT_RUNTIME')}</option>
        </select>
      </div>

      {sortedHistory.length === 0 ? (
        <EmptyState 
          icon="history"
          title={t('EMPTY_SEEN')}
          message="Movies and shows you've watched will appear here"
        />
      ) : (
        sortedHistory.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-300">
            {item.tmdbData?.poster_path && (
              <PosterImage
                path={item.tmdbData.poster_path}
                alt={item.title}
                size="sm"
                className="w-10 h-14 border border-black"
              />
            )}
            <div className="flex-1">
              <span className="font-bold uppercase text-xs block">
                {item.title} {item.tmdbData && <VerifiedBadge />}{' '}
                {item.origin === 'roulette' && <RouletteBadge />}
              </span>
              {editingDateId === item.id ? (
                <input
                  type="date"
                  className="bg-transparent border border-black text-[10px] p-1 font-mono"
                  defaultValue={item.watchedDate.split('T')[0]}
                  onChange={(e) => handleDateChange(item.id, e.target.value)}
                  onBlur={() => setEditingDateId(null)}
                  autoFocus
                />
              ) : (
                <span className="text-[10px] text-gray-500 uppercase flex items-center">
                  {formatDate(item.watchedDate)}
                  <button
                    onClick={() => setEditingDateId(item.id)}
                    aria-label="Edit date"
                  >
                    <Icons.Pencil />
                  </button>
                </span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => onRate(item)}
                className={`text-[10px] font-bold border border-black px-2 py-1 uppercase transition-colors ${
                  typeof item.rating === 'number' && item.rating >= 4
                    ? 'bg-[#E0245E] text-white border-[#E0245E]'
                    : ''
                }`}
              >
                {item.rating
                  ? typeof item.rating === 'number'
                    ? `${item.rating}/5`
                    : item.rating
                  : t('RATE_LABEL_ADD')}
              </button>
              {item.tmdbData && (
                <button
                  onClick={() =>
                    onInfo({
                      tmdbData: item.tmdbData!,
                      title: item.title,
                      type: item.type,
                    })
                  }
                  aria-label={`View info for ${item.title}`}
                >
                  <Icons.Info />
                </button>
              )}
              <button
                onClick={() => {
                  vibrate(10);
                  onDelete(item.id);
                }}
                aria-label={`Delete ${item.title}`}
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
});
