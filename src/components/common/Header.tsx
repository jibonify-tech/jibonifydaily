import React from 'react';
import { Sun, Moon, Lock, Globe, User, Users } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { Language, ThemeMode, UserProfile } from '../../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  profile: UserProfile;
  onLockApp: () => void;
  onOpenProfile: () => void;
  onOpenMultiUserModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  theme,
  setTheme,
  profile,
  onLockApp,
  onOpenProfile,
  onOpenMultiUserModal,
}) => {
  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group min-w-0"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white font-bold shadow-md shadow-emerald-950/50">
              <span className="text-base sm:text-lg leading-none">৳</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-lg font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition truncate">
                <span className="inline sm:hidden">
                  {language === 'bn' ? 'জীবনফাই' : 'Jibonify'}
                </span>
                <span className="hidden sm:inline">
                  {language === 'bn' ? 'জীবনফাই ডেইলি' : 'Jibonify Daily'}
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links for larger screens */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`transition whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </button>
          <button
            onClick={() => setCurrentTab('accounts')}
            className={`transition whitespace-nowrap ${
              currentTab === 'accounts'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            {language === 'bn' ? 'অ্যাকাউন্টস' : 'Accounts'}
          </button>
          <button
            onClick={() => setCurrentTab('transactions')}
            className={`transition whitespace-nowrap ${
              currentTab === 'transactions'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            {language === 'bn' ? 'লেনদেন' : 'Transactions'}
          </button>
          <button
            onClick={() => setCurrentTab('outside')}
            className={`transition whitespace-nowrap ${
              currentTab === 'outside'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            {language === 'bn' ? 'বাইরের জার্নি' : 'Outside Trips'}
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`transition whitespace-nowrap ${
              currentTab === 'reports'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            {language === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports'}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* PWA Install */}
          <PWAInstallButton language={language} />

          {/* Bangla ↔ English 1-click switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition active:scale-95 whitespace-nowrap"
            title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">{language === 'bn' ? 'English' : 'বাংলা'}</span>
            <span className="sm:hidden">{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition shrink-0"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* PIN Lock button if enabled */}
          {profile.pinLockEnabled && (
            <button
              onClick={onLockApp}
              className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition shrink-0"
              title={language === 'bn' ? 'অ্যাপ লক করুন' : 'Lock App'}
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* User Profile & Multi-User Switcher avatar/button */}
          <button
            onClick={onOpenMultiUserModal || onOpenProfile}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-800 border border-slate-700 p-1 hover:border-indigo-500/60 hover:bg-slate-750 transition shrink-0 group"
            title={
              language === 'bn'
                ? `${profile.name} (ক্লিক করে অ্যাকাউন্ট পরিবর্তন করুন)`
                : `${profile.name} (Click to switch user account)`
            }
          >
            <div className="h-7 w-7 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:flex flex-col text-left pr-1.5 leading-none">
              <span className="text-xs font-semibold text-slate-200 max-w-[95px] truncate">
                {profile.name.split(' ')[0]}
              </span>
              <span className="text-[9px] text-indigo-400 font-bold uppercase mt-0.5">
                {profile.role || 'user'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
