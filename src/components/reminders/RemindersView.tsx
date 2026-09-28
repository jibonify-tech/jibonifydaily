import React, { useState } from 'react';
import { Bell, Plus, CheckCircle, Clock, Calendar, Check, X, ArrowUpRight } from 'lucide-react';
import { Account, Category, Language, RecurringTransaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface RemindersViewProps {
  recurring: RecurringTransaction[];
  accounts: Account[];
  categories: Category[];
  onAddRecurring: (item: Omit<RecurringTransaction, 'id'>) => void;
  onPayRecurring: (item: RecurringTransaction) => void;
  language: Language;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  recurring,
  accounts,
  categories,
  onAddRecurring,
  onPayRecurring,
  language,
}) => {
  const t = translations[language];
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !title.trim()) return;

    onAddRecurring({
      title: title.trim(),
      amount: amt,
      type,
      categoryId,
      accountId,
      frequency,
      startDate: new Date().toISOString().split('T')[0],
      nextDueDate,
      isActive: true,
      autoRecord: false,
      description,
    });

    setTitle('');
    setAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-4 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>{t.reminders}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'বাড়িভাড়া, ইন্টারনেট বিল, সাবস্ক্রিপশন ও কিস্তির স্বয়ংক্রিয় রিমাইন্ডার' : 'Recurring bills, subscriptions and installment reminders'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '+ নতুন রিমাইন্ডার' : '+ Add Reminder'}</span>
        </button>
      </div>

      {recurring.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-slate-400 text-xs">
          <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
          <p className="text-base font-semibold text-slate-300 mb-1">
            {language === 'bn' ? 'কোনো নিয়মিত বিল বা রিমাইন্ডার নেই' : 'No recurring reminders'}
          </p>
          <p className="text-slate-500 mb-3">
            {language === 'bn' ? 'মাসিক বাড়িভাড়া, ওয়াইফাই বিল বা ঋণের কিস্তি যোগ করে রাখুন।' : 'Add recurring rent, internet bills or loan installments.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
          >
            {language === 'bn' ? '+ রিমাইন্ডার যোগ করুন' : '+ Add Reminder'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recurring.map((item) => {
            const cat = catMap[item.categoryId];
            const acc = accMap[item.accountId];
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs space-y-3 hover:border-amber-500/40 transition"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {item.frequency}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-amber-400 font-num">
                    {formatCurrency(item.amount, language)}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  {item.description && <p className="text-slate-300 text-[11px]">"{item.description}"</p>}
                  <div className="flex items-center justify-between text-[11px]">
                    <span>
                      {t.account}: <strong className="text-slate-200">{acc?.name.split(' ')[0]}</strong>
                    </span>
                    <span>
                      {language === 'bn' ? 'পরবর্তী তারিখ:' : 'Due:'} <strong className="text-amber-400 font-num">{item.nextDueDate}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => onPayRecurring(item)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'এখনই রেকর্ড করুন' : 'Record Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Recurring Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'নতুন রিমাইন্ডার বা বিল যোগ করুন' : 'Add Recurring Reminder'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'শিরোনাম' : 'Title'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: বাসা ভাড়া, ওয়াইফাই বিল, নেটফ্লিক্স' : 'e.g. House Rent, WiFi'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.amount} (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-base font-bold font-num text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'পুনরাবৃত্তি' : 'Frequency'}
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="daily">{language === 'bn' ? 'দৈনিক' : 'Daily'}</option>
                    <option value="weekly">{language === 'bn' ? 'সাপ্তাহিক' : 'Weekly'}</option>
                    <option value="monthly">{language === 'bn' ? 'মাসিক' : 'Monthly'}</option>
                    <option value="yearly">{language === 'bn' ? 'বার্ষিক' : 'Yearly'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t.dueDate}</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.category}</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'bn' ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.account}</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.notes}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'বিশেষ বিবরণ' : 'Description'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
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
