import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Download,
  Trash2,
  Eye,
  Plus,
  Calendar,
  X,
} from 'lucide-react';
import { Account, Category, Language, Transaction, TransactionType } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  selectedAccountId?: string;
  onClearAccountFilter?: () => void;
  onOpenQuickExpense: () => void;
  onOpenQuickIncome: () => void;
  onOpenTransfer: () => void;
  onDeleteTransaction: (id: string) => void;
  onViewReceipt: (img: string, title: string) => void;
  onExportCSV: () => void;
  language: Language;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  categories,
  selectedAccountId,
  onClearAccountFilter,
  onOpenQuickExpense,
  onOpenQuickIncome,
  onOpenTransfer,
  onDeleteTransaction,
  onViewReceipt,
  onExportCSV,
  language,
}) => {
  const t = translations[language];

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>(selectedAccountId || 'all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.isDeleted) return false;

      if (filterType !== 'all') {
        if (filterType === 'expense' && tx.type !== 'expense') return false;
        if (filterType === 'income' && tx.type !== 'income' && tx.type !== 'repayment_received') return false;
        if (filterType === 'transfer' && tx.type !== 'transfer') return false;
        if (filterType === 'lend' && tx.type !== 'lend') return false;
        if (filterType === 'borrow' && tx.type !== 'borrow') return false;
      }

      if (filterAccount !== 'all') {
        if (tx.accountId !== filterAccount && tx.toAccountId !== filterAccount) return false;
      }

      if (filterCategory !== 'all') {
        if (tx.categoryId !== filterCategory) return false;
      }

      if (filterDate) {
        if (tx.date !== filterDate) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const noteMatch = (tx.note || '').toLowerCase().includes(q);
        const cat = catMap[tx.categoryId || ''];
        const catMatch = cat && (cat.nameBn.toLowerCase().includes(q) || cat.nameEn.toLowerCase().includes(q));
        const acc = accMap[tx.accountId];
        const accMatch = acc && acc.name.toLowerCase().includes(q);
        if (!descMatch && !noteMatch && !catMatch && !accMatch) return false;
      }

      return true;
    });
  }, [transactions, filterType, filterAccount, filterCategory, filterDate, search, catMap, accMap]);

  return (
    <div className="space-y-4 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>{t.transactions}</span>
            <span className="text-xs font-normal text-slate-400 font-num">
              ({filteredTransactions.length} {language === 'bn' ? 'টি লেনদেন' : 'records'})
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'সকল আয়, ব্যয়, স্থানান্তর ও দেনা-পাওনার হিসাব তালিকা' : 'Complete financial transaction ledger'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
          </button>
          <button
            onClick={onOpenQuickExpense}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t.quickExpense}</span>
          </button>
          <button
            onClick={onOpenQuickIncome}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t.quickIncome}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-10 pr-4 py-2 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl bg-slate-800/80 border border-slate-700 px-2.5 py-1.5 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="all">{language === 'bn' ? 'সকল লেনদেনের ধরন' : 'All Types'}</option>
            <option value="expense">{t.expense}</option>
            <option value="income">{t.income}</option>
            <option value="transfer">{t.transfer}</option>
            <option value="lend">{t.lending}</option>
            <option value="borrow">{t.borrowing}</option>
          </select>

          {/* Account Filter */}
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="rounded-xl bg-slate-800/80 border border-slate-700 px-2.5 py-1.5 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="all">{language === 'bn' ? 'সকল অ্যাকাউন্ট' : 'All Accounts'}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl bg-slate-800/80 border border-slate-700 px-2.5 py-1.5 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'bn' ? c.nameBn : c.nameEn}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-xl bg-slate-800/80 border border-slate-700 px-2.5 py-1.5 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Clear active filter badge */}
        {(filterType !== 'all' || filterAccount !== 'all' || filterCategory !== 'all' || filterDate || search) && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400">
              {language === 'bn' ? 'ফিল্টার কার্যকর আছে' : 'Active filters applied'}
            </span>
            <button
              onClick={() => {
                setFilterType('all');
                setFilterAccount('all');
                setFilterCategory('all');
                setFilterDate('');
                setSearch('');
                if (onClearAccountFilter) onClearAccountFilter();
              }}
              className="text-rose-400 hover:underline"
            >
              {language === 'bn' ? 'সকল ফিল্টার মুছুন' : 'Clear All Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Transaction Records */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-slate-400 text-xs">
          <p className="text-base font-semibold text-slate-300 mb-1">
            {language === 'bn' ? 'কোনো লেনদেন খুঁজে পাওয়া যায়নি' : 'No transactions found'}
          </p>
          <p className="text-slate-500">
            {language === 'bn' ? 'অনুসন্ধান বা ফিল্টারের শর্ত পরিবর্তন করে চেষ্টা করুন।' : 'Try adjusting your search query or filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg divide-y divide-slate-800/80">
          {filteredTransactions.map((tx) => {
            const cat = catMap[tx.categoryId || ''];
            const acc = accMap[tx.accountId];
            const toAcc = tx.toAccountId ? accMap[tx.toAccountId] : undefined;
            const isExp = tx.type === 'expense';
            const isInc = tx.type === 'income' || tx.type === 'repayment_received';
            const isTfr = tx.type === 'transfer';
            const isLend = tx.type === 'lend';
            const isBorrow = tx.type === 'borrow';

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                      isExp
                        ? 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                        : isInc
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                        : isTfr
                        ? 'bg-blue-950/70 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-950/70 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {isExp ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : isInc ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : isTfr ? (
                      <ArrowLeftRight className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">🤝</span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold text-white text-xs sm:text-sm truncate">
                      {tx.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                      <span className="font-num">{tx.date}</span>
                      <span>{tx.time}</span>
                      <span>•</span>
                      {isTfr ? (
                        <span>
                          {acc?.name.split(' ')[0]} → {toAcc?.name.split(' ')[0]}
                        </span>
                      ) : (
                        <span>{acc?.name.split(' ')[0] || 'Cash'}</span>
                      )}
                      {cat && (
                        <>
                          <span>•</span>
                          <span className="text-slate-300">
                            {language === 'bn' ? cat.nameBn : cat.nameEn}
                          </span>
                        </>
                      )}
                    </div>
                    {tx.note && (
                      <p className="text-[11px] text-slate-400 italic truncate max-w-sm">
                        "{tx.note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  {tx.receiptImage && (
                    <button
                      onClick={() => onViewReceipt(tx.receiptImage!, tx.description)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                      title={t.receipt}
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}

                  <div className="flex flex-col items-end">
                    <span
                      className={`font-black font-num text-sm sm:text-base ${
                        isExp
                          ? 'text-rose-400'
                          : isInc
                          ? 'text-emerald-400'
                          : isTfr
                          ? 'text-blue-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {isExp ? '-' : isInc ? '+' : ''}
                      {formatCurrency(tx.amount, language)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {tx.type}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(language === 'bn' ? 'আপনি কি লেনদেনটি মুছে ফেলতে চান?' : 'Delete this transaction?')) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition shrink-0"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
