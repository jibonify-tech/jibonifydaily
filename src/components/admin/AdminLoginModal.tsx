import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, X, Check } from 'lucide-react';
import { AdminUser } from '../../types';
import { adminDb } from '../../services/adminStorage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (admin: AdminUser) => void;
  language: 'bn' | 'en';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
}) => {
  const [email, setEmail] = useState('rupomxc@gmail.com');
  const [password, setPassword] = useState('admin1234');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [step, setStep] = useState<'creds' | '2fa'>('creds');
  const [pendingAdmin, setPendingAdmin] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);

  if (!isOpen) return null;

  const handleCredsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const admins = adminDb.getAdminUsers();
    const found = admins.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.isActive
    );

    if (!found) {
      setError(
        language === 'bn'
          ? 'অ্যাডমিন অ্যাকাউন্ট পাওয়া যায়নি বা স্থগিত রয়েছে।'
          : 'Invalid admin credentials or account inactive.'
      );
      return;
    }

    if (found.twoFactorEnabled) {
      setPendingAdmin(found);
      setStep('2fa');
    } else {
      adminDb.setActiveAdminSession(found);
      onSuccess(found);
      onClose();
    }
  };

  const handle2faSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      setError(
        language === 'bn' ? 'সঠিক ৬-সংখ্যার ২এফএ কোড লিখুন' : 'Enter 6-digit verification code'
      );
      return;
    }
    if (pendingAdmin) {
      adminDb.setActiveAdminSession(pendingAdmin);
      onSuccess(pendingAdmin);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {language === 'bn' ? 'সুপার অ্যাডমিন লগইন' : 'Super Admin Portal'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'সুরক্ষিত আরবিএসি সেশন ও ২এফএ আর্কিটেকচার'
                : 'Secure RBAC session & multi-factor validation'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-950/80 border border-rose-500/40 p-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'creds' ? (
          <form onSubmit={handleCredsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>{language === 'bn' ? 'ডিভাইস মনে রাখুন' : 'Remember this workstation'}</span>
              </label>
              <span className="text-indigo-400 text-[11px]">2FA Guard Ready</span>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{language === 'bn' ? 'লগইন যাচাই করুন' : 'Authenticate Session'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handle2faSubmit} className="space-y-4">
            <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">
                {language === 'bn' ? '২-ধাপ যাচাইকরণ কোড (2FA)' : 'Two-Factor Challenge'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'আপনার অথেন্টিকেটর অ্যাপের ৬-সংখ্যার কোড দিন (পরীক্ষামূলক কোড: 123456)'
                  : 'Enter 6-digit code from authenticator app (Demo: 123456)'}
              </p>
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-sm font-mono tracking-widest text-center text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('creds')}
                className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs text-slate-300 transition"
              >
                {language === 'bn' ? 'ফিরে যান' : 'Back'}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'bn' ? 'প্রবেশ করুন' : 'Confirm 2FA'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
