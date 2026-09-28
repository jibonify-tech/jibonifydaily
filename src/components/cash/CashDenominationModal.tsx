import React, { useState } from 'react';
import { Banknote, X, Check, RotateCcw, Calculator, ArrowRight } from 'lucide-react';
import { CashDenominationCounts, Language } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface CashDenominationModalProps {
  onApply?: (total: number) => void;
  onClose: () => void;
  language: Language;
  initialCounts?: Partial<CashDenominationCounts>;
}

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1] as const;

export const CashDenominationModal: React.FC<CashDenominationModalProps> = ({
  onApply,
  onClose,
  language,
  initialCounts,
}) => {
  const t = translations[language];

  const [counts, setCounts] = useState<CashDenominationCounts>(() => ({
    1000: initialCounts?.[1000] || 0,
    500: initialCounts?.[500] || 0,
    200: initialCounts?.[200] || 0,
    100: initialCounts?.[100] || 0,
    50: initialCounts?.[50] || 0,
    20: initialCounts?.[20] || 0,
    10: initialCounts?.[10] || 0,
    5: initialCounts?.[5] || 0,
    2: initialCounts?.[2] || 0,
    1: initialCounts?.[1] || 0,
  }));

  const updateCount = (denom: keyof CashDenominationCounts, value: number) => {
    setCounts((prev) => ({
      ...prev,
      [denom]: Math.max(0, value),
    }));
  };

  const handleReset = () => {
    setCounts({
      1000: 0,
      500: 0,
      200: 0,
      100: 0,
      50: 0,
      20: 0,
      10: 0,
      5: 0,
      2: 0,
      1: 0,
    });
  };

  const totalAmount = DENOMINATIONS.reduce((sum, denom) => sum + denom * (counts[denom] || 0), 0);
  const totalNotesCount = DENOMINATIONS.reduce((sum, denom) => sum + (counts[denom] || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.cashDenomination}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'নোটের সংখ্যা বসিয়ে মোট নগদ টাকা হিসাব করুন' : 'Calculate total cash by note denominations'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Calculated Banner */}
        <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 p-4 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs font-semibold text-emerald-300">
              {t.totalCounted} ({totalNotesCount} {language === 'bn' ? 'টি নোট' : 'notes'})
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-num mt-0.5">
              {formatCurrency(totalAmount, language)}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-2.5 py-1.5 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>

        {/* Denominations List */}
        <div className="mt-4 space-y-2">
          {DENOMINATIONS.map((denom) => {
            const count = counts[denom] || 0;
            const subtotal = denom * count;

            return (
              <div
                key={denom}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition"
              >
                {/* Note Label */}
                <div className="flex items-center gap-2 min-w-[75px]">
                  <span className="flex h-7 w-12 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-black text-xs font-num">
                    ৳{denom}
                  </span>
                </div>

                {/* Counter Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateCount(denom, count - 1)}
                    className="h-8 w-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center transition active:scale-90"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(e) => updateCount(denom, parseInt(e.target.value) || 0)}
                    className="h-8 w-16 text-center rounded-lg bg-slate-950 border border-slate-700 text-white font-bold font-num text-sm focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => updateCount(denom, count + 1)}
                    className="h-8 w-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center transition active:scale-90"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[80px]">
                  <span className="font-bold text-white text-xs sm:text-sm font-num">
                    {formatCurrency(subtotal, language)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            {t.cancel}
          </button>
          {onApply && (
            <button
              onClick={() => {
                onApply(totalAmount);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{t.applyToActualCash} ({formatCurrency(totalAmount, language)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
