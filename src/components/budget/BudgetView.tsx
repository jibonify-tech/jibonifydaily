import React, { useState } from 'react';
import { PieChart, Plus, AlertTriangle, CheckCircle, X, Check } from 'lucide-react';
import { Budget, Category, Language, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface BudgetViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  onSaveBudget: (budget: Omit<Budget, 'id'>) => void;
  language: Language;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  categories,
  transactions,
  onSaveBudget,
  language,
}) => {
  const t = translations[language];
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryId, setCategoryId] = useState(categories.filter((c) => c.type === 'expense')[0]?.id || '');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');

  // Filter this month's expenses
  const thisMonthExpenses = transactions.filter(
    (t) => !t.isDeleted && t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const budgetStats = budgets.map((b) => {
    const cat = catMap[b.categoryId];
    const catName = cat ? (language === 'bn' ? cat.nameBn : cat.nameEn) : b.categoryId;

    const used = thisMonthExpenses
      .filter((t) => t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const remaining = Math.max(0, b.monthlyLimit - used);
    const percentage = b.monthlyLimit > 0 ? Math.round((used / b.monthlyLimit) * 100) : 0;
    const isExceeded = used > b.monthlyLimit;
    const isWarning = percentage >= (b.alertThreshold || 80);

    return {
      ...b,
      catName,
      used,
      remaining,
      percentage,
      isExceeded,
      isWarning,
    };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalUsed = budgetStats.reduce((sum, b) => sum + b.used, 0);
  const totalRemaining = Math.max(0, totalBudget - totalUsed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (!limit || limit <= 0) return;

    onSaveBudget({
      categoryId,
      monthlyLimit: limit,
      alertThreshold: parseInt(alertThreshold, 10) || 80,
      month: currentMonth,
    });

    setMonthlyLimit('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <span>{t.budget}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'চলতি মাসের ক্যাটাগরিভিত্তিক খরচের সীমা ও সতর্কতা' : 'Monthly expense limits & budget alerts'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '+ নতুন বাজেট' : '+ Set Budget'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-400">
            {language === 'bn' ? 'মোট নির্ধারিত বাজেট' : 'Total Monthly Budget'}
          </span>
          <p className="text-2xl font-black text-white font-num mt-1">
            {formatCurrency(totalBudget, language)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-rose-300">{t.budgetUsed}</span>
          <p className="text-2xl font-black text-rose-400 font-num mt-1">
            {formatCurrency(totalUsed, language)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-emerald-300">{t.budgetRemaining}</span>
          <p className="text-2xl font-black text-emerald-400 font-num mt-1">
            {formatCurrency(totalRemaining, language)}
          </p>
        </div>
      </div>

      {/* Budget Items */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {language === 'bn' ? 'ক্যাটাগরি বাজেট অগ্রগতি' : 'Category Progress'}
        </h3>

        {budgetStats.length === 0 ? (
          <div className="py-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-slate-400 text-xs">
            <PieChart className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300 mb-1">
              {language === 'bn' ? 'কোনো বাজেট নির্ধারণ করা হয়নি' : 'No budgets configured'}
            </p>
            <p className="text-slate-500 mb-3">
              {language === 'bn' ? 'খাবার, যাতায়াত বা শপিংয়ের জন্য মাসিক বাজেট সেট করুন।' : 'Set limits for food, transport, shopping etc.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              {language === 'bn' ? '+ প্রথম বাজেট তৈরি করুন' : '+ Set First Budget'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {budgetStats.map((b) => (
              <div
                key={b.id}
                className={`rounded-2xl border p-4 shadow-xs transition ${
                  b.isExceeded
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : b.isWarning
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{b.catName}</span>
                    {b.isExceeded && (
                      <span className="flex items-center gap-1 rounded-md bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        {language === 'bn' ? 'বাজেট অতিরিক্ত!' : 'Overbudget!'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold font-num text-slate-300">
                    {formatCurrency(b.monthlyLimit, language)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.isExceeded
                          ? 'bg-rose-500'
                          : b.isWarning
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {t.budgetUsed}: <strong className="text-white font-num">{formatCurrency(b.used, language)}</strong> ({b.percentage}%)
                    </span>
                    <span>
                      {t.budgetRemaining}: <strong className="text-emerald-400 font-num">{formatCurrency(b.remaining, language)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'ক্যাটাগরি বাজেট নির্ধারণ' : 'Set Category Budget'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.category}</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {categories.filter((c) => c.type === 'expense').map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'bn' ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'মাসিক বাজেটের পরিমাণ (BDT)' : 'Monthly Budget Limit (BDT)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="5000"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-lg font-bold font-num text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'সতর্কতা নোটিফিকেশন সীমা (%)' : 'Warning Alert Threshold (%)'}
                </label>
                <select
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="50">50%</option>
                  <option value="75">75%</option>
                  <option value="80">80%</option>
                  <option value="90">90%</option>
                  <option value="100">100%</option>
                </select>
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
