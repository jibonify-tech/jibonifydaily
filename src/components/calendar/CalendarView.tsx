import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Receipt, BookOpen } from 'lucide-react';
import { Account, Category, DailyClosing, DiaryEntry, Language, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface CalendarViewProps {
  transactions: Transaction[];
  dailyClosings: DailyClosing[];
  diaries: DiaryEntry[];
  categories: Category[];
  accounts: Account[];
  language: Language;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  dailyClosings,
  diaries,
  categories,
  accounts,
  language,
}) => {
  const t = translations[language];

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeekBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const daysOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthTitle = language === 'bn' ? monthNamesBn[currentMonth] : monthNamesEn[currentMonth];
  const daysOfWeek = language === 'bn' ? daysOfWeekBn : daysOfWeekEn;

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar math
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map transactions by date YYYY-MM-DD
  const dateTotalsMap: Record<string, { income: number; expense: number; net: number }> = {};
  transactions
    .filter((tx) => !tx.isDeleted)
    .forEach((tx) => {
      if (!dateTotalsMap[tx.date]) {
        dateTotalsMap[tx.date] = { income: 0, expense: 0, net: 0 };
      }
      if (tx.type === 'expense') {
        dateTotalsMap[tx.date].expense += Number(tx.amount);
      } else if (tx.type === 'income' || tx.type === 'repayment_received') {
        dateTotalsMap[tx.date].income += Number(tx.amount);
      }
      dateTotalsMap[tx.date].net = dateTotalsMap[tx.date].income - dateTotalsMap[tx.date].expense;
    });

  const selectedDateTxs = selectedDate
    ? transactions.filter((t) => !t.isDeleted && t.date === selectedDate)
    : [];

  const selectedClosing = selectedDate
    ? dailyClosings.find((c) => c.date === selectedDate)
    : undefined;

  const selectedDiary = selectedDate
    ? diaries.find((d) => d.date === selectedDate)
    : undefined;

  return (
    <div className="space-y-4 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            <span>{t.calendar}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'প্রতিদিনের আয়, ব্যয় ও নিট স্থিতির ক্যালেন্ডার ভিউ' : 'Monthly financial overview by calendar days'}
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white min-w-[130px] text-center">
            {monthTitle} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg p-3 sm:p-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 pb-2 border-b border-slate-800">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 sm:h-24 rounded-xl bg-slate-950/20" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const stats = dateTotalsMap[dateStr];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`h-12 sm:h-24 rounded-xl p-1 sm:p-2 text-left transition flex flex-col justify-between border ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-sm'
                    : isToday
                    ? 'border-blue-500/50 bg-blue-950/20'
                    : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[11px] sm:text-xs font-bold font-num ${
                      isToday
                        ? 'text-blue-400 underline underline-offset-2'
                        : isSelected
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {stats && stats.expense > 0 && (
                    <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                  )}
                </div>

                {stats ? (
                  <>
                    {/* Mobile compact indicators */}
                    <div className="flex sm:hidden items-center justify-center gap-1 w-full pb-0.5">
                      {stats.income > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                      {stats.expense > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      )}
                    </div>

                    {/* Tablet/Desktop full values */}
                    <div className="hidden sm:block space-y-0.5 text-[11px] font-num leading-tight overflow-hidden">
                      {stats.income > 0 && (
                        <p className="text-emerald-400 truncate">
                          +{formatCurrency(stats.income, language)}
                        </p>
                      )}
                      {stats.expense > 0 && (
                        <p className="text-rose-400 truncate">
                          -{formatCurrency(stats.expense, language)}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Drawer / Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-num">
                  {selectedDate} {language === 'bn' ? 'তারিখের হিসাব' : 'Daily Breakdown'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Daily Totals */}
            {dateTotalsMap[selectedDate] && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-800/60 p-2.5">
                  <span className="text-emerald-300">{t.todayIncome}</span>
                  <p className="font-bold font-num text-emerald-400 text-sm mt-0.5">
                    {formatCurrency(dateTotalsMap[selectedDate].income, language)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-800/60 p-2.5">
                  <span className="text-rose-300">{t.todayExpense}</span>
                  <p className="font-bold font-num text-rose-400 text-sm mt-0.5">
                    {formatCurrency(dateTotalsMap[selectedDate].expense, language)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-800/60 p-2.5">
                  <span className="text-blue-300">{t.todayNetFlow}</span>
                  <p className="font-bold font-num text-blue-400 text-sm mt-0.5">
                    {formatCurrency(dateTotalsMap[selectedDate].net, language)}
                  </p>
                </div>
              </div>
            )}

            {/* Diary or Closing notes */}
            {(selectedDiary || selectedClosing) && (
              <div className="rounded-xl bg-slate-950/60 border border-purple-500/30 p-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডায়েরির নোট' : 'Diary Note'}</span>
                </div>
                {selectedDiary?.activities && (
                  <p className="text-slate-300">
                    <strong>{language === 'bn' ? 'কার্যক্রম:' : 'Activities:'}</strong> {selectedDiary.activities}
                  </p>
                )}
                {selectedDiary?.placesVisited && (
                  <p className="text-slate-300">
                    <strong>{language === 'bn' ? 'স্থানসমূহ:' : 'Places:'}</strong> {selectedDiary.placesVisited}
                  </p>
                )}
                {selectedDiary?.financialReflections && (
                  <p className="text-slate-300">
                    <strong>{language === 'bn' ? 'মন্তব্য:' : 'Notes:'}</strong> {selectedDiary.financialReflections}
                  </p>
                )}
              </div>
            )}

            {/* Transactions list on this day */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">
                {language === 'bn' ? 'সেদিনের লেনদেনসমূহ:' : 'Transactions:'}
              </span>
              {selectedDateTxs.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">{language === 'bn' ? 'কোনো লেনদেন নেই।' : 'No transactions recorded.'}</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {selectedDateTxs.map((tx) => {
                    const cat = catMap[tx.categoryId || ''];
                    const acc = accMap[tx.accountId];
                    const isExp = tx.type === 'expense';
                    const isInc = tx.type === 'income' || tx.type === 'repayment_received';

                    return (
                      <div
                        key={tx.id}
                        className="rounded-xl bg-slate-800/60 p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{tx.description}</p>
                          <p className="text-[10px] text-slate-400">
                            {tx.time} • {acc?.name.split(' ')[0]} {cat ? `• ${language === 'bn' ? cat.nameBn : cat.nameEn}` : ''}
                          </p>
                        </div>
                        <span
                          className={`font-bold font-num ${
                            isExp ? 'text-rose-400' : isInc ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {isExp ? '-' : isInc ? '+' : ''}
                          {formatCurrency(tx.amount, language)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
