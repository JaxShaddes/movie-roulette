// ============================================
// MOVIE ROULETTE - UI COMPONENTS
// ============================================

import React, { memo } from 'react';
import { cn } from '@/utils/cn';

// ============================================
// ICONS
// ============================================

export const Icons = {
  Home: memo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )),

  Watchlist: memo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
    </svg>
  )),

  Discover: memo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )),

  Swipe: memo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm-4-8h2v2H8V5zm0 4h2v2H8V9zm0 4h2v2H8v-2zM5 5h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2z" />
    </svg>
  )),

  History: memo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  )),

  Settings: memo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  )),

  Check: memo(() => (
    <svg className="w-4 h-4 text-[#1D9BF0] fill-current ml-1" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )),

  Info: memo(() => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  )),

  Pencil: memo(() => (
    <svg className="w-3 h-3 text-gray-400 hover:text-black cursor-pointer ml-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )),

  Trash: memo(() => (
    <svg className="w-3 h-3 text-gray-400 hover:text-red-600 cursor-pointer ml-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  )),

  Close: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )),

  ThumbDown: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
    </svg>
  )),

  Heart: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )),

  Eye: memo(() => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  )),

  Play: memo(() => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )),

  Roulette: memo(() => (
    <svg className="w-4 h-4 fill-current text-[#E0245E]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c4.42 0 8 3.58 8 8c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.42 3.58-8 8-8z M12 4v8l5.66 5.66 M12 12l-5.66 5.66" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )),
};

// Set display names for memo components
Icons.Home.displayName = 'Icons.Home';
Icons.Watchlist.displayName = 'Icons.Watchlist';
Icons.Discover.displayName = 'Icons.Discover';
Icons.Swipe.displayName = 'Icons.Swipe';
Icons.History.displayName = 'Icons.History';
Icons.Settings.displayName = 'Icons.Settings';
Icons.Check.displayName = 'Icons.Check';
Icons.Info.displayName = 'Icons.Info';
Icons.Pencil.displayName = 'Icons.Pencil';
Icons.Trash.displayName = 'Icons.Trash';
Icons.Close.displayName = 'Icons.Close';
Icons.ThumbDown.displayName = 'Icons.ThumbDown';
Icons.Heart.displayName = 'Icons.Heart';
Icons.Eye.displayName = 'Icons.Eye';
Icons.Play.displayName = 'Icons.Play';
Icons.Roulette.displayName = 'Icons.Roulette';

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
    <span className="inline-flex items-center gap-1 ml-2 border border-[#E0245E] text-[#E0245E] px-1 rounded text-[8px] font-bold uppercase">
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
      className="animate-toast fixed top-4 right-4 z-[99] bg-black text-[#EFEEE5] px-4 py-3 border border-[#EFEEE5] font-bold text-xs uppercase shadow-lg"
      role="alert"
    >
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
  const count = isFirstSpin ? 60 : 40;
  const colors = isFirstSpin
    ? ['#E0245E', '#1D9BF0', '#000', '#FFD700', '#FF69B4', '#00FF00']
    : ['#E0245E', '#1D9BF0', '#000', '#666'];

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}vw`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            width: isFirstSpin ? '12px' : '8px',
            height: isFirstSpin ? '12px' : '8px',
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${Math.random() * 2 + 2}s`,
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
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
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
// BUTTON
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-bold uppercase tracking-wider transition-all active:translate-y-[1px]';

  const variantClasses = {
    primary: 'bg-black text-[#EFEEE5] hover:bg-gray-800 border-2 border-black',
    secondary: 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-[#EFEEE5]',
    danger: 'bg-transparent text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white',
    ghost: 'bg-transparent text-gray-500 hover:text-black underline',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-4 text-sm',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

// ============================================
// CHECKBOX
// ============================================

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export const Checkbox = memo(function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="checkbox-receipt"
        aria-label={label}
      />
      {label && <span className="font-bold uppercase text-sm">{label}</span>}
    </label>
  );
});

// ============================================
// TOGGLE BUTTONS
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
    <div className={cn('flex border-2 border-black', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 py-2 font-bold uppercase text-xs transition-colors',
            value === option.value ? 'bg-black text-[#EFEEE5]' : 'bg-transparent text-black'
          )}
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
          'bg-gray-200 flex items-center justify-center text-gray-500 text-[8px] uppercase',
          className
        )}
        aria-label="No image available"
      >
        NO IMG
      </div>
    );
  }

  return (
    <img
      src={`https://image.tmdb.org/t/p/${sizeMap[size]}${path}`}
      alt={alt}
      loading="lazy"
      className={cn('object-cover', className)}
    />
  );
});

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState = memo(function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="p-10 border-2 border-dashed border-gray-400 text-center text-gray-500 font-bold uppercase">
      {icon && <div className="mb-4">{icon}</div>}
      {message}
    </div>
  );
});
