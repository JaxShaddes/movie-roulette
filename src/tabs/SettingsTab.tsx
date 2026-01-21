// ============================================
// MOVIE ROULETTE - SETTINGS TAB
// ============================================

import { useRef, memo } from 'react';
import { exportData, vibrate } from '@/utils';
import { Button, Checkbox } from '@/components/ui';
import type { Language } from '@/types';

interface SettingsTabProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isSyncing: boolean;
  onSync: () => void;
  onImport: (file: File) => void;
  onClearMovies: () => void;
  onClearTV: () => void;
  t: (key: string) => string;
  showToast: (msg: string) => void;
}

export const SettingsTab = memo(function SettingsTab({
  apiKey,
  setApiKey,
  language,
  setLanguage,
  soundEnabled,
  setSoundEnabled,
  isSyncing,
  onSync,
  onImport,
  onClearMovies,
  onClearTV,
  t,
  showToast,
}: SettingsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportData();
    showToast(t('EXPORT'));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleClearMovies = () => {
    if (confirm(t('CONFIRM_CLEAR'))) {
      vibrate(50);
      onClearMovies();
    }
  };

  const handleClearTV = () => {
    if (confirm(t('CONFIRM_CLEAR'))) {
      vibrate(50);
      onClearTV();
    }
  };

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black uppercase mb-6">{t('SETTINGS_TITLE')}</h1>

      <div className="space-y-6">
        {/* Language */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            {t('SETTINGS_LANG_LABEL')}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full p-4 border-2 border-black bg-transparent font-bold uppercase"
          >
            <option value="en-US">ENGLISH</option>
            <option value="pt-PT">PORTUGUÊS</option>
          </select>
        </div>

        {/* Sound */}
        <div className="flex items-center gap-4 border-2 border-black p-4">
          <Checkbox
            checked={soundEnabled}
            onChange={() => setSoundEnabled(!soundEnabled)}
            label={t('SOUND')}
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            {t('SETTINGS_API_LABEL')}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-4 border-2 border-black bg-transparent font-mono text-xs"
            placeholder="API KEY"
            autoComplete="off"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Get your free key at{' '}
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              themoviedb.org
            </a>
          </p>
        </div>

        {/* Sync */}
        <div className="pt-6 border-t-2 border-black">
          <h3 className="font-bold uppercase text-xs mb-2">Sync</h3>
          <Button
            variant="primary"
            size="lg"
            onClick={onSync}
            disabled={isSyncing || !apiKey}
            className="w-full bg-[#1D9BF0] hover:bg-[#1A8CD8] border-[#1D9BF0]"
          >
            {isSyncing ? 'SYNCING...' : t('SYNC_DATA')}
          </Button>
          <p className="text-[10px] text-gray-500 mt-1">{t('SYNC_DESC')}</p>
        </div>

        {/* Import/Export */}
        <div className="pt-6 border-t-2 border-black">
          <h3 className="font-bold uppercase text-xs mb-2">Data</h3>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleImportClick}
            className="w-full mb-2"
          >
            {t('IMPORT')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="primary" size="lg" onClick={handleExport} className="w-full">
            {t('EXPORT')}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t-4 border-red-600">
          <h3 className="text-red-600 font-bold uppercase text-xs mb-4">
            {t('DANGER_ZONE')}
          </h3>
          <Button
            variant="danger"
            size="lg"
            onClick={handleClearMovies}
            className="w-full mb-2"
          >
            {t('BTN_CLEAR_MOVIES')}
          </Button>
          <Button variant="danger" size="lg" onClick={handleClearTV} className="w-full">
            {t('BTN_CLEAR_TV')}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 text-[10px] text-gray-400">
          <p>V46 REACT/VITE/TYPESCRIPT</p>
          <p className="mt-1">Made with ❤️ & 🎰</p>
        </div>
      </div>
    </div>
  );
});
