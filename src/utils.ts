// ============================================
// MOVIE ROULETTE - UTILITIES
// ============================================

import { STORAGE_KEYS, TMDB_BASE_URL } from './constants';
import type {
  Language,
  MediaType,
  MovieItem,
  BacklogItem,
  WatchedItem,
  TMDBData,
  TMDBSearchResponse,
  TMDBCreditsResponse,
  Credits,
} from './types';

// ============================================
// ID Generation
// ============================================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ============================================
// Date Formatting
// ============================================

export function formatDate(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

// ============================================
// Safe localStorage (with try/catch)
// ============================================

export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    console.warn(`Failed to parse localStorage key: ${key}`);
    return defaultValue;
  }
}

export function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save to localStorage key: ${key}`, e);
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`Failed to remove localStorage key: ${key}`);
  }
}

// ============================================
// Audio Utilities (Singleton AudioContext)
// ============================================

let audioContextInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContextInstance) {
      audioContextInstance = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (needed for some browsers)
    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }
    return audioContextInstance;
  } catch {
    return null;
  }
}

export function playTick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  } catch {
    // Silently fail
  }
}

export function playWin(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const frequencies = [440, 554.37, 659.25];
    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1 + i * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      oscillator.start(ctx.currentTime + i * 0.05);
      oscillator.stop(ctx.currentTime + 2);
    });
  } catch {
    // Silently fail
  }
}

export function playSwipe(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  } catch {
    // Silently fail
  }
}

// ============================================
// Haptic Feedback
// ============================================

export function vibrate(pattern: number | number[]): void {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// ============================================
// Type Normalization (Fix inconsistent types)
// ============================================

export function normalizeMediaType(type: string | undefined): MediaType {
  if (!type) return 'movie';
  const normalized = type.toLowerCase();
  if (normalized === 'tv' || normalized === 'tvshow' || normalized === 'tvshows') {
    return 'tv';
  }
  return 'movie';
}

export function isTV(item: { type?: string; tmdbData?: TMDBData | null }): boolean {
  if (item.type) {
    return normalizeMediaType(item.type) === 'tv';
  }
  if (item.tmdbData) {
    return item.tmdbData.name !== undefined && item.tmdbData.title === undefined;
  }
  return false;
}

// ============================================
// TMDB API Utilities
// ============================================

export interface FetchOptions {
  signal?: AbortSignal;
}

export async function tmdbFetch<T>(
  endpoint: string,
  apiKey: string,
  language: Language,
  options?: FetchOptions
): Promise<T | null> {
  if (!apiKey) return null;

  try {
    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}&language=${language}`;
    const response = await fetch(url, { signal: options?.signal });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      // Request was cancelled, this is expected
      return null;
    }
    console.error('TMDB fetch error:', e);
    return null;
  }
}

export async function searchTMDB(
  query: string,
  type: MediaType,
  apiKey: string,
  language: Language,
  options?: FetchOptions
): Promise<TMDBData[]> {
  const endpoint = type === 'movie' ? 'movie' : 'tv';
  const data = await tmdbFetch<TMDBSearchResponse>(
    `/search/${endpoint}?query=${encodeURIComponent(query)}&include_adult=false`,
    apiKey,
    language,
    options
  );
  return data?.results ?? [];
}

export async function getMovieDetails(
  id: number,
  type: MediaType,
  apiKey: string,
  language: Language,
  options?: FetchOptions
): Promise<TMDBData | null> {
  const endpoint = type === 'movie' ? 'movie' : 'tv';
  return tmdbFetch<TMDBData>(`/${endpoint}/${id}`, apiKey, language, options);
}

export async function getCredits(
  id: number,
  type: MediaType,
  apiKey: string,
  language: Language,
  options?: FetchOptions
): Promise<Credits | null> {
  const endpoint = type === 'movie' ? 'movie' : 'tv';
  const data = await tmdbFetch<TMDBCreditsResponse>(
    `/${endpoint}/${id}/credits`,
    apiKey,
    language,
    options
  );

  if (!data) return null;

  return {
    cast: (data.cast ?? []).slice(0, 4).map((c) => ({
      name: c.name,
      profile_path: c.profile_path,
      character: c.character,
    })),
    director: data.crew?.find((c) => c.job === 'Director') ?? null,
  };
}

// ============================================
// Sorting Utilities
// ============================================

export function sortItems<T extends MovieItem | BacklogItem | WatchedItem>(
  items: T[],
  sortMode: string
): T[] {
  const sorted = [...items];

  switch (sortMode) {
    case 'alphabetical':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'release_new':
      sorted.sort((a, b) => {
        const dateA = a.tmdbData?.release_date || a.tmdbData?.first_air_date || '';
        const dateB = b.tmdbData?.release_date || b.tmdbData?.first_air_date || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      break;
    case 'release_old':
      sorted.sort((a, b) => {
        const dateA = a.tmdbData?.release_date || a.tmdbData?.first_air_date || '';
        const dateB = b.tmdbData?.release_date || b.tmdbData?.first_air_date || '';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
      break;
    case 'rating':
      sorted.sort((a, b) => (b.tmdbData?.vote_average ?? 0) - (a.tmdbData?.vote_average ?? 0));
      break;
    case 'runtime':
      sorted.sort((a, b) => (a.tmdbData?.runtime ?? 0) - (b.tmdbData?.runtime ?? 0));
      break;
    case 'added':
    default:
      // For watched items, sort by watchedDate
      if (sorted.length > 0 && 'watchedDate' in sorted[0]) {
        sorted.sort((a, b) => {
          const wa = a as WatchedItem;
          const wb = b as WatchedItem;
          return new Date(wb.watchedDate).getTime() - new Date(wa.watchedDate).getTime();
        });
      }
      // Otherwise keep original order (most recently added first)
      break;
  }

  return sorted;
}

// ============================================
// Data Export/Import
// ============================================

export interface ExportData {
  version: number;
  exportDate: string;
  movies: MovieItem[];
  tvShows: MovieItem[];
  backlog: BacklogItem[];
  watched: WatchedItem[];
  blacklist: number[];
  apiKey: string;
  language: Language;
  soundEnabled: boolean;
  winCount: number;
}

export function exportData(): void {
  const data: ExportData = {
    version: 46,
    exportDate: new Date().toISOString(),
    movies: safeGetItem(STORAGE_KEYS.movies, []),
    tvShows: safeGetItem(STORAGE_KEYS.tvShows, []),
    backlog: safeGetItem(STORAGE_KEYS.backlog, []),
    watched: safeGetItem(STORAGE_KEYS.watched, []),
    blacklist: safeGetItem(STORAGE_KEYS.blacklist, []),
    apiKey: localStorage.getItem(STORAGE_KEYS.tmdbKey) ?? '',
    language: (localStorage.getItem(STORAGE_KEYS.language) as Language) ?? 'en-US',
    soundEnabled: safeGetItem(STORAGE_KEYS.sound, true),
    winCount: parseInt(localStorage.getItem(STORAGE_KEYS.winCount) ?? '0', 10),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `movie-roulette-v46-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// Poster Caching
// ============================================

export function cachePosters(
  items: Array<{ tmdbData?: TMDBData | null }>,
  limit: number
): void {
  const toCache = items
    .filter((i) => i.tmdbData?.poster_path)
    .slice(0, limit);

  toCache.forEach((item) => {
    if (item.tmdbData?.poster_path) {
      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/w342${item.tmdbData.poster_path}`;
    }
  });
}
