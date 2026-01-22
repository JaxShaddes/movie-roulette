// ============================================
// MOVIE ROULETTE - PAGE TRANSITION COMPONENT
// ============================================

import { memo, useEffect, useState, useRef } from 'react';
import { cn } from '@/utils/cn';

interface PageTransitionProps {
  children: React.ReactNode;
  show: boolean;
  direction?: 'fade' | 'slide-up' | 'slide-left' | 'scale';
  duration?: number;
  className?: string;
}

export const PageTransition = memo(function PageTransition({
  children,
  show,
  direction = 'fade',
  duration = 200,
  className,
}: PageTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready for animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-[${duration}ms]`;

    switch (direction) {
      case 'slide-up':
        return cn(
          baseClasses,
          durationClass,
          isAnimating
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        );
      case 'slide-left':
        return cn(
          baseClasses,
          durationClass,
          isAnimating
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-4'
        );
      case 'scale':
        return cn(
          baseClasses,
          durationClass,
          isAnimating
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        );
      case 'fade':
      default:
        return cn(
          baseClasses,
          durationClass,
          isAnimating ? 'opacity-100' : 'opacity-0'
        );
    }
  };

  return (
    <div
      className={cn(getAnimationClasses(), className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
});

// Tab transition wrapper
interface TabTransitionProps {
  activeTab: string;
  tabKey: string;
  children: React.ReactNode;
}

export const TabTransition = memo(function TabTransition({
  activeTab,
  tabKey,
  children,
}: TabTransitionProps) {
  const [mounted, setMounted] = useState(activeTab === tabKey);
  const wasActive = useRef(activeTab === tabKey);

  useEffect(() => {
    if (activeTab === tabKey) {
      setMounted(true);
      wasActive.current = true;
    } else if (wasActive.current) {
      // Keep mounted during exit animation
      const timer = setTimeout(() => {
        setMounted(false);
        wasActive.current = false;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab, tabKey]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'transition-all duration-150 ease-out',
        activeTab === tabKey
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 absolute inset-0 pointer-events-none'
      )}
    >
      {children}
    </div>
  );
});
