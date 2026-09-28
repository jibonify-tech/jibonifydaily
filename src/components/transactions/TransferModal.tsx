import React, { useState } from 'react';
import { ArrowLeftRight, X, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { Account, Language, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface TransferModalProps {
  accounts: Account[];
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  language: Language;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  accounts,
  onSave,
  onClose,
  language,
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(currentTime);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      setError(language === 'bn' ? 'উৎস ও গন্তব্য একই অ্যাকাউন্ট হতে পারবে না!' : 'Source and destination accounts must be different!');
      return;
    }

    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);

    onSave({
      type: 'transfer',
      amount: num,
      accountId: fromAccountId,
      toAccountId,
      date,
      time,
      description:
        description ||
        `${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'} স্থানান্তর`,
      note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.transferMoney}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'এক অ্যাকাউন্ট থেকে অন্য অ্যাকাউন্টে টাকা স্থানান্তর' : 'Move money between your accounts'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-500/40 p-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'স্থানান্তরের পরিমাণ (BDT)' : 'Transfer Amount (BDT)'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-lg font-num">৳</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                autoFocus
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-9 pr-4 py-2.5 text-2xl font-black font-num text-blue-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* From Account */}
          <div>
            <label className="block text-xs font-semibold text-rose-300 mb-1">
              {t.fromAccount}
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => {
                setFromAccountId(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-rose-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ({formatCurrency(acc.balance, language)})
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">
              {t.toAccount}
            </label>
            <select
              value={toAccountId}
              onChange={(e) => {
                setToAccountId(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ({formatCurrency(acc.balance, language)})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.description}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: বিকাশ ক্যাশ-আউট করে পকেটে টাকা নিলাম' : 'e.g. ATM withdrawal to pocket'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.date}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.time}</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notice: Transfers are neutral */}
          <div className="rounded-xl bg-slate-800/40 border border-slate-800 p-2.5 text-[11px] text-slate-400">
            ℹ️ {language === 'bn' ? 'স্মরণ রাখুন: টাকা স্থানান্তর কখনো আয় বা ব্যয় হিসেবে গণনা করা হয় না।' : 'Note: Transfers do not count as income or expense.'}
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
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-950/50 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'bn' ? 'স্থানান্তর সম্পন্ন করুন' : 'Confirm Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
