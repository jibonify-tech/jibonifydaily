import React, { useState } from 'react';
import { Target, ShieldCheck, Plus, CheckCircle, Clock, X, Check, ArrowRight, DollarSign } from 'lucide-react';
import { Account, EmergencyFund, Language, SavingsGoal } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface SavingsGoalsViewProps {
  savingsGoals: SavingsGoal[];
  emergencyFund: EmergencyFund;
  accounts: Account[];
  onSaveGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'contributions'>) => void;
  onContributeGoal: (goalId: string, amount: number, accountId: string, note?: string) => void;
  onUpdateEmergencyFund: (fund: EmergencyFund) => void;
  onContributeEmergencyFund: (amount: number, accountId: string) => void;
  language: Language;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  savingsGoals,
  emergencyFund,
  accounts,
  onSaveGoal,
  onContributeGoal,
  onUpdateEmergencyFund,
  onContributeEmergencyFund,
  language,
}) => {
  const t = translations[language];

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState<SavingsGoal | null>(null);
  const [showEmergencyContributeModal, setShowEmergencyContributeModal] = useState(false);

  // New goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [goalNotes, setGoalNotes] = useState('');

  // Contribution form
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeAccountId, setContributeAccountId] = useState(accounts[0]?.id || '');
  const [contributeNote, setContributeNote] = useState('');

  // Emergency Fund calculations
  const emergencyRemaining = Math.max(0, emergencyFund.targetAmount - emergencyFund.currentAmount);
  const emergencyPct = emergencyFund.targetAmount > 0
    ? Math.min(100, Math.round((emergencyFund.currentAmount / emergencyFund.targetAmount) * 100))
    : 0;

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!target || target <= 0 || !goalTitle.trim()) return;

    const current = parseFloat(initialAmount) || 0;
    onSaveGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate: targetDate || undefined,
      notes: goalNotes.trim() || undefined,
      isCompleted: current >= target,
      color: '#3b82f6',
    });

    setGoalTitle('');
    setTargetAmount('');
    setInitialAmount('');
    setTargetDate('');
    setGoalNotes('');
    setShowAddGoalModal(false);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContributeModal) return;
    const amt = parseFloat(contributeAmount);
    if (!amt || amt <= 0) return;

    onContributeGoal(showContributeModal.id, amt, contributeAccountId, contributeNote);
    setContributeAmount('');
    setContributeNote('');
    setShowContributeModal(null);
  };

  const handleEmergencyContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(contributeAmount);
    if (!amt || amt <= 0) return;

    onContributeEmergencyFund(amt, contributeAccountId);
    setContributeAmount('');
    setShowEmergencyContributeModal(false);
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>{t.savingsGoals}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'ভবিষ্যতের স্বপ্ন পূরণ ও আর্থিক নিরাপত্তার জন্য সঞ্চয় লক্ষ্য ও জরুরি ফান্ড'
              : 'Save towards financial dreams and emergency preparedness'}
          </p>
        </div>

        <button
          onClick={() => setShowAddGoalModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '+ নতুন সঞ্চয় লক্ষ্য' : '+ Add Savings Goal'}</span>
        </button>
      </div>

      {/* 1. Dedicated Emergency Fund Card */}
      <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {t.emergencyFund}
                </h3>
                <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                  {emergencyPct}%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {emergencyFund.notes || (language === 'bn' ? 'জরুরি চিকিৎসা বা অপ্রত্যাশিত ব্যয়ের ফান্ড' : 'Prepared for life emergencies')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEmergencyContributeModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'তহবিলে টাকা জমান' : 'Add Deposit'}</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              {language === 'bn' ? 'বর্তমান জমার পরিমাণ:' : 'Current Saved:'}{' '}
              <strong className="text-blue-400 font-num">{formatCurrency(emergencyFund.currentAmount, language)}</strong>
            </span>
            <span className="text-slate-400">
              {language === 'bn' ? 'টার্গেট:' : 'Target:'}{' '}
              <strong className="text-white font-num">{formatCurrency(emergencyFund.targetAmount, language)}</strong>
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${emergencyPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>
              {language === 'bn'
                ? `লক্ষ্যমাত্রার ${formatCurrency(emergencyRemaining, language)} এখনো বাকি`
                : `${formatCurrency(emergencyRemaining, language)} remaining to goal`}
            </span>
            <span>{emergencyPct >= 100 ? '✅ লক্ষ্য অর্জিত!' : `${emergencyPct}% সম্পন্ন`}</span>
          </div>
        </div>
      </div>

      {/* 2. Savings Goals Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'সক্রিয় সঞ্চয় লক্ষ্যসমূহ' : 'Active Savings Goals'}</span>
        </h3>

        {savingsGoals.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-xs text-slate-400">
            <Target className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300 mb-1">
              {language === 'bn' ? 'কোনো সঞ্চয় লক্ষ্য যোগ করা হয়নি' : 'No savings goals created yet'}
            </p>
            <p className="text-slate-500 mb-4">
              {language === 'bn'
                ? 'ল্যাপটপ কেনা, পরিবারের সাথে ভ্রমণ বা কোনো বিশেষ ইচ্ছার জন্য লক্ষ্য তৈরি করুন।'
                : 'Create goals for gadgets, travel or personal milestones.'}
            </p>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              + {language === 'bn' ? 'নতুন লক্ষ্য নির্ধারণ করুন' : 'Set New Goal'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((g) => {
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);
              const pct = g.targetAmount > 0
                ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
                : 0;

              return (
                <div
                  key={g.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{g.title}</h4>
                        {g.notes && <p className="text-xs text-slate-400 mt-0.5">{g.notes}</p>}
                        {g.targetDate && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{language === 'bn' ? 'টার্গেট তারিখ:' : 'Target:'} {g.targetDate}</span>
                          </div>
                        )}
                      </div>
                      <span className="rounded-lg bg-emerald-950 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400 font-num shrink-0">
                        {pct}%
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-bold font-num">
                          {formatCurrency(g.currentAmount, language)}
                        </span>
                        <span className="text-slate-400 font-num">
                          {formatCurrency(g.targetAmount, language)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">
                      {language === 'bn' ? 'বাকি:' : 'Remaining:'}{' '}
                      <strong className="text-white font-num">{formatCurrency(remaining, language)}</strong>
                    </span>
                    <button
                      onClick={() => setShowContributeModal(g)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 font-semibold text-white transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.contribute}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'নতুন সঞ্চয় লক্ষ্য তৈরি করুন' : 'Create Savings Goal'}
              </h3>
              <button onClick={() => setShowAddGoalModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'লক্ষ্যের নাম' : 'Goal Title'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: নতুন ল্যাপটপ, হজ্ব তহবিল' : 'e.g. New Laptop'}
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'টার্গেট টাকার পরিমাণ (BDT)' : 'Target Amount (BDT)'}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-lg font-bold font-num text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'ইতিমধ্যে কত টাকা জমা হয়েছে (ঐচ্ছিক)' : 'Already Saved (Optional)'}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs font-num text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'টার্গেট তারিখ (ঐচ্ছিক)' : 'Target Completion Date'}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.notes}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'উদ্দেশ্য বা পরিকল্পনা...' : 'Notes...'}
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
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

      {/* Contribute to Goal Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {t.contribute}: {showContributeModal.title}
              </h3>
              <button onClick={() => setShowContributeModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'জমা দেওয়ার পরিমাণ (BDT)' : 'Deposit Amount (BDT)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="1000"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-lg font-bold font-num text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'কোন অ্যাকাউন্ট থেকে টাকা নেওয়া হবে?' : 'From Account'}
                </label>
                <select
                  value={contributeAccountId}
                  onChange={(e) => setContributeAccountId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.notes}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: মাসিক কিস্তি, বোনাস জমা' : 'Note'}
                  value={contributeNote}
                  onChange={(e) => setContributeNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowContributeModal(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'টাকা জমা করুন' : 'Confirm Deposit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Fund Contribution Modal */}
      {showEmergencyContributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'জরুরি তহবিলে টাকা জমা করুন' : 'Deposit to Emergency Fund'}
              </h3>
              <button onClick={() => setShowEmergencyContributeModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmergencyContributeSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'জমা দেওয়ার পরিমাণ (BDT)' : 'Deposit Amount (BDT)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="2000"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-lg font-bold font-num text-blue-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'কোন অ্যাকাউন্ট থেকে টাকা নেওয়া হবে?' : 'From Account'}
                </label>
                <select
                  value={contributeAccountId}
                  onChange={(e) => setContributeAccountId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmergencyContributeModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'তহবিলে যুক্ত করুন' : 'Confirm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
