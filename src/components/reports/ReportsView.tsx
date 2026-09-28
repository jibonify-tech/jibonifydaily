import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Download,
} from 'lucide-react';
import { Account, Category, Language, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  language: Language;
}

type Timeframe = 'today' | '7days' | 'this_month' | '30days' | '3months' | 'year' | 'custom';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  categories,
  accounts,
  language,
}) => {
  const t = translations[language];
  const [timeframe, setTimeframe] = useState<Timeframe>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  // Filter transactions based on selected timeframe
  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.isDeleted) return false;
      const txDate = new Date(tx.date);

      if (timeframe === 'today') {
        return tx.date === todayStr;
      }
      if (timeframe === '7days') {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeframe === 'this_month') {
        const curMonthStr = todayStr.slice(0, 7);
        return tx.date.startsWith(curMonthStr);
      }
      if (timeframe === '30days') {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (timeframe === '3months') {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 90;
      }
      if (timeframe === 'year') {
        const curYearStr = todayStr.slice(0, 4);
        return tx.date.startsWith(curYearStr);
      }
      if (timeframe === 'custom') {
        if (customStart && tx.date < customStart) return false;
        if (customEnd && tx.date > customEnd) return false;
        return true;
      }
      return true;
    });
  }, [transactions, timeframe, customStart, customEnd, todayStr, now]);

  // Financial aggregates
  const totalIncome = filteredTxs
    .filter((t) => t.type === 'income' || t.type === 'repayment_received')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpense;

  const expenseTxs = filteredTxs.filter((t) => t.type === 'expense');
  const highestExpense = expenseTxs.length
    ? Math.max(...expenseTxs.map((t) => Number(t.amount)))
    : 0;
  const lowestExpense = expenseTxs.length
    ? Math.min(...expenseTxs.map((t) => Number(t.amount)))
    : 0;

  // Days with transactions in range
  const uniqueDates = Array.from(new Set(expenseTxs.map((t) => t.date)));
  const daysCount = Math.max(1, uniqueDates.length);
  const avgDailyExpense = totalExpense / daysCount;

  // Category breakdown
  const categoryExpenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenseTxs.forEach((t) => {
      const cid = t.categoryId || 'other';
      map[cid] = (map[cid] || 0) + Number(t.amount);
    });

    return Object.entries(map)
      .map(([cid, amt]) => {
        const cat = catMap[cid];
        const name = cat ? (language === 'bn' ? cat.nameBn : cat.nameEn) : cid;
        const color = cat?.color || '#10b981';
        const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
        return { id: cid, name, amount: amt, percentage: pct, color };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTxs, catMap, language, totalExpense]);

  // Daily Chart Data (last 7 or 14 points)
  const dailyChartData = useMemo(() => {
    const datesMap: Record<string, { date: string; income: number; expense: number }> = {};
    filteredTxs.forEach((tx) => {
      if (!datesMap[tx.date]) {
        datesMap[tx.date] = { date: tx.date, income: 0, expense: 0 };
      }
      if (tx.type === 'expense') {
        datesMap[tx.date].expense += Number(tx.amount);
      } else if (tx.type === 'income' || tx.type === 'repayment_received') {
        datesMap[tx.date].income += Number(tx.amount);
      }
    });

    return Object.values(datesMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-10);
  }, [filteredTxs]);

  const maxChartVal = Math.max(
    1,
    ...dailyChartData.flatMap((d) => [d.income, d.expense])
  );

  // Smart Insights Generation
  const smartInsights = useMemo(() => {
    const insights: string[] = [];
    if (categoryExpenseBreakdown.length > 0) {
      const topCat = categoryExpenseBreakdown[0];
      insights.push(
        language === 'bn'
          ? `সবচেয়ে বেশি খরচ হয়েছে ${topCat.name} খাতে (${formatCurrency(topCat.amount, 'bn')} - মোট খরচের ${topCat.percentage}%)।`
          : `Highest spending was in ${topCat.name} (${formatCurrency(topCat.amount, 'en')} - ${topCat.percentage}% of total).`
      );
    }

    if (totalExpense > 0) {
      insights.push(
        language === 'bn'
          ? `এই সময়কালে আপনার দৈনিক গড় খরচ প্রায় ${formatCurrency(Math.round(avgDailyExpense), 'bn')}।`
          : `Your daily average expense is approx ${formatCurrency(Math.round(avgDailyExpense), 'en')}.`
      );
    }

    if (netSavings > 0) {
      insights.push(
        language === 'bn'
          ? `চমৎকার! আপনি এ পর্যন্ত ${formatCurrency(netSavings, 'bn')} সঞ্চয় করতে পেরেছেন।`
          : `Great job! You maintained positive savings of ${formatCurrency(netSavings, 'en')}.`
      );
    } else if (netSavings < 0) {
      insights.push(
        language === 'bn'
          ? `সতর্কতা: খরচের পরিমাণ আয় থেকে ${formatCurrency(Math.abs(netSavings), 'bn')} বেশি হয়েছে।`
          : `Alert: Expenses exceeded income by ${formatCurrency(Math.abs(netSavings), 'en')}.`
      );
    }

    return insights;
  }, [categoryExpenseBreakdown, totalExpense, avgDailyExpense, netSavings, language]);

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>{t.reports}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'আয়, ব্যয়, সঞ্চয় ও খাতের পূর্ণাঙ্গ আর্থিক বিশ্লেষণ' : 'Income, expense, savings & categorical breakdown'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-medium transition self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'bn' ? 'রিপোর্ট প্রিন্ট' : 'Print Report'}</span>
        </button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
        {[
          { id: 'today', labelBn: 'আজ', labelEn: 'Today' },
          { id: '7days', labelBn: 'গত ৭ দিন', labelEn: '7 Days' },
          { id: 'this_month', labelBn: 'চলতি মাস', labelEn: 'This Month' },
          { id: '30days', labelBn: 'গত ৩০ দিন', labelEn: '30 Days' },
          { id: '3months', labelBn: '৩ মাস', labelEn: '3 Months' },
          { id: 'year', labelBn: 'চলতি বছর', labelEn: 'Yearly' },
          { id: 'custom', labelBn: 'কাস্টম রেঞ্জ', labelEn: 'Custom' },
        ].map((tf) => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id as Timeframe)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition ${
              timeframe === tf.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {language === 'bn' ? tf.labelBn : tf.labelEn}
          </button>
        ))}
      </div>

      {timeframe === 'custom' && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex-1 min-w-[130px]">
            <label className="block text-[11px] text-slate-400 mb-1">
              {language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-[11px] text-slate-400 mb-1">
              {language === 'bn' ? 'শেষ তারিখ' : 'End Date'}
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white"
            />
          </div>
        </div>
      )}

      {/* Main Aggregates Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-emerald-300">{t.todayIncome}</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-num mt-1">
            {formatCurrency(totalIncome, language)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-rose-300">{t.todayExpense}</span>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-num mt-1">
            {formatCurrency(totalExpense, language)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-blue-300">{t.todaySavings}</span>
          <p className={`text-xl sm:text-2xl font-black font-num mt-1 ${netSavings >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            {formatCurrency(netSavings, language)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-400">{t.avgDailyExpense}</span>
          <p className="text-xl sm:text-2xl font-black text-slate-200 font-num mt-1">
            {formatCurrency(Math.round(avgDailyExpense), language)}
          </p>
        </div>
      </div>

      {/* Smart Insights Panel */}
      {smartInsights.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>{t.smartInsights}</span>
          </div>
          <div className="space-y-1">
            {smartInsights.map((insight, idx) => (
              <p key={idx} className="text-xs text-emerald-200/90 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{insight}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Responsive Visual SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Daily Cash Flow Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>{language === 'bn' ? 'দৈনিক আয় বনাম ব্যয়ের ট্রেন্ড' : 'Income vs Expense Trend'}</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t.income}
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {t.expense}
              </span>
            </div>
          </div>

          {dailyChartData.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">{language === 'bn' ? 'চার্টের জন্য পর্যাপ্ত ডেটা নেই।' : 'No chart data available.'}</p>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <div className="h-48 flex items-end justify-between gap-1.5 sm:gap-2 pt-4 px-1 min-w-[280px]">
                {dailyChartData.map((d) => {
                  const incHeight = Math.round((d.income / maxChartVal) * 100);
                  const expHeight = Math.round((d.expense / maxChartVal) * 100);

                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        <div
                          className="w-1/2 bg-emerald-500 rounded-t-sm transition-all hover:brightness-125"
                          style={{ height: `${Math.max(4, incHeight)}%` }}
                          title={`${d.date} Income: ৳${d.income}`}
                        />
                        <div
                          className="w-1/2 bg-rose-500 rounded-t-sm transition-all hover:brightness-125"
                          style={{ height: `${Math.max(4, expHeight)}%` }}
                          title={`${d.date} Expense: ৳${d.expense}`}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-2 font-num truncate w-full text-center">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'খাত অনুযায়ী ব্যয়ের অনুপাত' : 'Expense Category Breakdown'}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-num">
              {formatCurrency(totalExpense, language)}
            </span>
          </div>

          {categoryExpenseBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">{language === 'bn' ? 'কোনো ব্যয়ের রেকর্ড নেই।' : 'No expense records.'}</p>
          ) : (
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {categoryExpenseBreakdown.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-num">
                      <span className="text-slate-400">{cat.percentage}%</span>
                      <span className="font-bold text-white">{formatCurrency(cat.amount, language)}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, cat.percentage)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
