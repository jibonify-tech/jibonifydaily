import React, { useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Megaphone,
  Bell,
  Plus,
  Send,
  CheckCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AdminUser, PlatformAnnouncement, PlatformFeatureFlag, PlatformPushNotification } from '../../types';
import { adminDb } from '../../services/adminStorage';
import { db } from '../../services/storage';
import { auditService } from '../../services/auditService';

interface AdminFeaturesTabProps {
  admin: AdminUser;
  language: 'bn' | 'en';
  onRefresh: () => void;
}

export const AdminFeaturesTab: React.FC<AdminFeaturesTabProps> = ({
  admin,
  language,
  onRefresh,
}) => {
  const [flags, setFlags] = useState<PlatformFeatureFlag[]>(adminDb.getFeatureFlags());
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(adminDb.getAnnouncements());
  const [notifications, setNotifications] = useState<PlatformPushNotification[]>(adminDb.getNotifications());
  
  // Announcement form
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<PlatformAnnouncement['type']>('feature');
  const [annAudience, setAnnAudience] = useState<PlatformAnnouncement['audience']>('all');

  // Push notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSegment, setNotifSegment] = useState<PlatformPushNotification['targetSegment']>('all');

  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleToggleFlag = (key: string) => {
    const previousFlag = flags.find((f) => f.key === key);
    const updated = flags.map((f) =>
      f.key === key ? { ...f, isEnabledGlobally: !f.isEnabledGlobally } : f
    );
    adminDb.saveFeatureFlags(updated);
    setFlags(updated);
    const flag = updated.find((f) => f.key === key);

    auditService.logAction({
      action: 'FEATURE_FLAG_TOGGLED',
      category: 'feature',
      severity: 'warning',
      targetEntity: {
        type: 'feature',
        id: key,
        name: flag?.name || key,
      },
      changes: {
        field: 'isEnabledGlobally',
        previousValue: previousFlag?.isEnabledGlobally,
        newValue: flag?.isEnabledGlobally,
      },
      details: `Admin ${admin.name} toggled feature flag "${flag?.name}" to ${flag?.isEnabledGlobally ? 'ENABLED' : 'DISABLED'}.`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    showToast(`Updated feature flag "${flag?.name}"`);
    onRefresh();
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    const newAnn: PlatformAnnouncement = {
      id: `ann_${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType,
      audience: annAudience,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const list = [newAnn, ...announcements];
    adminDb.saveAnnouncements(list);
    setAnnouncements(list);

    auditService.logAction({
      action: 'ANNOUNCEMENT_PUBLISHED',
      category: 'system',
      severity: 'info',
      targetEntity: {
        type: 'system',
        id: newAnn.id,
        name: `Announcement: ${annTitle}`,
      },
      details: `Admin ${admin.name} published global announcement "${annTitle}" targeting "${annAudience}".`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    setAnnTitle('');
    setAnnContent('');
    setShowAnnModal(false);
    showToast('System announcement published successfully');
    onRefresh();
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    const mockDelivered = Math.floor(Math.random() * 500) + 1200;
    const newNotif: PlatformPushNotification = {
      id: `notif_${Date.now()}`,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      targetSegment: notifSegment,
      sentAt: new Date().toISOString(),
      sentCount: mockDelivered + 25,
      deliveredCount: mockDelivered,
      openedCount: Math.floor(mockDelivered * 0.65),
    };

    const list = [newNotif, ...notifications];
    adminDb.saveNotifications(list);
    setNotifications(list);

    auditService.logAction({
      action: 'PUSH_NOTIFICATION_DISPATCHED',
      category: 'system',
      severity: 'info',
      targetEntity: {
        type: 'system',
        id: newNotif.id,
        name: `Notification: ${notifTitle}`,
      },
      details: `Admin ${admin.name} dispatched push notification to segment "${notifSegment}": "${notifTitle}".`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    setNotifTitle('');
    setNotifMessage('');
    showToast('Push notification broadcast queued & sent');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {statusNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-3 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Feature Flags Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ToggleRight className="w-4 h-4 text-indigo-400" />
            <span>Global Feature Flags & Killswitches</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Enable or disable features platform-wide. Changes reflect immediately across all connected clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {flags.map((flag) => (
            <div
              key={flag.key}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition ${
                flag.isEnabledGlobally
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-950/30 border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{flag.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500">({flag.key})</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{flag.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500">Allowed Plans:</span>
                  {flag.allowedPlans.map((p) => (
                    <span key={p} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleToggleFlag(flag.key)}
                className="mt-1 transition active:scale-90"
              >
                {flag.isEnabledGlobally ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements & Push Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* System Announcements */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Broadcast System Announcements</span>
            </h3>
            <button
              onClick={() => setShowAnnModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {announcements.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{a.title}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                    {a.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{a.content}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Audience: {a.audience}</span>
                  <span className="font-num">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notification Center */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <span>Instant Push Notification Dispatcher</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. নতুন ফিচার আপডেট: ক্যাশ ডিনমিনেশন"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Message Body</label>
              <input
                type="text"
                required
                placeholder="Short engaging notification text..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Segment</label>
                <select
                  value={notifSegment}
                  onChange={(e) => setNotifSegment(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="all">All Registered Users</option>
                  <option value="free">Free Tier Only</option>
                  <option value="premium">Premium Subscribed Users</option>
                  <option value="trial">Active Trial Users</option>
                  <option value="inactive">Inactive (&gt;7 days)</option>
                </select>
              </div>

              <button
                type="submit"
                className="self-end px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch</span>
              </button>
            </div>
          </form>

          {/* Past Delivery Records */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Recent Dispatches &amp; CTR</span>
            {notifications.slice(0, 2).map((n) => (
              <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white text-xs">{n.title}</p>
                  <p className="text-[10px] text-slate-400">Sent: {n.sentCount} · Opened: {n.openedCount} ({Math.round((n.openedCount/n.sentCount)*100)}% CTR)</p>
                </div>
                <span className="text-[10px] text-slate-500 font-num">{new Date(n.sentAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-3">Compose Platform Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content</label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="feature">Feature Update</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="important">Important Notice</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Audience</label>
                  <select
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free Only</option>
                    <option value="premium">Premium Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
