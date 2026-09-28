import React, { useState } from 'react';
import { User, Mail, Phone, Lock, X, Check, Shield, LogOut, Users } from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { translations } from '../../i18n/translations';

interface AuthModalProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
  language: Language;
  onOpenMultiUserModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  language,
  onOpenMultiUserModal,
}) => {
  const t = translations[language];

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || '');
  const [pinEnabled, setPinEnabled] = useState(profile.pinLockEnabled);
  const [pinCode, setPinCode] = useState(profile.pinCode || '1234');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      email,
      phone,
      pinLockEnabled: pinEnabled,
      pinCode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'ব্যবহারকারী প্রোফাইল ও নিরাপত্তা' : 'User Profile & Security'}
              </h3>
              <p className="text-[11px] text-slate-400">{profile.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {onOpenMultiUserModal && (
          <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  {language === 'bn' ? 'মাল্টি-ইউজার লগইন ও সুইচ' : 'Multi-User Login & Switch'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === 'bn' ? 'ভিন্ন ব্যবহারকারীর অ্যাকাউন্টে প্রবেশ করুন' : 'Log in as another user or switch account'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMultiUserModal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition whitespace-nowrap"
            >
              {language === 'bn' ? 'সুইচ' : 'Switch'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-9 pr-3 py-2 text-xs font-num text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.pinLock}</span>
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {language === 'bn' ? 'অ্যাপ সুরক্ষায় ৪-সংখ্যার পিন' : '4-digit app passcode'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={pinEnabled}
                onChange={(e) => setPinEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
              />
            </div>

            {pinEnabled && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? '৪-সংখ্যার পিন কোড' : '4-digit PIN'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-32 rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-center font-bold tracking-widest text-emerald-400 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
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
  );
};
