import React from 'react';
import { Footprints, Clock, MapPin, Car, Wallet, CheckCircle2, AlertTriangle, Home, Plus } from 'lucide-react';
import { Language, OutsideSession } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface OutsideJourneysViewProps {
  outsideSessions: OutsideSession[];
  onGoOutside: () => void;
  onReturnHome: () => void;
  language: Language;
}

export const OutsideJourneysView: React.FC<OutsideJourneysViewProps> = ({
  outsideSessions,
  onGoOutside,
  onReturnHome,
  language,
}) => {
  const t = translations[language];
  const activeSession = outsideSessions.find((s) => s.isActive);

  return (
    <div className="space-y-4 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Footprints className="w-5 h-5 text-blue-400" />
            <span>{t.outsideJourneys}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'বাসা থেকে বের হওয়া, বাইরে টাকা খরচ এবং বাসায় ফিরে ক্যাশ মেলানোর ইতিহাস' : 'Track your outdoor sessions, cash carried and cash reconciliation'}
          </p>
        </div>

        <div>
          {activeSession ? (
            <button
              onClick={onReturnHome}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>{t.returnHome}</span>
            </button>
          ) : (
            <button
              onClick={onGoOutside}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95"
            >
              <Footprints className="w-4 h-4" />
              <span>{t.goOutside}</span>
            </button>
          )}
        </div>
      </div>

      {outsideSessions.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400 text-xs">
          <Footprints className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
          <p className="text-base font-semibold text-slate-300 mb-1">
            {language === 'bn' ? 'এখনও কোনো বাইরের জার্নি রেকর্ড করা হয়নি' : 'No outside trips recorded yet'}
          </p>
          <p className="text-slate-500 mb-4">
            {language === 'bn'
              ? 'যখনই বাইরে বের হবেন, "বাইরে বের হলাম" বাটনে চাপ দিয়ে পকেটে নেওয়া টাকা লিখে রাখুন।'
              : 'Click "Going Outside" before leaving home to track cash carried.'}
          </p>
          <button
            onClick={onGoOutside}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
          >
            {t.goOutside}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {outsideSessions.map((s) => {
            const isLive = s.isActive;
            const isMatched = s.reconciliationStatus === 'matched';
            const totalCashCarried = Number(s.cashTaken || 0) + Number(s.additionalCashTaken || 0);

            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-4 sm:p-5 transition shadow-sm ${
                  isLive
                    ? 'border-blue-500/50 bg-blue-950/20'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                        isLive
                          ? 'bg-blue-600 text-white'
                          : isMatched
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <Footprints className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {s.destination}
                        </h3>
                        {isLive && (
                          <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                            {language === 'bn' ? 'চলমান জার্নি' : 'ACTIVE'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {s.purpose} {s.transportType ? `• ${s.transportType}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-num">
                      {s.date} • {s.startTime} {s.endTime ? `→ ${s.endTime}` : ''}
                    </span>
                  </div>
                </div>

                {/* Financial breakdown of the trip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
                  <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                    <span className="text-slate-400">{language === 'bn' ? 'টাকা নেওয়া হয়েছিল:' : 'Cash Taken:'}</span>
                    <p className="font-bold text-white font-num text-sm mt-0.5">
                      {formatCurrency(totalCashCarried, language)}
                    </p>
                  </div>

                  {s.expectedCashAtReturn !== undefined && (
                    <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                      <span className="text-slate-400">{language === 'bn' ? 'প্রত্যাশিত ক্যাশ:' : 'Expected Cash:'}</span>
                      <p className="font-bold text-slate-300 font-num text-sm mt-0.5">
                        {formatCurrency(s.expectedCashAtReturn, language)}
                      </p>
                    </div>
                  )}

                  {s.actualCashAtReturn !== undefined && (
                    <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                      <span className="text-slate-400">{language === 'bn' ? 'বাস্তব ক্যাশ:' : 'Actual Cash:'}</span>
                      <p className="font-bold text-emerald-400 font-num text-sm mt-0.5">
                        {formatCurrency(s.actualCashAtReturn, language)}
                      </p>
                    </div>
                  )}

                  {s.cashDifference !== undefined && (
                    <div
                      className={`rounded-xl p-2.5 border ${
                        isMatched
                          ? 'bg-emerald-950/40 border-emerald-500/30'
                          : 'bg-amber-950/40 border-amber-500/30'
                      }`}
                    >
                      <span className="text-slate-400">{language === 'bn' ? 'হিসাব অবস্থা:' : 'Match Status:'}</span>
                      <p
                        className={`font-bold font-num text-xs sm:text-sm mt-0.5 ${
                          isMatched ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {isMatched
                          ? language === 'bn'
                            ? '✅ হিসাব মিলেছে'
                            : '✅ Matched'
                          : language === 'bn'
                          ? `⚠️ ${formatCurrency(Math.abs(s.cashDifference), language)} পার্থক্য`
                          : `⚠️ ${formatCurrency(Math.abs(s.cashDifference), language)} Diff`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reason & notes if difference existed */}
                {s.differenceReason && (
                  <div className="mt-2 text-xs text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-semibold text-slate-300">
                      {language === 'bn' ? 'পার্থক্যের কারণ:' : 'Reason:'}{' '}
                    </span>
                    <span>{s.differenceReason}</span>
                    {s.differenceNote && <span className="italic ml-2">({s.differenceNote})</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
