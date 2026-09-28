import React from 'react';
import { Bell, X, Check, Clock, AlertTriangle, Calendar, Info, CheckCheck } from 'lucide-react';
import { Language, NotificationItem } from '../../types';
import { translations } from '../../i18n/translations';

interface NotificationModalProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: string) => void;
  onClose: () => void;
  language: Language;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  onClose,
  language,
}) => {
  const t = translations[language];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'budget':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'reminder':
      case 'due':
        return <Calendar className="w-4 h-4 text-rose-400" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.notifications}</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'বিল, বাজেট ও দৈনিক রিমাইন্ডারসমূহ' : 'Bills, budget alerts & daily updates'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-end pt-2 pb-1">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t.markAllRead}</span>
            </button>
          </div>
        )}

        {/* List */}
        <div className="mt-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <Bell className="w-8 h-8 mx-auto text-slate-700 mb-2 opacity-50" />
              <p>{t.noNotifications}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) onMarkRead(n.id);
                  if (n.linkTab) {
                    onNavigate(n.linkTab);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  n.isRead
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/40'
                    : 'bg-slate-800/60 border-slate-700 text-white hover:border-emerald-500/40'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 font-num shrink-0">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
