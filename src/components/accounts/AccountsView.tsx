import React, { useState } from 'react';
import {
  Wallet,
  Smartphone,
  Building,
  CreditCard,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  X,
  Check,
} from 'lucide-react';
import { Account, AccountType, Language, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount: (acc: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onOpenTransfer: () => void;
  onSelectAccount: (accId: string) => void;
  language: Language;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  onAddAccount,
  onOpenTransfer,
  onSelectAccount,
  language,
}) => {
  const t = translations[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const initBal = parseFloat(initialBalance) || 0;

    onAddAccount({
      name: name.trim(),
      type,
      initialBalance: initBal,
      balance: initBal,
      accountNumber: accountNumber.trim() || undefined,
      institutionName: institutionName.trim() || undefined,
      color: type === 'cash' ? '#10b981' : type === 'mobile_wallet' ? '#f43f5e' : '#3b82f6',
    });

    setName('');
    setInitialBalance('');
    setAccountNumber('');
    setInstitutionName('');
    setShowAddModal(false);
  };

  // Group accounts
  const cashList = accounts.filter((a) => a.type === 'cash');
  const walletList = accounts.filter((a) => a.type === 'mobile_wallet');
  const bankList = accounts.filter((a) => a.type === 'bank' || a.type === 'card');

  const getAccountStats = (accId: string) => {
    const accTxs = transactions.filter((t) => !t.isDeleted && (t.accountId === accId || t.toAccountId === accId));
    const income = accTxs
      .filter((t) => (t.type === 'income' || t.type === 'repayment_received') && t.accountId === accId)
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = accTxs
      .filter((t) => t.type === 'expense' && t.accountId === accId)
      .reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense };
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>{t.accounts}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'সকল নগদ ক্যাশ, মোবাইল ওয়ালেট ও ব্যাংক অ্যাকাউন্টের সম্পূর্ণ তালিকা' : 'Manage your cash, mobile wallets and bank accounts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{t.transferMoney}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন অ্যাকাউন্ট' : '+ Add Account'}</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 p-5 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs font-semibold text-emerald-300/90">{t.totalBalance}</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-num mt-1">
            {formatCurrency(totalBalance, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {accounts.length} {language === 'bn' ? 'টি সক্রিয় অ্যাকাউন্ট' : 'Active accounts'}
          </span>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* 1. Cash Accounts */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'bn' ? 'নগদ ক্যাশ অ্যাকাউন্টস' : 'Cash Accounts'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cashList.map((acc) => {
            const stats = getAccountStats(acc.id);
            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-emerald-500/40 transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">{acc.name}</p>
                      {acc.isDefaultPocket && (
                        <span className="text-[10px] text-emerald-400 font-medium">★ {language === 'bn' ? 'প্রধান পকেট ক্যাশ' : 'Default Pocket'}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-black text-emerald-400 font-num">
                    {formatCurrency(acc.balance, language)}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-num">
                  <span>+{formatCurrency(stats.income, language)}</span>
                  <span>-{formatCurrency(stats.expense, language)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Mobile Wallets */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-rose-400" />
          <span>{language === 'bn' ? 'মোবাইল ওয়ালেট (বিকাশ, নগদ, রকেট)' : 'Mobile Wallets'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {walletList.map((acc) => {
            const stats = getAccountStats(acc.id);
            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-rose-500/40 transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-rose-400 transition">{acc.name}</p>
                      {acc.accountNumber && <span className="text-[10px] text-slate-400 font-num">{acc.accountNumber}</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-black text-rose-400 font-num">
                    {formatCurrency(acc.balance, language)}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-num">
                  <span>+{formatCurrency(stats.income, language)}</span>
                  <span>-{formatCurrency(stats.expense, language)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bank Accounts & Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'bn' ? 'ব্যাংক অ্যাকাউন্ট ও কার্ড' : 'Bank Accounts & Cards'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bankList.map((acc) => {
            const stats = getAccountStats(acc.id);
            const isCard = acc.type === 'card';
            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-blue-500/40 transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-500/30">
                      {isCard ? <CreditCard className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-blue-400 transition">{acc.name}</p>
                      {acc.accountNumber && <span className="text-[10px] text-slate-400 font-num">{acc.accountNumber}</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className={`text-xl font-black font-num ${acc.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                    {formatCurrency(acc.balance, language)}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-num">
                  <span>+{formatCurrency(stats.income, language)}</span>
                  <span>-{formatCurrency(stats.expense, language)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'নতুন অ্যাকাউন্ট যোগ করুন' : 'Add New Account'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'অ্যাকাউন্টের নাম' : 'Account Name'}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: সিটি ব্যাংক সেভিংস, পার্সোনাল ড্রয়ার' : 'e.g. City Bank Savings'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'অ্যাকাউন্টের ধরন' : 'Account Type'}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="cash">{language === 'bn' ? 'নগদ ক্যাশ (Cash)' : 'Cash'}</option>
                  <option value="mobile_wallet">{language === 'bn' ? 'মোবাইল ওয়ালেট (bKash/Nagad)' : 'Mobile Wallet'}</option>
                  <option value="bank">{language === 'bn' ? 'ব্যাংক অ্যাকাউন্ট (Bank)' : 'Bank Account'}</option>
                  <option value="card">{language === 'bn' ? 'ক্রেডিট / ডেবিট কার্ড (Card)' : 'Card'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'বর্তমান শুরুর ব্যালেন্স (BDT)' : 'Starting Balance (BDT)'}</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs font-num text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'অ্যাকাউন্ট বা মোবাইল নম্বর (ঐচ্ছিক)' : 'Account/Mobile Number (Optional)'}</label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX / 150XXXXXXXX"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs font-num text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'প্রতিষ্ঠানের নাম (ঐচ্ছিক)' : 'Institution Name (Optional)'}</label>
                <input
                  type="text"
                  placeholder="bKash / BRAC Bank / Sonali Bank"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
