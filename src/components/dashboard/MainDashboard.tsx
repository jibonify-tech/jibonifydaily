import React from 'react';
import {
  Wallet,
  Building,
  Smartphone,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Sun,
  Moon,
  Footprints,
  Home,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  TrendingUp,
  Receipt,
  Eye,
} from 'lucide-react';
import { Account, Category, DailyClosing, DaySession, Language, OutsideSession, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';
import { OutsideActiveCard } from './OutsideActiveCard';

interface MainDashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  daySession?: DaySession;
  activeOutsideSession?: OutsideSession;
  dailyClosings: DailyClosing[];
  onStartDay: () => void;
  onGoOutside: () => void;
  onReturnHome: () => void;
  onCloseDay: () => void;
  onOpenQuickExpense: () => void;
  onOpenQuickIncome: () => void;
  onOpenTransfer: () => void;
  onViewReceipt: (img: string, title: string) => void;
  onViewAllTransactions: () => void;
  language: Language;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  accounts,
  transactions,
  categories,
  daySession,
  activeOutsideSession,
  dailyClosings,
  onStartDay,
  onGoOutside,
  onReturnHome,
  onCloseDay,
  onOpenQuickExpense,
  onOpenQuickIncome,
  onOpenTransfer,
  onViewReceipt,
  onViewAllTransactions,
  language,
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().split('T')[0];

  // Accounts summary
  const pocketAcc = accounts.find((a) => a.isDefaultPocket || a.subType === 'pocket');
  const pocketCash = pocketAcc ? pocketAcc.balance : 0;

  const walletAccounts = accounts.filter((a) => a.type === 'mobile_wallet');
  const totalWallet = walletAccounts.reduce((sum, a) => sum + a.balance, 0);

  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const totalBank = bankAccounts.reduce((sum, a) => sum + a.balance, 0);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Today's transactions
  const todayTxs = transactions.filter((t) => !t.isDeleted && t.date === todayStr);

  const todayIncome = todayTxs
    .filter((t) => t.type === 'income' || t.type === 'repayment_received')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const todayExpense = todayTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = todayIncome - todayExpense;
  const todaySavings = Math.max(0, netCashFlow);

  // Expected pocket cash
  const openingPocket = daySession?.openingCash ?? pocketCash;
  const cashIncomeToday = todayTxs
    .filter((t) => (t.type === 'income' || t.type === 'repayment_received') && t.accountId === (pocketAcc?.id || 'acc_pocket'))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashExpenseToday = todayTxs
    .filter((t) => t.type === 'expense' && t.accountId === (pocketAcc?.id || 'acc_pocket'))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashTransferInToday = todayTxs
    .filter((t) => t.type === 'transfer' && t.toAccountId === (pocketAcc?.id || 'acc_pocket'))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashTransferOutToday = todayTxs
    .filter((t) => t.type === 'transfer' && t.accountId === (pocketAcc?.id || 'acc_pocket'))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expectedPocketCash = openingPocket + cashIncomeToday + cashTransferInToday - cashExpenseToday - cashTransferOutToday;
  const cashDiff = pocketCash - expectedPocketCash;
  const isCashMatched = Math.abs(cashDiff) < 0.01;

  // Category map
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Top Banner: Today's Financial Status & Lifecycle Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {language === 'bn' ? 'আজকের সার্বিক অবস্থা:' : "Today's Status:"}
              </span>
              {daySession?.isClosed ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-950/80 px-2 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/30">
                  <Moon className="w-3.5 h-3.5" />
                  {t.dayClosed}
                </span>
              ) : daySession?.isStarted ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  <Sun className="w-3.5 h-3.5" />
                  {t.dayStarted} ({daySession.startTime})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/80 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  {t.dayNotStarted}
                </span>
              )}

              {activeOutsideSession?.isActive ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-950/80 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  <Footprints className="w-3.5 h-3.5" />
                  {t.outsideActive}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                  <Home className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'বাসায় আছেন' : 'At Home'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
              <span>
                {language === 'bn' ? 'প্রত্যাশিত ক্যাশ:' : 'Expected Cash:'}{' '}
                <strong className="font-num text-white">{formatCurrency(expectedPocketCash, language)}</strong>
              </span>
              <span>•</span>
              <span>
                {language === 'bn' ? 'বাস্তব পকেট ক্যাশ:' : 'Actual Cash:'}{' '}
                <strong className="font-num text-emerald-400">{formatCurrency(pocketCash, language)}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {isCashMatched ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'bn' ? '✅ হিসাব মিলেছে' : '✅ Cash Matched'}
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {language === 'bn'
                      ? `⚠️ ${formatCurrency(Math.abs(cashDiff), language)} ${cashDiff < 0 ? 'ঘাটতি' : 'বাড়তি'}`
                      : `⚠️ ${formatCurrency(Math.abs(cashDiff), language)} difference`}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {!daySession?.isStarted && (
              <button
                onClick={onStartDay}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-md shadow-amber-950/40 transition active:scale-95 whitespace-nowrap"
              >
                <Sun className="w-4 h-4" />
                <span>{t.startDay}</span>
              </button>
            )}

            {!activeOutsideSession?.isActive && !daySession?.isClosed && (
              <button
                onClick={onGoOutside}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-blue-950/40 transition active:scale-95 whitespace-nowrap"
              >
                <Footprints className="w-4 h-4" />
                <span>{t.goOutside}</span>
              </button>
            )}

            {activeOutsideSession?.isActive && (
              <button
                onClick={onReturnHome}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95 whitespace-nowrap"
              >
                <Home className="w-4 h-4" />
                <span>{t.returnHome}</span>
              </button>
            )}

            {daySession?.isStarted && !daySession?.isClosed && !activeOutsideSession?.isActive && (
              <button
                onClick={onCloseDay}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-purple-950/40 transition active:scale-95 whitespace-nowrap"
              >
                <Moon className="w-4 h-4" />
                <span>{t.closeDay}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Outside Mode Live Card (when active outside) */}
      {activeOutsideSession?.isActive && (
        <OutsideActiveCard
          session={activeOutsideSession}
          transactions={transactions}
          onOpenQuickExpense={onOpenQuickExpense}
          onOpenQuickIncome={onOpenQuickIncome}
          onOpenTransfer={onOpenTransfer}
          onReturnHome={onReturnHome}
          language={language}
        />
      )}

      {/* 4 Major Financial Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-slate-900 p-4 shadow-sm hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300/80">{t.totalBalance}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <span className="text-base font-bold font-num">৳</span>
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400 font-num">
            {formatCurrency(totalBalance, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {language === 'bn' ? 'সকল অ্যাকাউন্ট মিলিয়ে মোট স্থিতি' : 'Across all active accounts'}
          </span>
        </div>

        {/* Pocket Cash */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">{t.pocketCash}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-white font-num">
            {formatCurrency(pocketCash, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {language === 'bn' ? 'হাতে বা পকেটে থাকা বাস্তব নগদ ক্যাশ' : 'Physical cash on hand'}
          </span>
        </div>

        {/* Mobile Wallets */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">{t.walletBalance}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-950 text-rose-400 border border-rose-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-white font-num">
            {formatCurrency(totalWallet, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {language === 'bn' ? 'বিকাশ, নগদ ও রকেট ব্যালেন্স' : 'bKash, Nagad & Rocket'}
          </span>
        </div>

        {/* Bank Balance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">{t.bankBalance}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950 text-blue-400 border border-blue-500/20">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-white font-num">
            {formatCurrency(totalBank, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {language === 'bn' ? 'সকল ব্যাংক অ্যাকাউন্টের জমা' : 'All bank accounts combined'}
          </span>
        </div>
      </div>

      {/* Today's Cash Flow Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-400">{t.todayIncome}</span>
          </div>
          <p className="mt-1.5 text-lg sm:text-xl font-bold text-emerald-400 font-num">
            {formatCurrency(todayIncome, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-medium text-slate-400">{t.todayExpense}</span>
          </div>
          <p className="mt-1.5 text-lg sm:text-xl font-bold text-rose-400 font-num">
            {formatCurrency(todayExpense, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-400">{t.todaySavings}</span>
          </div>
          <p className="mt-1.5 text-lg sm:text-xl font-bold text-blue-400 font-num">
            {formatCurrency(todaySavings, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-400">{t.todayNetFlow}</span>
          </div>
          <p className={`mt-1.5 text-lg sm:text-xl font-bold font-num ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(netCashFlow, language)}
          </p>
        </div>
      </div>

      {/* Quick Action Bar on Tablet & Desktop */}
      <div className="hidden md:flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <span className="text-xs font-semibold text-slate-300">
          {language === 'bn' ? 'আজকের দ্রুত এন্ট্রি:' : 'Quick Entry Actions:'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickExpense}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t.quickExpense}</span>
          </button>
          <button
            onClick={onOpenQuickIncome}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{t.quickIncome}</span>
          </button>
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{t.transferMoney}</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {t.recentTransactions}
            </h3>
          </div>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            {t.viewAll} →
          </button>
        </div>

        {todayTxs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <Receipt className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p>{t.noTransactionsToday}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={onOpenQuickExpense}
                className="text-xs font-semibold text-rose-400 hover:underline"
              >
                + {language === 'bn' ? 'খরচ যোগ করুন' : 'Add Expense'}
              </button>
              <span>•</span>
              <button
                onClick={onOpenQuickIncome}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                + {language === 'bn' ? 'আয় যোগ করুন' : 'Add Income'}
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {todayTxs.slice(0, 6).map((tx) => {
              const cat = catMap[tx.categoryId || ''];
              const acc = accMap[tx.accountId];
              const isExp = tx.type === 'expense';
              const isInc = tx.type === 'income' || tx.type === 'repayment_received';
              const isTfr = tx.type === 'transfer';

              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                        isExp
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
                          : isInc
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-950/60 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {isExp ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : isInc ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{tx.description}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                        <span>{tx.time}</span>
                        <span>•</span>
                        <span>{acc?.name.split(' ')[0] || 'Cash'}</span>
                        {cat && (
                          <>
                            <span>•</span>
                            <span className="truncate">{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-right">
                    {tx.receiptImage && (
                      <button
                        onClick={() => onViewReceipt(tx.receiptImage!, tx.description)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        title={t.receipt}
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    )}
                    <span
                      className={`font-black font-num text-sm ${
                        isExp ? 'text-rose-400' : isInc ? 'text-emerald-400' : 'text-blue-400'
                      }`}
                    >
                      {isExp ? '-' : isInc ? '+' : ''}
                      {formatCurrency(tx.amount, language)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
