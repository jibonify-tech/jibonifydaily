import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Footprints,
  Users,
  PieChart,
  Calendar,
  BookOpen,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { translations } from '../../i18n/translations';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  onOpenQuickExpense: () => void;
  onOpenQuickIncome: () => void;
  profile?: UserProfile;
  onOpenMultiUserModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  onOpenQuickExpense,
  onOpenQuickIncome,
  profile,
  onOpenMultiUserModal,
}) => {
  const t = translations[language];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'accounts', label: t.accounts, icon: Wallet },
    { id: 'transactions', label: t.transactions, icon: Receipt },
    { id: 'outside', label: t.outsideJourneys, icon: Footprints },
    { id: 'people', label: t.peopleLending, icon: Users },
    { id: 'budget', label: t.budget, icon: PieChart },
    { id: 'calendar', label: t.calendar, icon: Calendar },
    { id: 'diary', label: t.diary, icon: BookOpen },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'reminders', label: t.reminders, icon: Bell },
    { id: 'settings', label: t.settings, icon: Settings },
    { id: 'admin', label: t.adminDashboard, icon: ShieldAlert, badge: 'PRO' },
  ];

  return (
    <aside className="hidden md:flex w-56 lg:w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/60 p-3 lg:p-4 shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-4">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
          <button
            onClick={onOpenQuickExpense}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 py-2.5 px-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ খরচ' : '+ Expense'}</span>
          </button>
          <button
            onClick={onOpenQuickIncome}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 py-2.5 px-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ আয়' : '+ Income'}</span>
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="rounded-md bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer & Multi-User Switcher Card */}
      <div className="border-t border-slate-800/80 pt-3 px-1 space-y-2">
        {profile && (
          <button
            type="button"
            onClick={onOpenMultiUserModal}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/70 transition text-left group"
            title={language === 'bn' ? 'অ্যাকাউন্ট পরিবর্তন করুন' : 'Switch User Account'}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-bold text-slate-200 truncate">{profile.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase">{profile.role || 'user'}</span>
                  <span className="text-[9px] text-slate-400">• Switch</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 shrink-0">
              {language === 'bn' ? 'সুইচ' : 'Switch'}
            </div>
          </button>
        )}

        <div className="px-1">
          <p className="text-[11px] text-slate-400 font-medium">
            {language === 'bn' ? 'জীবনফাই ডেইলি v১.০' : 'Jibonify Daily v1.0'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {language === 'bn' ? 'আপনার ব্যক্তিগত আর্থিক সঙ্গী' : 'Personal Daily Finance System'}
          </p>
        </div>
      </div>
    </aside>
  );
};
