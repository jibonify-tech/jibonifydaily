import React, { useState } from 'react';
import { Home, CheckCircle2, AlertTriangle, Info, Clock, DollarSign, X, Check, ArrowRight } from 'lucide-react';
import { Language, OutsideSession, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface ReturnHomeModalProps {
  session: OutsideSession;
  transactions: Transaction[];
  onConfirmReconciliation: (
    actualCash: number,
    difference: number,
    status: 'matched' | 'short' | 'extra',
    reason: string,
    notes: string,
    createAutoAdjustment: boolean
  ) => void;
  onClose: () => void;
  language: Language;
}

export const ReturnHomeModal: React.FC<ReturnHomeModalProps> = ({
  session,
  transactions,
  onConfirmReconciliation,
  onClose,
  language,
}) => {
  const t = translations[language];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Calculate session cash items
  const outsideTxs = transactions.filter(
    (t) => !t.isDeleted && (t.outsideSessionId === session.id || t.date === session.date)
  );

  const outsideExpenses = outsideTxs
    .filter((t) => t.type === 'expense' && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideIncome = outsideTxs
    .filter((t) => (t.type === 'income' || t.type === 'repayment_received') && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideCashTransfersIn = outsideTxs
    .filter((t) => t.type === 'transfer' && t.toAccountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideCashTransfersOut = outsideTxs
    .filter((t) => t.type === 'transfer' && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outsideCashLent = outsideTxs
    .filter((t) => t.type === 'lend' && t.accountId === 'acc_pocket')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalTaken = Number(session.cashTaken || 0) + Number(session.additionalCashTaken || 0);
  const expectedCash =
    totalTaken + outsideIncome + outsideCashTransfersIn - outsideExpenses - outsideCashTransfersOut - outsideCashLent;

  // Actual cash entered by user
  const [actualCashInput, setActualCashInput] = useState(expectedCash.toString());
  const [differenceReason, setDifferenceReason] = useState(t.forgotExpense);
  const [notes, setNotes] = useState('');
  const [createAutoAdjustment, setCreateAutoAdjustment] = useState(true);

  const actualCash = parseFloat(actualCashInput) || 0;
  const diff = actualCash - expectedCash;

  const status: 'matched' | 'short' | 'extra' =
    Math.abs(diff) < 0.01 ? 'matched' : diff < 0 ? 'short' : 'extra';

  const diffReasonsBn = [
    'কোনো খরচ লিখতে ভুলে গেছি',
    'রিকশা/সিএনজি বকশিশ বা ভাঙতি টাকা বাকি রয়ে গেছে',
    'কাউকে নগদ টাকা ধার দিয়েছি',
    'অলিখিত কোনো নগদ টাকা পেয়েছি বা খরচ করেছি',
    'অন্যান্য কারণ',
  ];

  const diffReasonsEn = [
    'Forgot to log an expense',
    'Transport tip or change rounded off',
    'Lent cash to someone without logging',
    'Unrecorded cash received or spent',
    'Other reason',
  ];

  const reasons = language === 'bn' ? diffReasonsBn : diffReasonsEn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReconciliation(
      actualCash,
      diff,
      status,
      status === 'matched' ? 'হিসাব মিলেছে' : differenceReason,
      notes,
      createAutoAdjustment
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'bn' ? 'বাসায় ফিরেছি (ক্যাশ হিসাব মেলানো)' : 'Returned Home & Cash Reconciliation'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'বাইরে খরচ শেষে পকেটের বাস্তব নগদ টাকার হিসাব যাচাই' : 'Verify physical cash against system calculation'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Trip Summary Details */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-800 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>{language === 'bn' ? 'গন্তব্য ও উদ্দেশ্য:' : 'Destination & Purpose:'}</span>
              <span className="font-semibold text-white truncate max-w-[240px]">
                {session.destination} ({session.purpose})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>{language === 'bn' ? 'সময়কাল:' : 'Session Time:'}</span>
              <span className="font-semibold text-white font-num">
                {session.startTime} → {currentTime}
              </span>
            </div>
          </div>

          {/* Mathematical breakdown */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'bn' ? 'টাকা নিয়ে বের হয়েছিলেন:' : 'Money Taken Outside:'}</span>
              <span className="font-semibold text-slate-200 font-num">{formatCurrency(totalTaken, language)}</span>
            </div>
            {outsideIncome > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>(+) {language === 'bn' ? 'বাইরে ক্যাশ পেয়েছিলেন:' : 'Outside Cash Received:'}</span>
                <span className="font-semibold font-num">+{formatCurrency(outsideIncome, language)}</span>
              </div>
            )}
            {outsideExpenses > 0 && (
              <div className="flex items-center justify-between text-rose-400">
                <span>(-) {language === 'bn' ? 'বাইরে মোট খরচ হয়েছে:' : 'Outside Cash Expenses:'}</span>
                <span className="font-semibold font-num">-{formatCurrency(outsideExpenses, language)}</span>
              </div>
            )}
            {outsideCashLent > 0 && (
              <div className="flex items-center justify-between text-amber-400">
                <span>(-) {language === 'bn' ? 'কাউকে নগদ ধার দিয়েছেন:' : 'Cash Lent to Others:'}</span>
                <span className="font-semibold font-num">-{formatCurrency(outsideCashLent, language)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-emerald-400 text-sm">
              <span>{language === 'bn' ? 'হিসাব মতে পকেটে থাকার কথা (Expected Cash):' : 'Expected Cash in Pocket:'}</span>
              <span className="font-num text-base">{formatCurrency(expectedCash, language)}</span>
            </div>
          </div>

          {/* Core Question: Actual Cash Input */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 p-4 space-y-2">
            <label className="block text-xs sm:text-sm font-extrabold text-emerald-300">
              {t.actualCashPrompt}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-lg font-num">৳</span>
              <input
                type="number"
                step="any"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950 border border-emerald-500/60 pl-9 pr-4 py-2.5 text-xl sm:text-2xl font-black font-num text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'পকেটের সব টাকা গুনে এখানে লিখুন। হিসাব নিজে নিজে মিলেছে কিনা দেখাবে।'
                : 'Count the physical bills & coins in your pocket and enter the amount.'}
            </p>
          </div>

          {/* Reconciliation Status Badge */}
          {status === 'matched' ? (
            <div className="rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3.5 flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  {language === 'bn' ? '✅ হিসাব সম্পূর্ণ মিলেছে!' : '✅ Perfect Cash Match!'}
                </p>
                <p className="text-xs text-emerald-300/80">
                  {language === 'bn' ? 'প্রত্যাশিত ও বাস্তব ক্যাশ সমান (পার্থক্য: ৳০)' : 'Expected and physical cash match exactly (Diff: ৳0)'}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-950/70 border border-amber-500/50 p-3.5 space-y-3">
              <div className="flex items-center gap-3 text-amber-300">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-400">
                    {status === 'short'
                      ? language === 'bn'
                        ? `⚠️ ${formatCurrency(Math.abs(diff), language)} হিসাব কম / ঘাটতি!`
                        : `⚠️ Cash Shortage by ${formatCurrency(Math.abs(diff), language)}`
                      : language === 'bn'
                        ? `ℹ️ ${formatCurrency(Math.abs(diff), language)} বাড়তি নগদ টাকা পাওয়া গেছে!`
                        : `ℹ️ Cash Surplus of ${formatCurrency(Math.abs(diff), language)}`}
                  </p>
                  <p className="text-xs text-amber-200/80">
                    {language === 'bn'
                      ? 'বাস্তবে টাকা কম বা বেশি হলে কারণ নির্বাচন করে নোট লিখে রাখুন।'
                      : 'Select the likely reason for difference and add an audit note.'}
                  </p>
                </div>
              </div>

              {/* Difference Reason Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.reasonForDiff}
                </label>
                <select
                  value={differenceReason}
                  onChange={(e) => setDifferenceReason(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-amber-500"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difference Note */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'পার্থক্যের বিস্তারিত নোট (ঐচ্ছিক)' : 'Difference Details (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: বিকেলে চা খাওয়ার পর ৫০ টাকার নোট হারিয়ে গেছে' : 'e.g. Forgot small tea stall expense'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Auto Adjustment checkbox */}
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAutoAdjustment}
                  onChange={(e) => setCreateAutoAdjustment(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
                />
                <span>
                  {language === 'bn'
                    ? 'পকেট ক্যাশের সাথে মেলাতে স্বয়ংক্রিয় অ্যাডজাস্টমেন্ট রেকর্ড যোগ করুন'
                    : 'Create auto adjustment transaction so pocket cash matches reality'}
                </span>
              </label>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
              <Check className="w-4 h-4" />
              <span>{language === 'bn' ? 'হিসাব নিশ্চিত ও জার্নি সমাপ্ত' : 'Confirm & Complete Journey'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
