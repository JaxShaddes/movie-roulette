// ============================================
// MOVIE ROULETTE - UI COMPONENTS (v2.0)
// Refined Brutalist Design
// ============================================

import React, { memo } from 'react';
import { cn } from '@/utils/cn';

// ============================================
// ICONS (Slightly larger for better touch)
// ============================================

export const Icons = {
  Home: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )),

  Watchlist: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
    </svg>
  )),

  Discover: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )),

  Swipe: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm-4-8h2v2H8V5zm0 4h2v2H8V9zm0 4h2v2H8v-2zM5 5h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2z" />
    </svg>
  )),

  History: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  )),

  Settings: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  )),

  Check: memo(() => (
    <svg className="w-4 h-4 text-[#1D9BF0] fill-current ml-1" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )),

  Info: memo(() => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  )),

  Pencil: memo(() => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )),

  Trash: memo(() => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  )),

  Close: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )),

  ThumbDown: memo(() => (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
    </svg>
  )),

  Heart: memo(() => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )),

  Eye: memo(() => (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  )),

  Play: memo(() => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )),

  Roulette: memo(() => (
    <svg className="w-4 h-4 fill-current text-[#E0245E]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c4.42 0 8 3.58 8 8c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.42 3.58-8 8-8z M12 4v8l5.66 5.66 M12 12l-5.66 5.66" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )),
  
  Plus: memo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  )),
  
  ChevronDown: memo(() => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  )),
};

// Set display names for memo components
Object.entries(Icons).forEach(([name, component]) => {
  component.displayName = `Icons.${name}`;
});

// ============================================
// VERIFIED BADGE
// ============================================

export const VerifiedBadge = memo(function VerifiedBadge() {
  return <Icons.Check />;
});

// ============================================
// ROULETTE WIN BADGE
// ============================================

export const RouletteBadge = memo(function RouletteBadge() {
  return (
    <span className="inline-flex items-center gap-1 ml-2 bg-[#E0245E]/10 text-[#E0245E] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
      <Icons.Roulette /> WIN
    </span>
  );
});

// ============================================
// TOAST NOTIFICATION
// ============================================

interface ToastProps {
  msg: string;
}

export const Toast = memo(function Toast({ msg }: ToastProps) {
  return (
    <div
      className="animate-toast bg-[#1a1a1a] text-[#EFEEE5] px-5 py-3 rounded-lg shadow-xl font-semibold text-sm flex items-center gap-2"
      role="alert"
    >
      <span className="text-lg">✓</span>
      {msg}
    </div>
  );
});

// ============================================
// TOAST CONTAINER
// ============================================

interface ToastContainerProps {
  toasts: Array<{ id: number; msg: string }>;
}

export const ToastContainer = memo(function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} msg={t.msg} />
      ))}
    </div>
  );
});

// ============================================
// CONFETTI
// ============================================

interface ConfettiProps {
  isFirstSpin?: boolean;
}

export const Confetti = memo(function Confetti({ isFirstSpin = false }: ConfettiProps) {
  const count = isFirstSpin ? 80 : 50;
  const colors = isFirstSpin
    ? ['#E0245E', '#1D9BF0', '#FFD700', '#FF69B4', '#00FF00', '#FF6B35']
    : ['#E0245E', '#1D9BF0', '#000', '#FFD700'];

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}vw`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            width: isFirstSpin ? '14px' : '10px',
            height: isFirstSpin ? '14px' : '10px',
            animationDelay: `${Math.random() * 0.7}s`,
            animationDuration: `${Math.random() * 2 + 2.5}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
});

// ============================================
// LOADING SPINNER
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = memo(function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'border-black border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
});

// ============================================
// BUTTON (44px min touch target)
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'love';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn font-semibold uppercase tracking-wide transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-transparent text-red-600 border-2 border-red-500 hover:bg-red-600 hover:text-white',
    ghost: 'btn-ghost',
    love: 'btn-love',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

// ============================================
// ICON BUTTON (Perfect circle, 44px touch target)
// ============================================

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  label: string;
}

