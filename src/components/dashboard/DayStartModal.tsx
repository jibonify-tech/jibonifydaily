import React, { useState } from 'react';
import { Sun, CheckCircle, X, Wallet, Building, Smartphone, Calendar, Clock } from 'lucide-react';
import { Account, DaySession, Language } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface DayStartModalProps {
  accounts: Account[];
  onConfirm: (session: Omit<DaySession, 'id'>) => void;
  onClose: () => void;
  language: Language;
}

export const DayStartModal: React.FC<DayStartModalProps> = ({
  accounts,
  onConfirm,
  onClose,
  language,
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState(currentTime);
  const [notes, setNotes] = useState('');

  // Editable account balances if user counts their cash this morning
  const [balances, setBalances] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    accounts.forEach((acc) => {
      map[acc.id] = acc.balance;
    });
    return map;
  });

  const handleBalanceChange = (accId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setBalances((prev) => ({ ...prev, [accId]: num }));
  };

  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const walletAccounts = accounts.filter((a) => a.type === 'mobile_wallet');
  const bankAccounts = accounts.filter((a) => a.type === 'bank' || a.type === 'card');

  const totalCash = cashAccounts.reduce((sum, a) => sum + (balances[a.id] ?? a.balance), 0);
  const totalWallet = walletAccounts.reduce((sum, a) => sum + (balances[a.id] ?? a.balance), 0);
  const totalBank = bankAccounts.reduce((sum, a) => sum + (balances[a.id] ?? a.balance), 0);
  const grandTotal = totalCash + totalWallet + totalBank;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const snapshots = accounts.map((acc) => ({
      accountId: acc.id,
      accountName: acc.name,
      balance: balances[acc.id] ?? acc.balance,
    }));

    onConfirm({
      date,
      startTime,
      isStarted: true,
      isClosed: false,
      openingCash: totalCash,
      openingBank: totalBank,
      openingWallet: totalWallet,
      openingTotal: grandTotal,
      accountSnapshots: snapshots,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'bn' ? 'আজকের হিসাব শুরু করুন' : "Start Today's Hisab"}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'সকালের শুরুর ব্যালেন্স যাচাই ও নিশ্চিতকরণ' : 'Confirm your morning opening balances'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.date}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.time}</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Account Opening Balances verification */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300">
              {language === 'bn' ? 'অ্যাকাউন্ট ব্যালেন্স যাচাই করুন:' : 'Verify Morning Opening Balances:'}
            </span>

            {/* Cash Section */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নগদ ক্যাশ (পকেট ও ড্রয়ার)' : 'Cash in Hand & Home'}</span>
                </div>
                <span className="font-num">{formatCurrency(totalCash, language)}</span>
              </div>
              {cashAccounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between text-xs gap-3">
                  <span className="text-slate-300 truncate">{acc.name}</span>
                  <div className="flex items-center gap-1 w-32 shrink-0">
                    <span className="text-slate-400 text-xs font-num">৳</span>
                    <input
                      type="number"
                      step="any"
                      value={balances[acc.id] ?? acc.balance}
                      onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-right font-num text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Wallet Section */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মোবাইল ওয়ালেট (বিকাশ, নগদ ইত্যাদি)' : 'Mobile Wallets'}</span>
                </div>
                <span className="font-num">{formatCurrency(totalWallet, language)}</span>
              </div>
              {walletAccounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between text-xs gap-3">
                  <span className="text-slate-300 truncate">{acc.name}</span>
                  <div className="flex items-center gap-1 w-32 shrink-0">
                    <span className="text-slate-400 text-xs font-num">৳</span>
                    <input
                      type="number"
                      step="any"
                      value={balances[acc.id] ?? acc.balance}
                      onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-right font-num text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bank & Cards */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ব্যাংক ও কার্ড ব্যালেন্স' : 'Bank & Cards'}</span>
                </div>
                <span className="font-num">{formatCurrency(totalBank, language)}</span>
              </div>
              {bankAccounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between text-xs gap-3">
                  <span className="text-slate-300 truncate">{acc.name}</span>
                  <div className="flex items-center gap-1 w-32 shrink-0">
                    <span className="text-slate-400 text-xs font-num">৳</span>
                    <input
                      type="number"
                      step="any"
                      value={balances[acc.id] ?? acc.balance}
                      onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-right font-num text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Opening Total Card */}
          <div className="rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-800/80 border border-emerald-500/40 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300/80">
                {language === 'bn' ? 'আজকের সর্বমোট শুরুর ব্যালেন্স' : 'Total Opening Balance'}
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-num">
                {formatCurrency(grandTotal, language)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400/60 shrink-0" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'সকালের কোনো বিশেষ মন্তব্য (ঐচ্ছিক)' : 'Morning Note (Optional)'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: আজ অফিসে প্রেজেন্টেশন ও ক্লায়েন্ট লাঞ্চ আছে' : 'e.g. Office meeting today'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-950/50 hover:bg-emerald-500 transition active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.confirmDayStart}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
