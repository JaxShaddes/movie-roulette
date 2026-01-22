// ============================================
// MOVIE ROULETTE - SKELETON LOADERS
// ============================================

import { memo } from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
});

// Poster skeleton
export const PosterSkeleton = memo(function PosterSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-gray-200 animate-pulse', className)}>
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      </div>
    </div>
  );
});

// Card skeleton for discover/swipe
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="border border-black bg-black text-[#EFEEE5] flex flex-col h-full">
      <PosterSkeleton className="aspect-[2/3] w-full" />
      <div className="p-2 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-gray-700 rounded" />
        <Skeleton className="h-3 w-1/2 bg-gray-700 rounded" />
        <div className="grid grid-cols-2 gap-1 mt-2">
          <Skeleton className="h-8 bg-gray-700 rounded" />
          <Skeleton className="h-8 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
});

// List item skeleton
export const ListItemSkeleton = memo(function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-200 animate-pulse">
      <Skeleton className="w-5 h-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
      <Skeleton className="w-8 h-8 rounded" />
    </div>
  );
});

// Swipe card skeleton
export const SwipeCardSkeleton = memo(function SwipeCardSkeleton() {
  return (
    <div className="w-full max-w-sm">
      <div className="relative w-full aspect-[2/3] border-[6px] border-black bg-gray-800 shadow-2xl animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-24">
          <Skeleton className="h-6 w-3/4 bg-gray-700 rounded mb-2" />
          <Skeleton className="h-4 w-1/2 bg-gray-700 rounded" />
        </div>
      </div>
      <div className="flex gap-6 mt-8 justify-center">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="w-20 h-20 rounded-full -mt-2" />
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
    </div>
  );
});

// History item skeleton
export const HistoryItemSkeleton = memo(function HistoryItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-300 animate-pulse">
      <Skeleton className="w-10 h-14 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-12 h-6 rounded" />
        <Skeleton className="w-6 h-6 rounded" />
      </div>
    </div>
  );
});

// Stats skeleton
export const StatsSkeleton = memo(function StatsSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Skeleton className="h-24 rounded" />
        <Skeleton className="h-24 rounded" />
      </div>
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-24 rounded mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-4/5 rounded" />
            <Skeleton className="h-8 w-3/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
});
