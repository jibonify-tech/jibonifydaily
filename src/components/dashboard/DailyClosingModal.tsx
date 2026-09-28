import React, { useState } from 'react';
import { Moon, Star, CheckCircle, X, BookOpen, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Account, Category, DailyClosing, DaySession, Language, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface DailyClosingModalProps {
  daySession?: DaySession;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onConfirmClosing: (closing: DailyClosing) => void;
  onClose: () => void;
  language: Language;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  daySession,
  transactions,
  categories,
  accounts,
  onConfirmClosing,
  onClose,
  language,
}) => {
  const t = translations[language];
  const todayStr = daySession?.date || new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Filter today's active transactions
  const todayTxs = transactions.filter((t) => !t.isDeleted && t.date === todayStr);

  const totalIncome = todayTxs
    .filter((t) => t.type === 'income' || t.type === 'repayment_received')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = todayTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalTransfers = todayTxs
    .filter((t) => t.type === 'transfer')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const moneyGiven = todayTxs
    .filter((t) => t.type === 'lend')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const moneyReceived = todayTxs
    .filter((t) => t.type === 'repayment_received')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpense;
  const todaySavings = Math.max(0, netCashFlow);

  // Group expenses by category
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const catExpenseMap: Record<string, number> = {};
  todayTxs
    .filter((t) => t.type === 'expense' && t.categoryId)
    .forEach((t) => {
      const cid = t.categoryId!;
      catExpenseMap[cid] = (catExpenseMap[cid] || 0) + Number(t.amount);
    });

  const categoryExpenses = Object.entries(catExpenseMap).map(([cid, amt]) => {
    const cat = categoryMap[cid];
    const catName = cat ? (language === 'bn' ? cat.nameBn : cat.nameEn) : cid;
    const percentage = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
    return {
      categoryId: cid,
      categoryName: catName,
      amount: amt,
      percentage,
    };
  }).sort((a, b) => b.amount - a.amount);

  // Pocket cash
  const pocketAcc = accounts.find((a) => a.isDefaultPocket || a.subType === 'pocket');
  const actualPocketCash = pocketAcc ? pocketAcc.balance : 0;
  const expectedPocketCash = daySession?.openingCash ? daySession.openingCash + totalIncome - totalExpense : actualPocketCash;
  const cashDifference = actualPocketCash - expectedPocketCash;

  // Diary inputs
  const [diaryActivities, setDiaryActivities] = useState('');
  const [diaryPlaces, setDiaryPlaces] = useState('');
  const [diaryImportantEvents, setDiaryImportantEvents] = useState('');
  const [diaryFinancialNotes, setDiaryFinancialNotes] = useState('');
  const [rating, setRating] = useState(5);

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    const closing: DailyClosing = {
      id: 'closing_' + todayStr,
      date: todayStr,
      daySessionId: daySession?.id || 'day_' + todayStr,
      closedAt: currentTime,
      openingTotal: daySession?.openingTotal || 0,
      totalIncome,
      totalExpense,
      totalTransfers,
      moneyGiven,
      moneyReceived,
      expectedPocketCash,
      actualPocketCash,
      cashDifference,
      todaySavings,
      netCashFlow,
      categoryExpenses,
      diaryActivities,
      diaryPlaces,
      diaryImportantEvents,
      diaryFinancialNotes,
      rating,
    };
    onConfirmClosing(closing);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'bn' ? 'আজকের হিসাব সমাপ্ত করুন (Daily Closing)' : 'Daily Closing & Financial Diary'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'সারাদিনের আয়, ব্যয়, সঞ্চয় ও ডায়েরির চূড়ান্ত হিসাব' : 'End of day closing review and life reflections'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFinalize} className="mt-4 space-y-4">
          {/* Summary Key Financial Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
              <span className="text-[11px] text-slate-400">{t.openingBalance}</span>
              <p className="text-base font-bold text-slate-200 font-num">
                {formatCurrency(daySession?.openingTotal || 0, language)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
              <span className="text-[11px] text-emerald-300">{t.todayIncome}</span>
              <p className="text-base font-bold text-emerald-400 font-num">
                {formatCurrency(totalIncome, language)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
              <span className="text-[11px] text-rose-300">{t.todayExpense}</span>
              <p className="text-base font-bold text-rose-400 font-num">
                {formatCurrency(totalExpense, language)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
              <span className="text-[11px] text-blue-300">{t.todayNetFlow}</span>
              <p className={`text-base font-bold font-num ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netCashFlow, language)}
              </p>
            </div>
          </div>

          {/* Where Money Was Spent */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">
              {language === 'bn' ? 'আজ কোথায় কত টাকা খরচ হয়েছে (খাত অনুযায়ী):' : 'Expense Breakdown by Category:'}
            </h4>
            {categoryExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-1">{t.noTransactionsToday}</p>
            ) : (
              <div className="space-y-2 pt-1">
                {categoryExpenses.map((cat) => (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat.categoryName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-num">{cat.percentage}%</span>
                        <span className="font-semibold text-white font-num">{formatCurrency(cat.amount, language)}</span>
                      </div>
                    </div>
                    {/* Visual Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Diary Section */}
          <div className="rounded-xl bg-slate-800/40 border border-purple-500/30 p-3.5 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>{language === 'bn' ? 'আমার দৈনিক ডায়েরি (My Daily Diary)' : 'My Daily Diary'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'আজ সারাদিন কি কি করলেন?' : 'What did you do today?'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'অফিস কাজ, গুরুত্বপূর্ণ মিটিং...' : 'Daily activities...'}
                  value={diaryActivities}
                  onChange={(e) => setDiaryActivities(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'কোথায় গিয়েছিলেন ও কেন?' : 'Where did you go & why?'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'ধানমন্ডি ক্লায়েন্ট অফিস, বাজার...' : 'Places visited...'}
                  value={diaryPlaces}
                  onChange={(e) => setDiaryPlaces(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'আজকের আর্থিক মন্তব্য ও গুরুত্বপূর্ণ ঘটনা' : 'Financial notes & special events'}
              </label>
              <textarea
                rows={2}
                placeholder={language === 'bn' ? 'যেমন: অপ্রয়োজনীয় খরচ কম হয়েছে, বাজেটের মধ্যে থাকতে পেরেছি।' : 'Financial reflections...'}
                value={diaryFinancialNotes}
                onChange={(e) => setDiaryFinancialNotes(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 resize-none"
              />
            </div>

            {/* Discipline Rating */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate-300">
                {language === 'bn' ? 'আজকের আর্থিক শৃঙ্খলার রেটিং:' : 'Financial Discipline Rating:'}
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-950/50 transition active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'দৈনিক সমাপ্তি রিপোর্ট সেভ করুন' : 'Finalize & Save Closing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
