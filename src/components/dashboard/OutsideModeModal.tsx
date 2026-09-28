import React, { useState } from 'react';
import { Footprints, Clock, MapPin, Briefcase, Car, Wallet, X, Check } from 'lucide-react';
import { Language, OutsideSession } from '../../types';
import { translations } from '../../i18n/translations';

interface OutsideModeModalProps {
  onConfirm: (session: Omit<OutsideSession, 'id'>) => void;
  onClose: () => void;
  language: Language;
  defaultPocketCash: number;
}

export const OutsideModeModal: React.FC<OutsideModeModalProps> = ({
  onConfirm,
  onClose,
  language,
  defaultPocketCash,
}) => {
  const t = translations[language];
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [startTime, setStartTime] = useState(currentTime);
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [transportType, setTransportType] = useState('মেট্রোরেল / রিকশা');
  const [cashTaken, setCashTaken] = useState(defaultPocketCash.toString());
  const [additionalCashTaken, setAdditionalCashTaken] = useState('');
  const [notes, setNotes] = useState('');

  const transportOptionsBn = ['রিকশা', 'বাস', 'মেট্রোরেল', 'উবার / পাঠাও', 'সিএনজি', 'হাঁটা', 'নিজের বাইক / গাড়ি', 'অন্যান্য'];
  const transportOptionsEn = ['Rickshaw', 'Bus', 'Metro Rail', 'Uber / Pathao', 'CNG Auto', 'Walking', 'Own Bike / Car', 'Other'];
  const currentOptions = language === 'bn' ? transportOptionsBn : transportOptionsEn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      date: todayStr,
      startTime,
      isActive: true,
      destination: destination || (language === 'bn' ? 'সাধারণ গন্তব্য' : 'General destination'),
      purpose: purpose || (language === 'bn' ? 'দৈনন্দিন কাজ' : 'Daily work'),
      transportType,
      cashTaken: parseFloat(cashTaken) || 0,
      additionalCashTaken: parseFloat(additionalCashTaken) || 0,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'bn' ? 'বাইরে বের হলাম (Outside Mode)' : 'Starting Outside Journey'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'কত টাকা সাথে নিয়ে বের হচ্ছেন ও কোথায় যাচ্ছেন তা লিখে রাখুন' : 'Log destination, purpose and cash carried'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'bn' ? 'বের হওয়ার সময়' : 'Departure Time'}</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.destination}</span>
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: কারওয়ান বাজার অফিস, বসুন্ধরা সিটি, ধানমন্ডি' : 'e.g. Office, Market, Dhanmondi'}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.purpose}</span>
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: অফিস কাজ, ক্লায়েন্ট মিটিং, বাজার করা, ডাক্তার দেখানো' : 'e.g. Work, groceries, meeting'}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Transport Type Segmented buttons */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.transportType}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currentOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setTransportType(opt)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    transportType === opt
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Taken Outside */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পকেটে নিয়ে বের হচ্ছেন (নগদ ক্যাশ):' : 'Cash Carried in Pocket:'}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-num">৳</span>
                <input
                  type="number"
                  step="any"
                  value={cashTaken}
                  onChange={(e) => setCashTaken(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-8 pr-3 py-2 text-sm sm:text-base font-bold font-num text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'অতিরিক্ত টাকা নিলে (এটিএম বা ড্রয়ার থেকে)' : 'Additional cash taken (ATM/Drawer):'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-num">৳</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={additionalCashTaken}
                  onChange={(e) => setAdditionalCashTaken(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-8 pr-3 py-2 text-xs sm:text-sm font-num text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.notes}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'অন্য কোনো জরুরি নোট' : 'Any extra details'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-950/50 hover:bg-blue-500 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'bn' ? 'জার্নি শুরু করুন' : 'Start Outside Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
