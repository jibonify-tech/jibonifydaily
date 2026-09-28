import React, { useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle, Clock, X, CheckCircle } from 'lucide-react';
import { AdminUser, PlatformUser } from '../../types';
import { adminDb } from '../../services/adminStorage';
import { db } from '../../services/storage';
import { auditService } from '../../services/auditService';

interface AdminPrivacyModalProps {
  isOpen: boolean;
  user: PlatformUser | null;
  admin: AdminUser;
  onClose: () => void;
  onSessionGranted: () => void;
  language: 'bn' | 'en';
}

export const AdminPrivacyModal: React.FC<AdminPrivacyModalProps> = ({
  isOpen,
  user,
  admin,
  onClose,
  onSessionGranted,
  language,
}) => {
  const [reason, setReason] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [duration, setDuration] = useState(15);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(language === 'bn' ? 'অ্যাক্সেসের সুনির্দিষ্ট কারণ লিখুন' : 'Please state a valid audit reason');
      return;
    }
    if (!confirmed) {
      setError(language === 'bn' ? 'নীতিমালা সম্মতি নিশ্চিত করুন' : 'Confirm policy compliance checkbox');
      return;
    }

    // Create time-limited session
    adminDb.startPrivilegedSession(admin, user, reason, ticketId || undefined, duration);

    // Write immutable audit log
    auditService.logAction({
      action: 'PRIVILEGED_SUPPORT_ACCESS_GRANTED',
      category: 'privacy',
      severity: 'critical',
      targetEntity: {
        type: 'user',
        id: user.id,
        name: `${user.name} (${user.email})`,
      },
      details: `Super Admin ${admin.name} (${admin.email}) requested emergency access to user ${user.name} (${user.id}). Reason: "${reason}". Duration: ${duration}m. Ticket: ${ticketId || 'N/A'}.`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      metadata: {
        durationMinutes: duration,
        ticketId: ticketId || undefined,
        reason,
      },
      status: 'success',
    });

    onSessionGranted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-rose-500/50 p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{language === 'bn' ? 'ব্যবহারকারী প্রাইভেসি শিল্ড প্রটোকল' : 'Privileged Privacy Access'}</span>
              <span className="rounded bg-rose-950 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-[10px] uppercase font-bold">
                Restricted
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Target: <strong className="text-white">{user.name}</strong> ({user.email})
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200/90 mb-4 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            {language === 'bn'
              ? 'আইনগত ও গোপনীয়তা নীতি অনুযায়ী সাধারণ অবস্থায় ব্যবহারকারীর ব্যক্তিগত আয়, ব্যয় বা ডায়েরি দেখা নিষিদ্ধ। কেবল অনুমোদিত সাপোর্ট টিকিটের তদন্তের জন্য নির্দিষ্ট সময়ের অ্যাক্সেস দেওয়া যাবে।'
              : 'By policy, private user financials & diaries are strictly isolated. Privileged temporary viewing requires an active support authorization and records an immutable audit log.'}
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-rose-950 border border-rose-500/40 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'bn' ? 'অ্যাক্সেসের সুনির্দিষ্ট কারণ (Mandatory Audit Reason)' : 'Official Support Reason'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. User requested investigation into duplicate bKash charge transaction error"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'bn' ? 'সাপোর্ট টিকিট আইডি (ঐচ্ছিক)' : 'Support Ticket # (Optional)'}
              </label>
              <input
                type="text"
                placeholder="TKT-2026-8812"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'bn' ? 'মেয়াদ (মিনিট)' : 'Time Limit'}</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes (Default)</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (Max)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-0"
              />
              <span>
                {language === 'bn'
                  ? 'আমি স্বীকার করছি যে এই অ্যাক্সেস সম্পূর্ণ লগ হবে এবং অপব্যবহার কঠোরভাবে দণ্ডনীয়।'
                  : 'I certify that this privileged access is strictly for official customer support and will be audited.'}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'অস্থায়ী অনুমতি দিন' : 'Authorize Temporary Access'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
