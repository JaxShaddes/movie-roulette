// ============================================
// MOVIE ROULETTE - SEARCH INPUT COMPONENT
// ============================================

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { SEARCH_DEBOUNCE_MS, SEARCH_RESULTS_LIMIT, TMDB_BASE_URL } from '@/constants';
import { useAbortController, useDebounce } from '@/hooks';
import { vibrate, getMovieDetails } from '@/utils';
import { PosterImage, Spinner } from './ui';
import type { TMDBData, MediaType, Language } from '@/types';

interface SearchInputProps {
  type: MediaType;
  placeholder: string;
  onAdd: (title: string, metadata: TMDBData | null) => void;
  apiKey: string;
  language: Language;
}

export const SearchInput = memo(function SearchInput({
  type,
  placeholder,
  onAdd,
  apiKey,
  language,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TMDBData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { getSignal } = useAbortController();
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  // Search TMDB when query changes
  useEffect(() => {
    if (!apiKey || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      const signal = getSignal();

      try {
        const endpoint = type === 'movie' ? 'movie' : 'tv';
        const res = await fetch(
          `${TMDB_BASE_URL}/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(debouncedQuery)}&language=${language}&include_adult=false`,
          { signal }
        );

        if (!res.ok) throw new Error('Search failed');

        const data = await res.json();
        if (data.results) {
          setSuggestions(data.results.slice(0, SEARCH_RESULTS_LIMIT));
          setIsOpen(true);
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Search error:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, apiKey, type, language, getSignal]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    async (item: TMDBData) => {
      vibrate(10);
      setLoading(true);
      setIsOpen(false);

      try {
        // Fetch full details to get runtime
        const details = await getMovieDetails(item.id, type, apiKey, language);

        const metadata: TMDBData = {
          id: item.id,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          overview: item.overview,
          release_date: item.release_date || item.first_air_date,
          first_air_date: item.first_air_date,
          vote_average: item.vote_average,
          title: item.title || item.name,
          name: item.name,
          runtime: details?.runtime ?? 0,
          episode_run_time: details?.episode_run_time,
          genre_ids: details?.genre_ids ?? item.genre_ids ?? [],
          status: details?.status,
          popularity: item.popularity,
        };

        onAdd(metadata.title ?? metadata.name ?? '', metadata);
      } catch (e) {
        // Fall back to basic info
        onAdd(item.title ?? item.name ?? '', item);
      }

      setQuery('');
      setSuggestions([]);
      setLoading(false);
    },
    [type, apiKey, language, onAdd]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAdd(query.trim(), null);
      setQuery('');
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-3 text-sm bg-transparent border-b border-black placeholder-gray-500 focus:outline-none focus:border-b-2 uppercase pr-8"
          autoComplete="off"
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {loading && (
          <div className="absolute right-2 top-3">
            <Spinner size="sm" />
          </div>
        )}
      </form>

      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 bg-white border-2 border-black border-t-0 z-50 shadow-xl max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s)}
              className="w-full p-2 hover:bg-gray-100 cursor-pointer flex gap-3 items-center border-b border-gray-100 last:border-0 text-left"
              role="option"
            >
              <PosterImage
                path={s.poster_path}
                alt={s.title ?? s.name ?? ''}
                size="sm"
                className="w-8 h-12"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-black uppercase">
                  {s.title || s.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(s.release_date || s.first_air_date || '').split('-')[0]}
                  {s.vote_average ? ` • ★ ${s.vote_average.toFixed(1)}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