export const IconButton = memo(function IconButton({
  variant = 'default',
  size = 'md',
  className,
  children,
  label,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const variantClasses = {
    default: 'bg-white/80 hover:bg-white text-gray-700 hover:text-black border border-gray-200',
    ghost: 'bg-transparent hover:bg-black/5 text-gray-500 hover:text-black',
    danger: 'bg-transparent hover:bg-red-50 text-gray-400 hover:text-red-600',
  };

  return (
    <button
      className={cn(
        'rounded-full flex items-center justify-center transition-all active:scale-95',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
});

// ============================================
// CHECKBOX (Larger touch target)
// ============================================

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export const Checkbox = memo(function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="checkbox-wrapper cursor-pointer flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="checkbox-receipt"
        aria-label={label}
      />
      {label && <span className="font-semibold text-sm">{label}</span>}
    </label>
  );
});

// ============================================
// TOGGLE BUTTONS (Pill style)
// ============================================

interface ToggleButtonsProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ToggleButtons = memo(function ToggleButtons({
  options,
  value,
  onChange,
  className,
}: ToggleButtonsProps) {
  return (
    <div className={cn('toggle-group', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn('toggle-item', value === option.value && 'active')}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});

// ============================================
// POSTER IMAGE
// ============================================

interface PosterImageProps {
  path: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PosterImage = memo(function PosterImage({
  path,
  alt,
  size = 'md',
  className,
}: PosterImageProps) {
  const sizeMap = {
    sm: 'w92',
    md: 'w185',
    lg: 'w342',
    xl: 'w780',
  };

  if (!path) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 text-xs font-medium rounded-lg',
          className
        )}
        aria-label="No image available"
      >
        <span className="text-2xl">🎬</span>
      </div>
    );
  }

  return (
    <img
      src={`https://image.tmdb.org/t/p/${sizeMap[size]}${path}`}
      alt={alt}
      loading="lazy"
      className={cn('object-cover rounded-lg', className)}
    />
  );
});

// ============================================
// SKELETON LOADER
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'poster' | 'avatar' | 'button';
}

export const Skeleton = memo(function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const variantClasses = {
    text: 'skeleton skeleton-text h-4 w-full',
    title: 'skeleton skeleton-title h-6 w-3/4',
    poster: 'skeleton skeleton-poster w-full aspect-[2/3]',
    avatar: 'skeleton skeleton-avatar w-12 h-12 rounded-full',
    button: 'skeleton h-11 w-24 rounded-lg',
  };

  return <div className={cn(variantClasses[variant], className)} />;
});

// ============================================
// EMPTY STATE (Delightful)
// ============================================

interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState = memo(function EmptyState({ emoji = '📭', title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">{emoji}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-text">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
});

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
  title: string;
  count?: number;
  action?: React.ReactNode;
}

export const SectionHeader = memo(function SectionHeader({ title, count, action }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="section-header flex items-center gap-2">
        {title}
        {count !== undefined && (
          <span className="bg-black text-[#EFEEE5] px-2 py-0.5 rounded-full text-[10px]">
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  );
});

// ============================================
// CARD
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = memo(function Card({ children, className, onClick, hoverable = true }: CardProps) {
  return (
    <div
      className={cn(
        'card p-4',
        hoverable && 'cursor-pointer',
        !hoverable && 'hover:transform-none hover:shadow-none',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

// ============================================
// TAG / CHIP
// ============================================

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'love' | 'verified';
  className?: string;
}

export const Tag = memo(function Tag({ children, variant = 'default', className }: TagProps) {
  const variantClasses = {
    default: 'tag',
    outline: 'tag tag-outline',
    love: 'tag tag-love',
    verified: 'tag tag-verified',
  };

  return <span className={cn(variantClasses[variant], className)}>{children}</span>;
});

// ============================================
// RATING STARS
// ============================================

interface RatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md';
}

export const RatingDisplay = memo(function RatingDisplay({ rating, size = 'sm' }: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
  };

  return (
    <div className={cn('flex items-center font-bold', sizeClasses[size])}>
      <span className="text-yellow-500">★</span>
      <span>{rating.toFixed(1)}</span>
    </div>
  );
});

// ============================================
// MATCH BADGE
// ============================================

interface MatchBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

export const MatchBadge = memo(function MatchBadge({ score, size = 'sm' }: MatchBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  const colorClass = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-[#1D9BF0]' : 'bg-gray-500';

  return (
    <span className={cn('text-white font-bold rounded', sizeClasses[size], colorClass)}>
      {score}%
    </span>
  );
});
