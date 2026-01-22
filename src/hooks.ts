// ============================================
// MOVIE ROULETTE - CUSTOM HOOKS
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS, TRANSLATIONS, DEBOUNCE_DELAY_MS } from './constants';
import { safeGetItem, safeSetItem } from './utils';
import type {
  Language,
  MovieItem,
  BacklogItem,
  WatchedItem,
  TMDBData,
} from './types';

// ============================================
// useLocalStorage - Debounced localStorage sync
// ============================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    return safeGetItem(key, initialValue);
  });

  // Debounced save to localStorage
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the save
    timeoutRef.current = setTimeout(() => {
      safeSetItem(key, storedValue);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// ============================================
// useLocalStorageString - For simple string values
// ============================================

export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, React.Dispatch<React.SetStateAction<string>>] {
  const [value, setValue] = useState<string>(() => {
    try {
      return localStorage.getItem(key) ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  }, [key, value]);

  return [value, setValue];
}

// ============================================
// useDebounce - Debounce any value
// ============================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// useTranslation - i18n hook
// ============================================

export function useTranslation(language: Language) {
  const t = useCallback(
    (key: string): string => {
      return TRANSLATIONS[language]?.[key] ?? key;
    },
    [language]
  );

  return { t };
}

// ============================================
// useToast - Toast notification system
// ============================================

interface Toast {
  id: number;
  msg: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((msg: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

// ============================================
// useAbortController - For cancellable fetch
// ============================================

export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback(() => {
    // Cancel any existing request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    // Create new controller
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return { getSignal };
}

// ============================================
// useAppState - Main application state
// ============================================

export function useAppState() {
  // Core data
  const [movies, setMovies] = useLocalStorage<MovieItem[]>(STORAGE_KEYS.movies, []);
  const [tvShows, setTvShows] = useLocalStorage<MovieItem[]>(STORAGE_KEYS.tvShows, []);
  const [backlog, setBacklog] = useLocalStorage<BacklogItem[]>(STORAGE_KEYS.backlog, []);
  const [watched, setWatched] = useLocalStorage<WatchedItem[]>(STORAGE_KEYS.watched, []);
  const [blacklist, setBlacklist] = useLocalStorage<number[]>(STORAGE_KEYS.blacklist, []);

  // Settings
  const [apiKey, setApiKey] = useLocalStorageString(STORAGE_KEYS.tmdbKey, '');
  const [language, setLanguage] = useLocalStorageString(STORAGE_KEYS.language, 'en-US') as [
    Language,
    React.Dispatch<React.SetStateAction<Language>>
  ];
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>(STORAGE_KEYS.sound, true);

  // Stats
  const [winCount, setWinCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.winCount) ?? '0', 10);
    } catch {
      return 0;
    }
  });

  // Persist winCount separately (it's a number, not JSON)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.winCount, winCount.toString());
    } catch {
      // Ignore
    }
  }, [winCount]);

  return {
    // Data
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

    // Settings
    apiKey,
    setApiKey,
    language,
    setLanguage,
    soundEnabled,
    setSoundEnabled,

    // Stats
    winCount,
    setWinCount,
  };
}

// ============================================
// useRoulette - Spin logic
// ============================================

interface UseRouletteOptions {
  candidates: MovieItem[];
  onWin: (winner: MovieItem) => void;
  soundEnabled: boolean;
}

export function useRoulette({ candidates, onWin, soundEnabled }: UseRouletteOptions) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningText, setSpinningText] = useState('');
  const candidatesRef = useRef<MovieItem[]>([]);
  const animationRef = useRef<number | null>(null);

  const spin = useCallback(() => {
    const validCandidates = candidates.filter((c) => c.included);
    if (isSpinning || validCandidates.length === 0) return;

    candidatesRef.current = validCandidates;
    setIsSpinning(true);

    // Import audio utils dynamically to avoid circular deps
    import('./utils').then(({ playTick, playWin, vibrate }) => {
      vibrate(50);

      const duration = 2500;
      const start = Date.now();

      const animate = () => {
        const elapsed = Date.now() - start;

        if (elapsed < duration) {
          if (soundEnabled && Math.random() > 0.6) {
            playTick();
          }
          const randomIndex = Math.floor(Math.random() * candidatesRef.current.length);
          setSpinningText(candidatesRef.current[randomIndex].title);
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Pick winner
          const winnerIndex = Math.floor(Math.random() * candidatesRef.current.length);
          const winner = candidatesRef.current[winnerIndex];

          setIsSpinning(false);
          setSpinningText('');

          if (soundEnabled) {
            playWin();
          }
          vibrate([100, 50, 100]);

          onWin(winner);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    });
  }, [candidates, isSpinning, soundEnabled, onWin]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isSpinning,
    spinningText,
    spin,
  };
}

// ============================================
// usePosterCache - Preload posters with priority queue
// ============================================

export function usePosterCache(
  items: Array<{ tmdbData?: TMDBData | null }>,
  limit: number = 50
) {
  const cachedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Delay caching to not block initial render
    const timer = setTimeout(() => {
      const toCache = items
        .filter((i) => i.tmdbData?.poster_path && !cachedRef.current.has(i.tmdbData.poster_path))
        .slice(0, limit);

      // Use requestIdleCallback for non-blocking image preload
      const preloadImages = () => {
        toCache.forEach((item, index) => {
          if (item.tmdbData?.poster_path) {
            // Stagger loads to prevent overwhelming the browser
            setTimeout(() => {
              const img = new Image();
              img.src = `https://image.tmdb.org/t/p/w342${item.tmdbData!.poster_path}`;
              cachedRef.current.add(item.tmdbData!.poster_path!);
            }, index * 100);
          }
        });
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadImages, { timeout: 5000 });
      } else {
        preloadImages();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [items, limit]);
}

// ============================================
// useVirtualList - Virtual scrolling for large lists
// ============================================

interface UseVirtualListOptions {
  itemHeight: number;
  overscan?: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useVirtualList<T>(
  items: T[],
  { itemHeight, overscan = 3, containerRef }: UseVirtualListOptions
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    // Initial measurement
    handleResize();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
    style: {
      position: 'absolute' as const,
      top: (startIndex + index) * itemHeight,
      height: itemHeight,
      left: 0,
      right: 0,
    },
  }));

  return {
    virtualItems: visibleItems,
    totalHeight,
    startIndex,
    endIndex,
  };
}

// ============================================
// usePreloadNextCard - Preload next swipe card
// ============================================

export function usePreloadNextCard(queue: TMDBData[]) {
  useEffect(() => {
    // Preload the next 2 cards
    queue.slice(1, 3).forEach((item) => {
      if (item.poster_path) {
        const img = new Image();
        img.src = `https://image.tmdb.org/t/p/w780${item.poster_path}`;
      }
      if (item.backdrop_path) {
        const img = new Image();
        img.src = `https://image.tmdb.org/t/p/w780${item.backdrop_path}`;
      }
    });
  }, [queue]);
}

// ============================================
// useThrottledCallback - Throttle function calls
// ============================================

export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, delay - (now - lastRan.current));
      }
    }) as T,
    [callback, delay]
  );
}
