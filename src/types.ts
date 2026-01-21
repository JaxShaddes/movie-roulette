// ============================================
// MOVIE ROULETTE - TYPE DEFINITIONS
// ============================================

export interface TMDBData {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number;
  episode_run_time?: number[];
  genre_ids: number[];
  status?: string;
  popularity?: number;
  media_type?: 'movie' | 'tv';
}

export interface Credits {
  cast: Array<{
    id?: number;
    name: string;
    profile_path: string | null;
    character?: string;
  }>;
  director: {
    id?: number;
    name: string;
    profile_path?: string | null;
  } | null;
}

export interface MovieItem {
  id: string;
  title: string;
  included: boolean;
  tmdbData: TMDBData | null;
  type: MediaType;
}

export interface WatchedItem {
  id: string;
  title: string;
  type: MediaType;
  watchedDate: string;
  tmdbData: TMDBData | null;
  rating: number | null;
  origin: 'roulette' | 'seen';
  credits: Credits | null;
}

export interface BacklogItem {
  id: string;
  title: string;
  included: boolean;
  tmdbData: TMDBData | null;
  type: MediaType;
}

export type MediaType = 'movie' | 'tv';

export type TabType = 'home' | 'watchlist' | 'discover' | 'swipe' | 'history' | 'settings';

export type SortMode = 'added' | 'alphabetical' | 'release_new' | 'release_old' | 'rating' | 'runtime';

export type TimeFilter = 'short' | 'medium' | 'long' | null;

export type OriginFilter = 'all' | 'roulette' | 'seen';

export type DiscoverFilterMode = 'top' | 'new' | 'soon' | 'genre';

export interface Filters {
  genres: number[];
  time: TimeFilter;
}

export interface CuratorPick {
  item: TMDBData;
  because: string;
  reason: string;
}

export interface ToastMessage {
  id: number;
  msg: string;
}

// For the rating modal, we need a temporary item that might have extra flags
export interface RateModalItem extends Partial<MovieItem> {
  _isSeenAction?: boolean;
  tmdbData?: TMDBData | null;
}

export interface RecommendationItem extends TMDBData {
  matchScore?: number;
  releaseDate?: Date;
  source?: 'cast' | 'director' | 'similar';
  seedTitle?: string;
  actorName?: string;
  directorName?: string;
}

// App State
export interface AppState {
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

export type Language = 'en-US' | 'pt-PT';

// TMDB API Response Types
export interface TMDBSearchResponse {
  results: TMDBData[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TMDBCreditsResponse {
  cast: Array<{
    id: number;
    name: string;
    profile_path: string | null;
    character: string;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    profile_path: string | null;
    job: string;
    department: string;
  }>;
}

export interface TMDBProvidersResponse {
  results: {
    [key: string]: {
      flatrate?: Array<{
        provider_id: number;
        provider_name: string;
        logo_path: string;
      }>;
      buy?: Array<{
        provider_id: number;
        provider_name: string;
        logo_path: string;
      }>;
    };
  };
}

export interface TMDBVideosResponse {
  results: Array<{
    key: string;
    site: string;
    type: string;
    name: string;
  }>;
}
