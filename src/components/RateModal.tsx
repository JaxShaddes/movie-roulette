// ============================================
// MOVIE ROULETTE - RATING MODAL
// ============================================

import { memo } from 'react';
import { Button } from './ui';

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number | 'skip') => void;
  t: (key: string) => string;
}

export const RateModal = memo(function RateModal({
  isOpen,
  onClose,
  onRate,
  t,
}: RateModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-modal-title"
    >
      <div
        className="bg-[#EFEEE5] border-4 border-black p-6 w-full max-w-sm shadow-2xl relative text-center animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rate-modal-title"
          className="text-xl font-black uppercase mb-6 font-sans"
        >
          {t('RATE_TITLE')}
        </h2>

        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onRate(5)}
            className="w-full"
          >
            5 - {t('RATE_5')}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onRate(4)}
            className="w-full"
          >
            4 - {t('RATE_4')}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onRate(3)}
            className="w-full"
          >
            3 - {t('RATE_3')}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onRate(2)}
            className="w-full"
          >
            2 - {t('RATE_2')}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onRate(1)}
            className="w-full"
          >
            1 - {t('RATE_1')}
          </Button>

          <button
            onClick={() => onRate('skip')}
            className="p-3 bg-transparent border-2 border-black border-dashed hover:bg-black/5 uppercase font-bold tracking-wider text-xs text-gray-600 hover:text-black mt-2"
          >
            {t('RATE_SKIP')}
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="mt-6"
        >
          CANCEL
        </Button>
      </div>
    </div>
  );
});
