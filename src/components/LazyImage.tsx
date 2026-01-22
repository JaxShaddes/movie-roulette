// ============================================
// MOVIE ROULETTE - LAZY IMAGE COMPONENT
// ============================================

import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/utils/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  placeholderClassName,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Skeleton */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
            placeholderClassName
          )}
        >
          <svg
            className="w-8 h-8 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 text-[8px] uppercase',
            placeholderClassName
          )}
        >
          NO IMG
        </div>
      )}

      {/* Actual image - only render when in view */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
});

// Optimized Poster Image with lazy loading
interface OptimizedPosterProps {
  path: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean; // Skip lazy loading for above-the-fold images
}

const sizeMap = {
  sm: 'w92',
  md: 'w185',
  lg: 'w342',
  xl: 'w780',
};

export const OptimizedPoster = memo(function OptimizedPoster({
  path,
  alt,
  size = 'md',
  className,
  priority = false,
}: OptimizedPosterProps) {
  if (!path) {
    return (
      <div
        className={cn(
          'bg-gray-200 flex items-center justify-center text-gray-500 text-[8px] uppercase',
          className
        )}
      >
        NO IMG
      </div>
    );
  }

  const src = `https://image.tmdb.org/t/p/${sizeMap[size]}${path}`;

  // For priority images, use native lazy loading
  if (priority) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('object-cover', className)}
        loading="eager"
        decoding="async"
      />
    );
  }

  return <LazyImage src={src} alt={alt} className={className} />;
});
