import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  BarChart3,
  Menu,
  X,
  Wallet,
  Footprints,
  Users,
  PieChart,
  Calendar,
  BookOpen,
  Bell,
  Settings,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  onOpenQuickExpense: () => void;
  onOpenQuickIncome: () => void;
  onOpenTransfer: () => void;
  onOpenMultiUserModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  language,
  onOpenQuickExpense,
  onOpenQuickIncome,
  onOpenTransfer,
  onOpenMultiUserModal,
}) => {
  const t = translations[language];
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreItems = [
    { id: 'accounts', label: t.accounts, icon: Wallet },
    { id: 'outside', label: t.outsideJourneys, icon: Footprints },
    { id: 'people', label: t.peopleLending, icon: Users },
    { id: 'budget', label: t.budget, icon: PieChart },
    { id: 'calendar', label: t.calendar, icon: Calendar },
    { id: 'diary', label: t.diary, icon: BookOpen },
    { id: 'reminders', label: t.reminders, icon: Bell },
    { id: 'settings', label: t.settings, icon: Settings },
    { id: 'admin', label: t.adminDashboard, icon: ShieldAlert },
  ];

  return (
    <>
      {/* Central Floating Plus Overlay Menu */}
      {showAddMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs p-4 md:hidden">
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl mb-16 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-semibold text-white">
                {language === 'bn' ? 'নতুন হিসাব যোগ করুন' : 'Record New Hisab'}
              </span>
              <button
                onClick={() => setShowAddMenu(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenQuickExpense();
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-rose-950/40 border border-rose-600/30 p-3 text-left hover:bg-rose-900/40 transition active:scale-98"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {language === 'bn' ? 'খরচ লিখুন (Expense)' : 'Record Expense'}
                </p>
                <p className="text-xs text-rose-300/80">
                  {language === 'bn' ? 'যাতায়াত, খাবার, শপিং বা অন্যান্য খরচ' : 'Transport, food, bills or shopping'}
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenQuickIncome();
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-600/30 p-3 text-left hover:bg-emerald-900/40 transition active:scale-98"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {language === 'bn' ? 'আয় যোগ করুন (Income)' : 'Record Income'}
                </p>
                <p className="text-xs text-emerald-300/80">
                  {language === 'bn' ? 'বেতন, ব্যবসা বা উপহারের টাকা' : 'Salary, freelance, or gift cash'}
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenTransfer();
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-blue-950/40 border border-blue-600/30 p-3 text-left hover:bg-blue-900/40 transition active:scale-98"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {language === 'bn' ? 'টাকা স্থানান্তর (Transfer)' : 'Transfer Money'}
                </p>
                <p className="text-xs text-blue-300/80">
                  {language === 'bn' ? 'ক্যাশ ↔ বিকাশ ↔ ব্যাংক ব্যালেন্স বদল' : 'Move funds between accounts'}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs p-4 md:hidden">
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl mb-16 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-semibold text-white">
                {language === 'bn' ? 'অন্যান্য মেনু' : 'All Modules'}
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-xl p-3 text-left text-xs font-medium transition ${
                      isActive
                        ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-semibold'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {onOpenMultiUserModal && (
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenMultiUserModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40 transition active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">
                      {language === 'bn' ? 'মাল্টি-ইউজার লগইন ও সুইচ' : 'Multi-User Switch & Login'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {language === 'bn' ? 'অ্যাকাউন্ট পরিবর্তন বা নতুন লগইন' : 'Switch account or log in'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold">
                  {language === 'bn' ? 'সুইচ' : 'Switch'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg px-2 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition ${
              currentTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t.dashboard}</span>
          </button>

          <button
            onClick={() => setCurrentTab('transactions')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition ${
              currentTab === 'transactions' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t.transactions}</span>
          </button>

          {/* Central Action Plus Button */}
          <div className="relative -top-3">
            <button
              onClick={() => setShowAddMenu(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 active:scale-90 transition border-4 border-slate-900"
              title={language === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition ${
              currentTab === 'reports' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t.reports}</span>
          </button>

          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition ${
              moreItems.some((m) => m.id === currentTab) ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">{language === 'bn' ? 'মেনু' : 'More'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
