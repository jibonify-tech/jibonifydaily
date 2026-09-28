import React from 'react';
import {
  Compass,
  Wallet,
  Smartphone,
  Building,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  ShieldAlert,
  TrendingUp,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Account, DebtRecord, Language, Person, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface MoneyMapViewProps {
  accounts: Account[];
  transactions: Transaction[];
  debts: DebtRecord[];
  people: Person[];
  onSelectAccount: (accountId: string) => void;
  onOpenPeople: () => void;
  language: Language;
}

export const MoneyMapView: React.FC<MoneyMapViewProps> = ({
  accounts,
  transactions,
  debts,
  people,
  onSelectAccount,
  onOpenPeople,
  language,
}) => {
  const t = translations[language];

  // People map
  const peopleMap = Object.fromEntries(people.map((p) => [p.id, p]));

  // 1. Physical Cash Breakdown
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const totalCash = cashAccounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);

  // 2. Mobile Wallets Breakdown
  const walletAccounts = accounts.filter((a) => a.type === 'mobile_wallet');
  const totalWallet = walletAccounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);

  // 3. Bank Accounts Breakdown
  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const totalBank = bankAccounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);

  // 4. Cards
  const cardAccounts = accounts.filter((a) => a.type === 'card');
  const positiveCardBalances = cardAccounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);
  const creditCardDues = cardAccounts.reduce((sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);

  // 5. Receivables (Money Others Owe Me)
  const activeLentDebts = debts.filter((d) => d.type === 'lend' && !d.isFullyPaid);
  const totalReceivables = activeLentDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

  // 6. Payables (Money I Owe Others)
  const activeBorrowedDebts = debts.filter((d) => d.type === 'borrow' && !d.isFullyPaid);
  const totalPayables = activeBorrowedDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

  // Totals
  const totalAssets = totalCash + totalWallet + totalBank + positiveCardBalances + totalReceivables;
  const totalLiabilities = totalPayables + creditCardDues;
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>{t.whereIsMyMoney}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'আপনার প্রতিটি পয়সা ঠিক কোথায় আছে এবং আপনার প্রকৃত আর্থিক অবস্থা'
              : 'Complete breakdown of all your assets, locations, and net worth'}
          </p>
        </div>
      </div>

      {/* Net Worth Hero Card */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-300">
                {t.netWorth}
              </span>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                {language === 'bn' ? 'মোট সম্পদ - দায়' : 'Assets - Liabilities'}
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-num mt-1">
              {formatCurrency(netWorth, language)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'bn'
                ? `সকল নগদ, ব্যাংক, ওয়ালেট ও পাওনা টাকা মিলিয়ে দেনা বাদ দেওয়ার পর প্রকৃত স্থিতি`
                : `Total assets minus all debts and dues`}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
            <div>
              <span className="text-slate-400 block text-[11px]">{t.totalAssets}</span>
              <strong className="text-white font-num text-sm sm:text-base">
                {formatCurrency(totalAssets, language)}
              </strong>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-rose-400 block text-[11px]">{t.liabilities}</span>
              <strong className="text-rose-400 font-num text-sm sm:text-base">
                {formatCurrency(totalLiabilities, language)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Physical Cash Locations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {language === 'bn' ? 'নগদ ক্যাশ কোথায় আছে?' : 'Physical Cash Locations'}
            </h3>
          </div>
          <span className="text-xs font-black text-emerald-400 font-num">
            {formatCurrency(totalCash, language)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {cashAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition group text-left"
            >
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition">
                  {acc.name}
                </p>
                <span className="text-[10px] text-slate-400">
                  {acc.subType === 'pocket'
                    ? language === 'bn' ? 'পকেট / সাথে আছে' : 'In Pocket'
                    : acc.subType === 'home'
                    ? language === 'bn' ? 'বাসার ড্রয়ার / সেফ' : 'At Home'
                    : language === 'bn' ? 'ব্যাগ / অন্যান্য' : 'In Bag'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white font-num">
                  {formatCurrency(acc.balance, language)}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Mobile Wallets */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-950 text-rose-400 border border-rose-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {language === 'bn' ? 'মোবাইল ওয়ালেটে কত আছে?' : 'Mobile Wallets'}
            </h3>
          </div>
          <span className="text-xs font-black text-rose-400 font-num">
            {formatCurrency(totalWallet, language)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {walletAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 transition group text-left"
            >
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-rose-400 transition">
                  {acc.name}
                </p>
                <span className="text-[10px] text-slate-400 font-num">
                  {acc.accountNumber || acc.institutionName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white font-num">
                  {formatCurrency(acc.balance, language)}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Bank & Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-950 text-blue-400 border border-blue-500/30">
              <Building className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {language === 'bn' ? 'ব্যাংক ও কার্ড ব্যালেন্স' : 'Banks & Cards'}
            </h3>
          </div>
          <span className="text-xs font-black text-blue-400 font-num">
            {formatCurrency(totalBank + positiveCardBalances, language)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[...bankAccounts, ...cardAccounts].map((acc) => {
            const isNegative = acc.balance < 0;
            return (
              <button
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition group text-left"
              >
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition">
                    {acc.name}
                  </p>
                  <span className="text-[10px] text-slate-400 font-num">
                    {acc.accountNumber || acc.institutionName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold font-num ${
                      isNegative ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {formatCurrency(acc.balance, language)}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4: Money Others Owe Me (Receivables) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-950 text-purple-400 border border-purple-500/30">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t.iWillReceive}
            </h3>
          </div>
          <button
            onClick={onOpenPeople}
            className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>{formatCurrency(totalReceivables, language)}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeLentDebts.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            {language === 'bn' ? 'কারো কাছে কোনো পাওনা নেই।' : 'No outstanding receivables.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeLentDebts.map((d) => {
              const person = peopleMap[d.personId];
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{person?.name || 'Contact'}</p>
                    <p className="text-[11px] text-slate-400">{d.reason || t.lending}</p>
                  </div>
                  <span className="font-bold text-emerald-400 font-num">
                    +{formatCurrency(d.remainingAmount, language)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 5: Money I Owe Others (Payables / Liabilities) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-950 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t.iHaveToPay}
            </h3>
          </div>
          <button
            onClick={onOpenPeople}
            className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1"
          >
            <span>{formatCurrency(totalLiabilities, language)}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeBorrowedDebts.length === 0 && creditCardDues === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            {language === 'bn' ? 'কোনো দেনা বা বাকি ঋণ নেই।' : 'No liabilities or unpaid debts.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {creditCardDues > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <p className="font-semibold text-rose-300">
                    {language === 'bn' ? 'ক্রেডিট কার্ডের বকেয়া' : 'Credit Card Due'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'bn' ? 'কার্ডে ব্যবহৃত ব্যালেন্স' : 'Used limit'}
                  </p>
                </div>
                <span className="font-bold text-rose-400 font-num">
                  -{formatCurrency(creditCardDues, language)}
                </span>
              </div>
            )}
            {activeBorrowedDebts.map((d) => {
              const person = peopleMap[d.personId];
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{person?.name || 'Contact'}</p>
                    <p className="text-[11px] text-slate-400">{d.reason || t.borrowing}</p>
                  </div>
                  <span className="font-bold text-rose-400 font-num">
                    -{formatCurrency(d.remainingAmount, language)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
