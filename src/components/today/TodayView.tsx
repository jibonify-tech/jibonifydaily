import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Footprints,
  Home,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Banknote,
  Receipt,
  Car,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  History,
} from 'lucide-react';
import {
  Account,
  Category,
  DailyClosing,
  DaySession,
  Language,
  OutsideSession,
  Transaction,
} from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';
import { OutsideActiveCard } from '../dashboard/OutsideActiveCard';

interface TodayViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  daySession?: DaySession;
  outsideSessions: OutsideSession[];
  dailyClosings: DailyClosing[];
  onStartDay: () => void;
  onGoOutside: () => void;
  onReturnHome: () => void;
  onCloseDay: () => void;
  onOpenQuickExpense: () => void;
  onOpenQuickIncome: () => void;
  onOpenTransfer: () => void;
  onOpenDenomination: () => void;
  onViewReceipt: (img: string, title: string) => void;
  language: Language;
}

export const TodayView: React.FC<TodayViewProps> = ({
  accounts,
  transactions,
  categories,
  daySession,
  outsideSessions,
  dailyClosings,
  onStartDay,
  onGoOutside,
  onReturnHome,
  onCloseDay,
  onOpenQuickExpense,
  onOpenQuickIncome,
  onOpenTransfer,
  onOpenDenomination,
  onViewReceipt,
  language,
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().split('T')[0];

  const pocketAcc = accounts.find((a) => a.isDefaultPocket || a.subType === 'pocket');
  const pocketCash = pocketAcc ? pocketAcc.balance : 0;

  // Active outside session
  const activeOutsideSession = outsideSessions.find((s) => s.isActive);
  // All today's outside sessions (including completed ones)
  const todayOutsideSessions = outsideSessions.filter((s) => s.date === todayStr);

  // Today's active transactions
  const todayTxs = transactions.filter((t) => !t.isDeleted && t.date === todayStr);

  const todayIncome = todayTxs
    .filter((t) => t.type === 'income' || t.type === 'repayment_received')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const todayExpense = todayTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const todayTransfers = todayTxs
    .filter((t) => t.type === 'transfer')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = todayIncome - todayExpense;
  const todaySavings = Math.max(0, netCashFlow);

  // Expected pocket cash calculation
  const openingPocket = daySession?.openingCash ?? pocketCash;
  const cashIncomeToday = todayTxs
    .filter(
      (t) =>
        (t.type === 'income' || t.type === 'repayment_received') &&
        t.accountId === (pocketAcc?.id || 'acc_pocket')
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashExpenseToday = todayTxs
    .filter((t) => t.type === 'expense' && t.accountId === (pocketAcc?.id || 'acc_pocket'))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashTransferInToday = todayTxs
    .filter((t) => t.type === 'transfer' && t.toAccountId === (pocketAcc?.id || 'acc_pocket'))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashTransferOutToday = todayTxs
    .filter((t) => t.type === 'transfer' && t.accountId === (pocketAcc?.id || 'acc_pocket'))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expectedPocketCash =
    openingPocket + cashIncomeToday + cashTransferInToday - cashExpenseToday - cashTransferOutToday;
  const cashDiff = pocketCash - expectedPocketCash;
  const isCashMatched = Math.abs(cashDiff) < 0.01;

  const todayClosing = dailyClosings.find((c) => c.date === todayStr);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  // Build Chronological Timeline Items:
  // Combines day start event, leave home events, transactions, return home events, daily closing
  interface TimelineEvent {
    id: string;
    time: string;
    type: 'day_start' | 'journey_start' | 'transaction' | 'journey_end' | 'day_close';
    title: string;
    subtitle?: string;
    amount?: number;
    isExpense?: boolean;
    isIncome?: boolean;
    icon: any;
    color: string;
    badge?: string;
    receiptImage?: string;
  }

  const timelineEvents: TimelineEvent[] = [];

  // 1. Day Start event
  if (daySession?.isStarted) {
    timelineEvents.push({
      id: 'event_day_start',
      time: daySession.startTime,
      type: 'day_start',
      title: language === 'bn' ? 'সকালের হিসাব শুরু' : 'Day Started',
      subtitle: `${language === 'bn' ? 'প্রারম্ভিক ব্যালেন্স:' : 'Opening:'} ${formatCurrency(daySession.openingTotal, language)} (পকেট: ${formatCurrency(daySession.openingCash, language)})`,
      icon: Sun,
      color: '#eab308',
    });
  }

  // 2. Journeys
  todayOutsideSessions.forEach((session, idx) => {
    timelineEvents.push({
      id: `event_journey_start_${session.id}`,
      time: session.startTime,
      type: 'journey_start',
      title: `${language === 'bn' ? 'বাইরে বের হলেন' : 'Left Home'} (${language === 'bn' ? 'যাত্রা' : 'Trip'} #${todayOutsideSessions.length - idx})`,
      subtitle: `${session.destination} • ${session.purpose} (${language === 'bn' ? 'নেওয়া টাকা:' : 'Taken:'} ${formatCurrency(session.cashTaken, language)})`,
      icon: Footprints,
      color: '#3b82f6',
    });

    if (session.endTime) {
      timelineEvents.push({
        id: `event_journey_end_${session.id}`,
        time: session.endTime,
        type: 'journey_end',
        title: language === 'bn' ? 'বাসায় ফিরেছেন' : 'Returned Home',
        subtitle: `${language === 'bn' ? 'ক্যাশ হিসাব:' : 'Cash Status:'} ${
          session.reconciliationStatus === 'matched'
            ? language === 'bn' ? '✅ মিলেছে' : '✅ Matched'
            : session.reconciliationStatus === 'short'
            ? language === 'bn' ? '⚠️ ঘাটতি' : '⚠️ Short'
            : language === 'bn' ? '⚠️ বাড়তি' : '⚠️ Extra'
        } (বাস্তব: ${formatCurrency(session.actualCashAtReturn || 0, language)})`,
        icon: Home,
        color: '#10b981',
      });
    }
  });

  // 3. Transactions
  todayTxs.forEach((tx) => {
    const isExp = tx.type === 'expense';
    const isInc = tx.type === 'income' || tx.type === 'repayment_received';
    const cat = catMap[tx.categoryId || ''];
    const acc = accMap[tx.accountId];

    timelineEvents.push({
      id: `event_tx_${tx.id}`,
      time: tx.time,
      type: 'transaction',
      title: tx.description,
      subtitle: `${acc?.name.split(' ')[0] || 'Cash'} ${cat ? `• ${language === 'bn' ? cat.nameBn : cat.nameEn}` : ''}`,
      amount: tx.amount,
      isExpense: isExp,
      isIncome: isInc,
      icon: isExp ? ArrowUpRight : isInc ? ArrowDownLeft : ArrowLeftRight,
      color: isExp ? '#f43f5e' : isInc ? '#10b981' : '#3b82f6',
      receiptImage: tx.receiptImage,
    });
  });

  // 4. Daily Closing
  if (todayClosing || daySession?.isClosed) {
    timelineEvents.push({
      id: 'event_day_close',
      time: todayClosing?.closedAt || '23:59',
      type: 'day_close',
      title: language === 'bn' ? 'আজকের হিসাব সমাপ্ত' : 'Day Closed',
      subtitle: `${language === 'bn' ? 'মোট খরচ:' : 'Expense:'} ${formatCurrency(todayExpense, language)} • ${language === 'bn' ? 'সঞ্চয়:' : 'Savings:'} ${formatCurrency(todaySavings, language)}`,
      icon: Moon,
      color: '#a855f7',
    });
  }

  // Sort timeline chronologically
  timelineEvents.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* 1. Start Day Widget & Status Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {language === 'bn' ? 'আজকের অবস্থা:' : "Today's Status:"}
              </span>

              {daySession?.isClosed ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-950/80 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/40">
                  <Moon className="w-3.5 h-3.5" />
                  <span>{t.dayClosed}</span>
                </span>
              ) : activeOutsideSession?.isActive ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-950/80 px-2.5 py-0.5 text-xs font-bold text-blue-300 border border-blue-500/40 animate-pulse">
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'আপনি এখন বাইরে আছেন' : 'Outside in Progress'}</span>
                </span>
              ) : daySession?.isStarted ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                  <Sun className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'আজকের হিসাব চলছে' : "Today's Hisab Active"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/80 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.dayNotStarted}</span>
                </span>
              )}
            </div>

            {/* Morning Cash vs Real Cash Comparison */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
              <span>
                {language === 'bn' ? 'প্রত্যাশিত ক্যাশ:' : 'Expected Cash:'}{' '}
                <strong className="font-num text-white">{formatCurrency(expectedPocketCash, language)}</strong>
              </span>
              <span>•</span>
              <span>
                {language === 'bn' ? 'বাস্তব পকেট ক্যাশ:' : 'Actual Cash:'}{' '}
                <strong className="font-num text-emerald-400">{formatCurrency(pocketCash, language)}</strong>
              </span>
              <span>•</span>
              <span>
                {isCashMatched ? (
                  <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? '✅ হিসাব মিলেছে' : '✅ Cash Matched'}</span>
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `⚠️ ${formatCurrency(Math.abs(cashDiff), language)} ${cashDiff < 0 ? 'ঘাটতি' : 'বাড়তি'}`
                        : `⚠️ ${formatCurrency(Math.abs(cashDiff), language)} difference`}
                    </span>
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {!daySession?.isStarted && (
              <button
                onClick={onStartDay}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95 whitespace-nowrap"
              >
                <Sun className="w-4 h-4" />
                <span>{t.startDay}</span>
              </button>
            )}

            {!activeOutsideSession?.isActive && !daySession?.isClosed && (
              <button
                onClick={onGoOutside}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95 whitespace-nowrap"
              >
                <Footprints className="w-4 h-4" />
                <span>{language === 'bn' ? 'বাইরে বের হলাম (New Trip)' : 'Leave Home'}</span>
              </button>
            )}

            {activeOutsideSession?.isActive && (
              <button
                onClick={onReturnHome}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95 whitespace-nowrap"
              >
                <Home className="w-4 h-4" />
                <span>{t.returnHome}</span>
              </button>
            )}

            <button
              onClick={onOpenDenomination}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 text-xs font-semibold transition active:scale-95 whitespace-nowrap"
              title={t.cashDenomination}
            >
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'নোট কাউন্টার' : 'Note Counter'}</span>
            </button>

            {daySession?.isStarted && !daySession?.isClosed && !activeOutsideSession?.isActive && (
              <button
                onClick={onCloseDay}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition active:scale-95 whitespace-nowrap"
              >
                <Moon className="w-4 h-4" />
                <span>{t.closeDay}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Live Outside Session Card (if user is currently out) */}
      {activeOutsideSession?.isActive && (
        <OutsideActiveCard
          session={activeOutsideSession}
          transactions={transactions}
          onOpenQuickExpense={onOpenQuickExpense}
          onOpenQuickIncome={onOpenQuickIncome}
          onOpenTransfer={onOpenTransfer}
          onReturnHome={onReturnHome}
          language={language}
        />
      )}

      {/* 3. Today's Key Aggregates Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 sm:p-4">
          <span className="text-[11px] font-medium text-emerald-400 block">{t.todayIncome}</span>
          <p className="text-lg sm:text-xl font-bold text-emerald-400 font-num mt-1">
            {formatCurrency(todayIncome, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 sm:p-4">
          <span className="text-[11px] font-medium text-rose-400 block">{t.todayExpense}</span>
          <p className="text-lg sm:text-xl font-bold text-rose-400 font-num mt-1">
            {formatCurrency(todayExpense, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 sm:p-4">
          <span className="text-[11px] font-medium text-blue-400 block">{t.todaySavings}</span>
          <p className="text-lg sm:text-xl font-bold text-blue-400 font-num mt-1">
            {formatCurrency(todaySavings, language)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-400 block">{t.todayNetFlow}</span>
          <p className={`text-lg sm:text-xl font-bold font-num mt-1 ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(netCashFlow, language)}
          </p>
        </div>
      </div>

      {/* 4. Multiple Journeys of Today */}
      {todayOutsideSessions.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                {language === 'bn' ? 'আজকের সকল বাইরের যাত্রা (Journeys)' : "Today's Trips & Journeys"}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-num">
              {todayOutsideSessions.length} {language === 'bn' ? 'টি যাত্রা' : 'trips'}
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {todayOutsideSessions.map((s, idx) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                      s.isActive
                        ? 'bg-blue-600 text-white'
                        : s.reconciliationStatus === 'matched'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {s.destination} {s.isActive && `(${language === 'bn' ? 'চলমান' : 'LIVE'})`}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {s.startTime} {s.endTime ? `→ ${s.endTime}` : ''} • {s.purpose}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-white font-num">
                    {formatCurrency(s.cashTaken, language)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {s.reconciliationStatus === 'matched'
                      ? '✅ মিলেছে'
                      : s.reconciliationStatus === 'short'
                      ? '⚠️ ঘাটতি'
                      : s.reconciliationStatus === 'extra'
                      ? '⚠️ বাড়তি'
                      : 'বাইরে আছেন'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Chronological Today's Timeline (Section 25 of Master Prompt) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {t.timeline}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-num">
            {todayStr}
          </span>
        </div>

        {timelineEvents.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            <Calendar className="w-8 h-8 mx-auto text-slate-700 mb-2 opacity-50" />
            <p>{language === 'bn' ? 'আজকের কোনো টাইমলাইন ইভেন্ট রেকর্ড হয়নি।' : 'No timeline events recorded yet today.'}</p>
            <p className="text-slate-400 mt-1">
              {language === 'bn'
                ? 'দিনের হিসাব শুরু করুন বা খরচ ও আয় যোগ করুন।'
                : 'Start your day or record expenses to view timeline.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {timelineEvents.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="relative flex items-start gap-3 group">
                  {/* Timeline Node Icon */}
                  <div
                    className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border-2 border-slate-700 text-white"
                    style={{ borderColor: event.color }}
                  >
                    <Icon className="w-2.5 h-2.5" style={{ color: event.color }} />
                  </div>

                  <div className="flex-1 rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 font-num">
                          {event.time}
                        </span>
                        <h4 className="font-semibold text-white truncate">{event.title}</h4>
                      </div>
                      {event.subtitle && (
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {event.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {event.receiptImage && (
                        <button
                          onClick={() => onViewReceipt(event.receiptImage!, event.title)}
                          className="p-1 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {event.amount !== undefined && (
                        <span
                          className={`font-black font-num text-xs sm:text-sm ${
                            event.isExpense
                              ? 'text-rose-400'
                              : event.isIncome
                              ? 'text-emerald-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {event.isExpense ? '-' : event.isIncome ? '+' : ''}
                          {formatCurrency(event.amount, language)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
