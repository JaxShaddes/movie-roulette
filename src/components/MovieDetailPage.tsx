// ============================================
// MOVIE ROULETTE - MOVIE DETAIL PAGE
// ============================================

import { useState, useEffect, memo, useCallback } from 'react';
import { TMDB_BASE_URL, GENRES, CAST_LIMIT, SIMILAR_LIMIT } from '@/constants';
import { useAbortController } from '@/hooks';
import { normalizeMediaType } from '@/utils';
import { Icons, PosterImage, Button, Spinner } from './ui';
import type { TMDBData, Language, MediaType } from '@/types';

interface MovieDetailPageProps {
  item: {
    tmdbData: TMDBData | null;
    title: string;
    type?: string;
  } | null;
  onClose: () => void;
  t: (key: string) => string;
  apiKey: string;
  language: Language;
  onAdd: (item: TMDBData) => void;
  onAddToWatchlist: (item: TMDBData) => void;
  onSeen: (item: TMDBData) => void;
  onBlacklist: (id: number) => void;
  onNavigate: (item: { tmdbData: TMDBData; title: string; type: string }) => void;
}

interface CastMember {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface Video {
  key: string;
  site: string;
  type: string;
}

export const MovieDetailPage = memo(function MovieDetailPage({
  item,
  onClose,
  t,
  apiKey,
  language,
  onAddToWatchlist,
  onSeen,
  onBlacklist,
  onNavigate,
}: MovieDetailPageProps) {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similar, setSimilar] = useState<TMDBData[]>([]);
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  const { getSignal } = useAbortController();

  useEffect(() => {
    if (!item?.tmdbData || !apiKey) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setCast([]);
      setSimilar([]);
      setProviders(null);
      setTrailer(null);

      const signal = getSignal();
      const mediaType: MediaType = normalizeMediaType(item.type);
      const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
      const region = language === 'pt-PT' ? 'PT' : 'US';
      const tmdbId = item.tmdbData!.id;

      try {
        // Fetch all in parallel
        const [creditsRes, similarRes, provRes, vidRes] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}/credits?api_key=${apiKey}&language=${language}`, { signal }),
          fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}/similar?api_key=${apiKey}&language=${language}&page=1`, { signal }),
          fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}/watch/providers?api_key=${apiKey}`, { signal }),
          fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}/videos?api_key=${apiKey}&language=${language}`, { signal }),
        ]);

        const [creditsData, similarData, provData, vidData] = await Promise.all([
          creditsRes.json(),
          similarRes.json(),
          provRes.json(),
          vidRes.json(),
        ]);

        if (creditsData.cast) {
          setCast(creditsData.cast.slice(0, CAST_LIMIT));
        }

        if (similarData.results) {
          setSimilar(similarData.results.slice(0, SIMILAR_LIMIT));
        }

        if (provData.results?.[region]) {
          setProviders(provData.results[region].flatrate || provData.results[region].buy || null);
        }

        // Find trailer
        let vid = vidData.results?.find((v: Video) => v.site === 'YouTube' && v.type === 'Trailer');

        // If no trailer in current language, try English
        if (!vid && language !== 'en-US') {
          const vidResEn = await fetch(
            `${TMDB_BASE_URL}/${endpoint}/${tmdbId}/videos?api_key=${apiKey}&language=en-US`,
            { signal }
          );
          const vidDataEn = await vidResEn.json();
          vid = vidDataEn.results?.find((v: Video) => v.site === 'YouTube' && v.type === 'Trailer');
        }

        setTrailer(vid || null);
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Detail fetch error:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [item, apiKey, language, getSignal]);

  const handleNavigateToSimilar = useCallback(
    (similarItem: TMDBData) => {
      const type = normalizeMediaType(item?.type);
      onNavigate({
        tmdbData: similarItem,
        title: similarItem.title || similarItem.name || '',
        type,
      });
    },
    [item?.type, onNavigate]
  );

  if (!item?.tmdbData) return null;

  const data = item.tmdbData;

  return (
    <div className="fixed inset-0 z-[80] bg-[#EFEEE5] overflow-y-auto animate-slide-up">
      {/* Header Image */}
      <div className="relative aspect-video w-full bg-black">
        {data.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w780${data.backdrop_path}`}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#EFEEE5] via-transparent to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md z-10"
          aria-label="Close"
        >
          <Icons.Close />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-black uppercase leading-none mb-2 drop-shadow-md">
            {data.title || data.name}
          </h1>
          <div className="flex gap-2 text-xs font-bold uppercase text-gray-700 items-center">
            <span className="bg-white/80 backdrop-blur px-2 py-1">
              {(data.release_date || data.first_air_date || '').split('-')[0] || t('UNKNOWN_YEAR')}
            </span>
            <span className="bg-white/80 backdrop-blur px-2 py-1">
              ★ {data.vote_average?.toFixed(1)}
            </span>
            <span className="bg-[#1D9BF0] text-white px-2 py-1">
              {Math.round(data.vote_average * 10)}% Match
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-8">
        {loading && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onAddToWatchlist(data)}
            className="flex-1"
          >
            {t('BTN_ADD_WATCHLIST')}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => onSeen(data)}
            className="flex-1"
          >
            {t('BTN_SEEN')}
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              onBlacklist(data.id);
              onClose();
            }}
            aria-label={t('BTN_HIDE')}
          >
            <Icons.ThumbDown />
          </Button>
        </div>

        {/* Trailer & Providers */}
        <div className="flex gap-3">
          {trailer && (
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black text-[#EFEEE5] py-3 font-bold uppercase text-center text-sm rounded flex items-center justify-center gap-2"
            >
              <Icons.Play /> {t('BTN_TRAILER')}
            </a>
          )}
          {providers && providers.length > 0 && (
            <div className="flex -space-x-2 items-center">
              {providers.slice(0, 3).map((p) => (
                <img
                  key={p.provider_id}
                  src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                  alt={p.provider_name}
                  className="w-10 h-10 rounded-full border-2 border-[#EFEEE5]"
                />
              ))}
            </div>
          )}
        </div>

        {/* Overview */}
        <div>
          <p className="text-sm leading-relaxed font-sans text-gray-800">
            {data.overview || t('NO_PLOT')}
          </p>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {data.genre_ids?.map(
            (id) =>
              GENRES[id] && (
                <span
                  key={id}
                  className="text-[10px] uppercase font-bold border border-black px-2 py-1 rounded-full"
                >
                  {GENRES[id]}
                </span>
              )
          )}
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-xs mb-3 tracking-widest text-gray-500">
              CAST
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
              {cast.map((c) => (
                <div key={c.id} className="w-20 flex-shrink-0 text-center">
                  <PosterImage
                    path={c.profile_path}
                    alt={c.name}
                    size="md"
                    className="w-20 h-20 object-cover rounded-full mb-2 bg-gray-200"
                  />
                  <p className="text-[9px] font-bold uppercase leading-tight truncate">
                    {c.name}
                  </p>
                  <p className="text-[8px] text-gray-500 truncate">{c.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <div>
            <h3 className="font-bold uppercase text-xs mb-3 tracking-widest text-gray-500">
              {t('MORE_LIKE_THIS')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {similar.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleNavigateToSimilar(s)}
                  className="relative aspect-[2/3] bg-gray-200 group"
                >
                  <PosterImage
                    path={s.poster_path}
                    alt={s.title || s.name || ''}
                    size="md"
                    className="w-full h-full"
                  />
                  <div className="absolute top-0 right-0 bg-[#1D9BF0] text-white text-[8px] font-bold px-1 py-0.5">
                    {Math.round(s.vote_average * 10)}%
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-xs">+</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
