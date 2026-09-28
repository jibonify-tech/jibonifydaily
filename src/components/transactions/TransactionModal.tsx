import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Upload,
  Calendar,
  Clock,
  Wallet,
  Tag,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Account, Category, Language, OutsideSession, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface TransactionModalProps {
  initialType?: 'expense' | 'income';
  accounts: Account[];
  categories: Category[];
  activeOutsideSession?: OutsideSession;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  language: Language;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  initialType = 'expense',
  accounts,
  categories,
  activeOutsideSession,
  onSave,
  onClose,
  language,
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(currentTime);
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);

  // Default accounts: Pocket cash if outside, otherwise first cash or wallet
  const defaultAccountId = activeOutsideSession
    ? accounts.find((a) => a.isDefaultPocket || a.subType === 'pocket')?.id || accounts[0]?.id
    : accounts[0]?.id;

  const [accountId, setAccountId] = useState(defaultAccountId || '');

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);
  const [categoryId, setCategoryId] = useState(availableCategories[0]?.id || '');

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    onSave({
      type,
      amount: num,
      accountId,
      categoryId,
      outsideSessionId: activeOutsideSession?.isActive ? activeOutsideSession.id : undefined,
      date,
      time,
      description: description || (type === 'expense' ? 'দৈনন্দিন খরচ' : 'আয়'),
      note,
      receiptImage,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          {/* Segmented type switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const cats = categories.filter((c) => c.type === 'expense');
                if (cats.length) setCategoryId(cats[0].id);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'bn' ? 'খরচ' : 'Expense'}</span>
              <span className="hidden sm:inline text-[10px] opacity-75">{language === 'bn' ? '(Expense)' : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const cats = categories.filter((c) => c.type === 'income');
                if (cats.length) setCategoryId(cats[0].id);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'bn' ? 'আয়' : 'Income'}</span>
              <span className="hidden sm:inline text-[10px] opacity-75">{language === 'bn' ? '(Income)' : ''}</span>
            </button>
          </div>

          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.amount} (BDT)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-lg font-num">৳</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-9 pr-4 py-2.5 text-2xl font-black font-num text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => handleQuickAmount(q)}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition font-num"
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.description}
            </label>
            <input
              type="text"
              placeholder={
                type === 'expense'
                  ? language === 'bn'
                    ? 'যেমন: রিকশা ভাড়া, দুপুরের লাঞ্চ, ডিম ও দুধ কেনা'
                    : 'e.g. Rickshaw fare, office lunch, groceries'
                  : language === 'bn'
                    ? 'যেমন: বেতন, ক্লায়েন্ট পেমেন্ট, বোনাস'
                    : 'e.g. Salary, client invoice, gift'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.category}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {availableCategories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition ${
                    categoryId === c.id
                      ? 'bg-emerald-950 border border-emerald-500/50 text-white font-semibold shadow-xs'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[11px] truncate w-full">
                    {language === 'bn' ? c.nameBn : c.nameEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.account}</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ({formatCurrency(acc.balance, language)})
                </option>
              ))}
            </select>
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
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
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
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Receipt Attachment Photo */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.receipt} (ছবি বা ভাউচার)</span>
            </label>
            {receiptImage ? (
              <div className="relative inline-block rounded-xl border border-slate-700 overflow-hidden group">
                <img
                  src={receiptImage}
                  alt="Receipt Preview"
                  className="h-20 w-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-rose-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 px-3 py-2.5 text-xs text-slate-400 hover:text-white hover:border-slate-500 cursor-pointer transition">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{t.uploadReceipt}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.notes}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'অতিরিক্ত কোনো মন্তব্য' : 'Extra note'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
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
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
