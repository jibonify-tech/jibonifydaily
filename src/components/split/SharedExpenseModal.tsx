import React, { useState } from 'react';
import { Users, X, Check, Plus, Trash2, Split, Calculator } from 'lucide-react';
import { Account, Category, Language, Person, SharedExpense, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface SharedExpenseModalProps {
  accounts: Account[];
  categories: Category[];
  people: Person[];
  onSave: (
    sharedExpense: Omit<SharedExpense, 'id' | 'createdAt'>,
    createDebtRecords: boolean
  ) => void;
  onClose: () => void;
  language: Language;
}

interface SplitItem {
  personId: string;
  personName: string;
  amount: number;
}

export const SharedExpenseModal: React.FC<SharedExpenseModalProps> = ({
  accounts,
  categories,
  people,
  onSave,
  onClose,
  language,
}) => {
  const t = translations[language];

  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidByAccountId, setPaidByAccountId] = useState(accounts[0]?.id || '');
  const [myShare, setMyShare] = useState('');
  const [createDebts, setCreateDebts] = useState(true);

  // Dynamic participants list
  const [splits, setSplits] = useState<SplitItem[]>([
    {
      personId: people[0]?.id || 'custom_1',
      personName: people[0]?.name || (language === 'bn' ? 'বন্ধু ১' : 'Friend 1'),
      amount: 0,
    },
  ]);

  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    const total = parseFloat(val) || 0;
    // Auto calculate equal shares if splits count is > 0
    const participantCount = splits.length + 1; // including me
    const equalShare = Math.round(total / participantCount);
    setMyShare(equalShare.toString());
    setSplits((prev) =>
      prev.map((s) => ({
        ...s,
        amount: equalShare,
      }))
    );
  };

  const handleAddPerson = () => {
    const unpicked = people.find((p) => !splits.some((s) => s.personId === p.id));
    const newPersonName = unpicked
      ? unpicked.name
      : language === 'bn'
      ? `বন্ধু ${splits.length + 2}`
      : `Friend ${splits.length + 2}`;

    const newSplits = [
      ...splits,
      {
        personId: unpicked?.id || `custom_${Date.now()}`,
        personName: newPersonName,
        amount: 0,
      },
    ];

    const total = parseFloat(totalAmount) || 0;
    if (total > 0) {
      const equalShare = Math.round(total / (newSplits.length + 1));
      setMyShare(equalShare.toString());
      setSplits(newSplits.map((s) => ({ ...s, amount: equalShare })));
    } else {
      setSplits(newSplits);
    }
  };

  const handleRemovePerson = (idx: number) => {
    const newSplits = splits.filter((_, i) => i !== idx);
    setSplits(newSplits);
    const total = parseFloat(totalAmount) || 0;
    if (total > 0 && newSplits.length > 0) {
      const equalShare = Math.round(total / (newSplits.length + 1));
      setMyShare(equalShare.toString());
      setSplits(newSplits.map((s) => ({ ...s, amount: equalShare })));
    }
  };

  const handleSplitAmountChange = (idx: number, amtVal: string) => {
    const val = parseFloat(amtVal) || 0;
    setSplits((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, amount: val } : s))
    );
  };

  const totalCalculated =
    (parseFloat(myShare) || 0) + splits.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalEntered = parseFloat(totalAmount) || 0;
  const splitDiff = totalEntered - totalCalculated;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalEntered || totalEntered <= 0) return;

    onSave(
      {
        totalAmount: totalEntered,
        description: description || (language === 'bn' ? 'শেয়ার্ড বিল' : 'Shared Expense'),
        paidByAccountId,
        myShare: parseFloat(myShare) || 0,
        splits: splits.map((s) => ({
          personId: s.personId,
          personName: s.personName,
          amount: s.amount,
          isSettled: false,
        })),
        date: new Date().toISOString().split('T')[0],
      },
      createDebts
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.sharedExpenses}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'রেস্তোরাঁ, ভ্রমণ বা গ্রোসারি বিল বন্ধুদের সাথে ভাগ করুন'
                  : 'Split restaurant, tour, or shared bills with friends'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Total Bill Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'মোট বিল বা খরচের পরিমাণ (BDT)' : 'Total Bill Amount (BDT)'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-lg font-num">৳</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => handleTotalChange(e.target.value)}
                autoFocus
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-9 pr-4 py-2.5 text-2xl font-black font-num text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'বিলের বিবরণ বা উপলক্ষ' : 'Bill Description'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: পানসী রেস্তোরাঁ ডিনার, সেন্টমার্টিন বোট ভাড়া' : 'e.g. Dinner, Tour'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Account used to pay */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'বিল পরিশোধ করেছেন কোন অ্যাকাউন্ট থেকে?' : 'Paid From Account'}
            </label>
            <select
              value={paidByAccountId}
              onChange={(e) => setPaidByAccountId(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-purple-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.balance, language)})
                </option>
              ))}
            </select>
          </div>

          {/* Splits section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">
                {language === 'bn' ? 'কার ভাগে কত পড়বে?' : 'Share Distribution'}
              </span>
              <button
                type="button"
                onClick={handleAddPerson}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '+ ব্যক্তি যোগ করুন' : '+ Add Person'}</span>
              </button>
            </div>

            {/* My Share */}
            <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs">
              <div>
                <span className="font-bold text-purple-300">{t.myShare}</span>
                <span className="text-[10px] text-slate-400 block">
                  {language === 'bn' ? 'আমার নিজস্ব খরচ হিসেবে গণনা হবে' : 'Your actual expense'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-num">৳</span>
                <input
                  type="number"
                  step="any"
                  value={myShare}
                  onChange={(e) => setMyShare(e.target.value)}
                  className="w-24 text-right rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-sm font-bold font-num text-purple-400 focus:outline-hidden focus:border-purple-400"
                />
              </div>
            </div>

            {/* Others' Splits */}
            {splits.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex-1 min-w-0">
                  <select
                    value={s.personId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      const p = people.find((person) => person.id === pid);
                      setSplits((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, personId: pid, personName: p?.name || item.personName } : item
                        )
                      );
                    }}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {!people.some((p) => p.id === s.personId) && (
                      <option value={s.personId}>{s.personName}</option>
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    step="any"
                    value={s.amount || ''}
                    placeholder="0"
                    onChange={(e) => handleSplitAmountChange(idx, e.target.value)}
                    className="w-24 text-right rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm font-bold font-num text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                  />
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Reconciliation Check of Split Totals */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {language === 'bn' ? 'মোট ভাগ করা হয়েছে:' : 'Total Distributed:'}
              </span>
              <div className="flex items-center gap-2 font-num">
                <span className="font-bold text-white">
                  {formatCurrency(totalCalculated, language)}
                </span>
                {Math.abs(splitDiff) > 0.01 && (
                  <span className="text-amber-400 text-[11px]">
                    ({splitDiff > 0 ? `+৳${splitDiff} বাকি` : `-৳${Math.abs(splitDiff)} বেশি`})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toggle: Create receivable records in people ledger */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={createDebts}
              onChange={(e) => setCreateDebts(e.target.checked)}
              className="mt-0.5 rounded-sm border-slate-700 text-purple-600 focus:ring-0"
            />
            <div>
              <span className="font-semibold text-slate-200">
                {language === 'bn'
                  ? 'বন্ধুদের থেকে এই টাকা পাবো হিসেবে কর্জ/দেনা-পাওনা খতিয়ানে যোগ করুন'
                  : 'Add friends shares as receivables to People ledger'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'তারা পরবর্তীতে টাকা ফেরত দিলে ১-ক্লিকে নিষ্পত্তি করতে পারবেন'
                  : 'Enables 1-click settlement when they repay you'}
              </p>
            </div>
          </label>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'bn' ? 'বিল ভাগাভাগি সম্পন্ন করুন' : 'Confirm Split'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
