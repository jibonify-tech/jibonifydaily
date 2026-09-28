import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC<{ language?: 'bn' | 'en' }> = ({ language = 'bn' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/30">
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <span>
        {language === 'bn'
          ? 'অফলাইন মোড সক্রিয় — ক্যাশ করা লোকাল ডাটা ব্যবহার হচ্ছে'
          : 'Offline Mode Active — Using cached local data'}
      </span>
    </div>
  );
};
