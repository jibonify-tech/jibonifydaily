import React, { useState } from 'react';
import { BookOpen, Star, Plus, Calendar, MapPin, CheckCircle, X, Check } from 'lucide-react';
import { DiaryEntry, Language, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface DailyDiaryViewProps {
  diaries: DiaryEntry[];
  transactions: Transaction[];
  onSaveDiary: (entry: DiaryEntry) => void;
  language: Language;
}

export const DailyDiaryView: React.FC<DailyDiaryViewProps> = ({
  diaries,
  transactions,
  onSaveDiary,
  language,
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().split('T')[0];

  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState(todayStr);
  const [activities, setActivities] = useState('');
  const [placesVisited, setPlacesVisited] = useState('');
  const [financialReflections, setFinancialReflections] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activities.trim() && !placesVisited.trim() && !financialReflections.trim()) return;

    onSaveDiary({
      id: 'diary_' + date,
      date,
      activities,
      placesVisited,
      financialReflections,
      rating,
      updatedAt: new Date().toISOString(),
    });

    setActivities('');
    setPlacesVisited('');
    setFinancialReflections('');
    setShowAddModal(false);
  };

  const getDayFinancials = (entryDate: string) => {
    const dayTxs = transactions.filter((t) => !t.isDeleted && t.date === entryDate);
    const inc = dayTxs
      .filter((t) => t.type === 'income' || t.type === 'repayment_received')
      .reduce((s, t) => s + Number(t.amount), 0);
    const exp = dayTxs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    return { inc, exp, count: dayTxs.length };
  };

  return (
    <div className="space-y-4 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span>{t.diary}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'সারাদিন কোথায় গেলেন, কি করলেন ও আর্থিক দিনলিপির ব্যক্তিগত ডায়েরি' : 'Life moments, places visited & personal financial journal'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '+ নতুন ডায়েরি নোট' : '+ New Entry'}</span>
        </button>
      </div>

      {diaries.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-slate-400 text-xs">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
          <p className="text-base font-semibold text-slate-300 mb-1">
            {language === 'bn' ? 'কোনো ডায়েরি নোট লেখা হয়নি' : 'No diary entries yet'}
          </p>
          <p className="text-slate-500 mb-3">
            {language === 'bn' ? 'আজকের সারাদিনের অভিজ্ঞতা ও আর্থিক শৃঙ্খলা নিয়ে ডায়েরি লিখুন।' : 'Write about your activities, trips and expenses today.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
          >
            {language === 'bn' ? '+ আজকের ডায়েরি লিখুন' : '+ Write Today\'s Diary'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {diaries.map((d) => {
            const financials = getDayFinancials(d.date);
            return (
              <div
                key={d.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-3 hover:border-purple-500/30 transition"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white font-num">{d.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= d.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {d.activities && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                      {language === 'bn' ? 'সারাদিনের কার্যক্রম:' : 'Activities:'}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {d.activities}
                    </p>
                  </div>
                )}

                {d.placesVisited && (
                  <div className="flex items-start gap-1.5 text-xs text-blue-300 bg-blue-950/20 p-2 rounded-xl border border-blue-500/20">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-blue-400">{language === 'bn' ? 'স্থানসমূহ:' : 'Places:'}</strong> {d.placesVisited}
                    </span>
                  </div>
                )}

                {d.financialReflections && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <span className="text-emerald-400 font-semibold block">
                      {language === 'bn' ? 'আর্থিক মন্তব্য ও শিক্ষা:' : 'Financial Reflections:'}
                    </span>
                    <p className="text-slate-300 italic leading-relaxed">
                      "{d.financialReflections}"
                    </p>
                  </div>
                )}

                {/* Day Financial Snapshot Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 font-num">
                  <div className="flex items-center gap-3">
                    <span>
                      {t.todayIncome}: <strong className="text-emerald-400">+{formatCurrency(financials.inc, language)}</strong>
                    </span>
                    <span>
                      {t.todayExpense}: <strong className="text-rose-400">-{formatCurrency(financials.exp, language)}</strong>
                    </span>
                  </div>
                  <span>{financials.count} {language === 'bn' ? 'টি লেনদেন' : 'transactions'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Diary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'দৈনিক ডায়েরি এন্ট্রি' : 'Daily Diary Entry'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.date}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'আজ কি কি করলেন?' : 'What did you do today?'}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'bn' ? 'সারাদিনের কাজ ও অভিজ্ঞতা...' : 'Daily activities...'}
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'কোথায় গিয়েছিলেন ও কেন?' : 'Where did you go & why?'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'অফিস, বসুন্ধরা শপিং, কাঁচাবাজার...' : 'Locations visited...'}
                  value={placesVisited}
                  onChange={(e) => setPlacesVisited(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'আর্থিক মন্তব্য ও চিন্তা' : 'Financial Reflections'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'bn' ? 'আজকের খরচ কেমন ছিল? কোনো অপব্যয় হয়েছিল কি?' : 'Reflections...'}
                  value={financialReflections}
                  onChange={(e) => setFinancialReflections(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-slate-300">
                  {language === 'bn' ? 'আর্থিক শৃঙ্খলার রেটিং:' : 'Discipline Rating:'}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
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
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
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
