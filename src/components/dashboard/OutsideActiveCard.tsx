import React from 'react';
import {
  Footprints,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Home,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Car,
  MapPin,
} from 'lucide-react';
import { Language, OutsideSession, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface OutsideActiveCardProps {
  session: OutsideSession;
  transactions: Transaction[];
  onOpenQuickExpense: () => void;
  onOpenQuickIncome: () => void;
  onOpenTransfer: () => void;
  onReturnHome: () => void;
  language: Language;
}

export const OutsideActiveCard: React.FC<OutsideActiveCardProps> = ({
  session,
  transactions,
  onOpenQuickExpense,
  onOpenQuickIncome,
  onOpenTransfer,
  onReturnHome,
  language,
}) => {
  const t = translations[language];

  // Calculate outside transactions
  const outsideTxs = transactions.filter(
    (t) => !t.isDeleted && (t.outsideSessionId === session.id || t.date === session.date)
  );

  const outsideExpenses = outsideTxs
    .filter((t) => t.type === 'expense' && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideIncome = outsideTxs
    .filter((t) => (t.type === 'income' || t.type === 'repayment_received') && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideCashTransfersIn = outsideTxs
    .filter((t) => t.type === 'transfer' && t.toAccountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideCashTransfersOut = outsideTxs
    .filter((t) => t.type === 'transfer' && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideCashLent = outsideTxs
    .filter((t) => t.type === 'lend' && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalTaken = Number(session.cashTaken || 0) + Number(session.additionalCashTaken || 0);
  const expectedCash =
    totalTaken + outsideIncome + outsideCashTransfersIn - outsideExpenses - outsideCashTransfersOut - outsideCashLent;

  return (
    <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900/90 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-900/50">
            <Footprints className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {language === 'bn' ? 'বাইরে অবস্থান করছেন (Outside Mode)' : 'Outside Journey in Progress'}
              </h3>
              <span className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/30">
                {language === 'bn' ? 'চলমান' : 'LIVE'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{session.startTime}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{session.destination}</span>
              </span>
              {session.transportType && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Car className="w-3.5 h-3.5" />
                    <span>{session.transportType}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Major Return Home Action */}
        <button
          onClick={onReturnHome}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 active:scale-95 transition whitespace-nowrap"
        >
          <Home className="w-4 h-4" />
          <span>{language === 'bn' ? 'বাসায় ফিরেছি (হিসাব মেলান)' : 'Return Home (Reconcile)'}</span>
        </button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-2.5 sm:p-3">
          <span className="text-[11px] font-medium text-slate-400">
            {language === 'bn' ? 'টাকা নিয়ে বের হয়েছিলেন' : 'Cash Carried'}
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-100 font-num">
            {formatCurrency(totalTaken, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-2.5 sm:p-3">
          <span className="text-[11px] font-medium text-rose-300">
            {language === 'bn' ? 'বাইরে মোট খরচ' : 'Spent Outside'}
          </span>
          <p className="text-base sm:text-lg font-bold text-rose-400 font-num">
            {formatCurrency(outsideExpenses, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-2.5 sm:p-3">
          <span className="text-[11px] font-medium text-emerald-300">
            {language === 'bn' ? 'বাইরে ক্যাশ প্রাপ্তি' : 'Cash Received'}
          </span>
          <p className="text-base sm:text-lg font-bold text-emerald-400 font-num">
            {formatCurrency(outsideIncome, language)}
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 p-2.5 sm:p-3">
          <span className="text-[11px] font-medium text-emerald-300">
            {language === 'bn' ? 'এখন পকেটে থাকা উচিত' : 'Expected Pocket Cash'}
          </span>
          <p className="text-base sm:text-lg font-extrabold text-emerald-400 font-num">
            {formatCurrency(expectedCash, language)}
          </p>
        </div>
      </div>

      {/* Quick Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
        <button
          onClick={onOpenQuickExpense}
          className="flex items-center gap-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '+ খরচ লিখুন' : '+ Log Expense'}</span>
        </button>
        <button
          onClick={onOpenQuickIncome}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '+ ক্যাশ প্রাপ্তি' : '+ Cash Received'}</span>
        </button>
        <button
          onClick={onOpenTransfer}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition active:scale-95 border border-slate-700"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'bn' ? 'টাকা স্থানান্তর' : 'Transfer'}</span>
        </button>
      </div>
    </div>
  );
};
