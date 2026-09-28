import React, { useState } from 'react';
import {
  Server,
  Activity,
  AlertTriangle,
  Smartphone,
  Shield,
  UserPlus,
  RefreshCw,
  CheckCircle,
  HardDrive,
  Layers,
  Wrench,
  Clock,
} from 'lucide-react';
import {
  AdminRole,
  AdminUser,
  AppReleaseVersion,
  GlobalPlatformConfig,
  SystemErrorLog,
} from '../../types';
import { ALL_ADMIN_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, adminDb } from '../../services/adminStorage';
import { db } from '../../services/storage';
import { auditService } from '../../services/auditService';

interface AdminSystemTabProps {
  admin: AdminUser;
  language: 'bn' | 'en';
  onRefresh: () => void;
}

export const AdminSystemTab: React.FC<AdminSystemTabProps> = ({
  admin,
  language,
  onRefresh,
}) => {
  const [errorLogs, setErrorLogs] = useState<SystemErrorLog[]>(adminDb.getErrorLogs());
  const [appVersions, setAppVersions] = useState<AppReleaseVersion[]>(adminDb.getAppVersions());
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(adminDb.getAdminUsers());
  const [config, setConfig] = useState<GlobalPlatformConfig>(adminDb.getPlatformConfig());
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // New admin state
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<AdminRole>('support_admin');

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleResolveError = (errorId: string) => {
    const updated = errorLogs.map((e) =>
      e.id === errorId ? { ...e, status: 'resolved' as const } : e
    );
    adminDb.saveErrorLogs(updated);
    setErrorLogs(updated);

    auditService.logAction({
      action: 'SYSTEM_ERROR_RESOLVED',
      category: 'system',
      severity: 'info',
      targetEntity: {
        type: 'system',
        id: errorId,
        name: `Diagnostic Error ${errorId}`,
      },
      details: `Admin ${admin.name} marked error incident ${errorId} as resolved.`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    showToast('Error marked as resolved');
  };

  const handleToggleMaintenance = () => {
    const previousMode = config.maintenanceMode;
    const updated: GlobalPlatformConfig = {
      ...config,
      maintenanceMode: !config.maintenanceMode,
    };
    adminDb.savePlatformConfig(updated);
    setConfig(updated);

    auditService.logAction({
      action: 'MAINTENANCE_MODE_TOGGLED',
      category: 'settings',
      severity: 'warning',
      targetEntity: {
        type: 'setting',
        id: 'maintenanceMode',
        name: 'Platform Maintenance Mode',
      },
      changes: {
        field: 'maintenanceMode',
        previousValue: previousMode,
        newValue: updated.maintenanceMode,
      },
      details: `Admin ${admin.name} (${admin.role}) toggled system maintenance mode to ${updated.maintenanceMode ? 'ACTIVE' : 'INACTIVE'}.`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    showToast(`Maintenance mode set to ${updated.maintenanceMode ? 'ACTIVE' : 'OFF'}`);
    onRefresh();
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) return;

    const newAdmin: AdminUser = {
      id: `admin_${Date.now()}`,
      name: adminName.trim(),
      email: adminEmail.trim().toLowerCase(),
      role: adminRole,
      permissions: ROLE_DEFAULT_PERMISSIONS[adminRole] || [],
      isActive: true,
      twoFactorEnabled: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const list = [...adminUsers, newAdmin];
    adminDb.saveAdminUsers(list);
    setAdminUsers(list);

    auditService.logAction({
      action: 'ADMIN_STAFF_ONBOARDED',
      category: 'security',
      severity: 'critical',
      targetEntity: {
        type: 'user',
        id: newAdmin.id,
        name: `${newAdmin.name} (${newAdmin.email})`,
      },
      details: `Super Admin ${admin.name} assigned ${adminRole} administrative credentials to ${adminName} (${adminEmail}).`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    setAdminName('');
    setAdminEmail('');
    setShowNewAdminModal(false);
    showToast('Admin staff user onboarded successfully');
  };

  return (
    <div className="space-y-6">
      {statusNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-3 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Live Service Health Cluster */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Real-time System Health &amp; Subsystems</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">API Latency</span>
            <p className="text-lg font-black text-emerald-400 font-num mt-1">18 ms</p>
            <p className="text-[10px] text-emerald-300 mt-0.5">99.98% Uptime</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">DB Response</span>
            <p className="text-lg font-black text-white font-num mt-1">4 ms</p>
            <p className="text-[10px] text-slate-400 mt-0.5">LocalStorage Driver</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Sync Queue</span>
            <p className="text-lg font-black text-indigo-400 font-num mt-1">0 pending</p>
            <p className="text-[10px] text-slate-400 mt-0.5">All devices synced</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Error Rate</span>
            <p className="text-lg font-black text-emerald-400 font-num mt-1">0.02%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Well within threshold</p>
          </div>
        </div>
      </div>

      {/* Platform Maintenance Mode Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Scheduled Maintenance Mode</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Display maintenance notice to non-admin users. Admins retain full unrestricted access.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={config.maintenanceMode}
            onChange={handleToggleMaintenance}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
        </label>
      </div>

      {/* Error Monitoring Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Real-time Telemetry &amp; Error Monitoring</span>
        </h3>

        <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 text-xs">
          {errorLogs.map((err) => (
            <div key={err.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      err.severity === 'fatal'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {err.severity}
                  </span>
                  <span className="font-bold text-white">{err.module}</span>
                  <span className="text-[10px] text-slate-500 font-num">
                    {new Date(err.timestamp).toLocaleTimeString()} ({err.platform} v{err.appVersion})
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{err.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    err.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {err.status}
                </span>
                {err.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveError(err.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Staff & RBAC Team Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Admin Staff Team &amp; RBAC Roles</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict role-based permissions matrix for team members.
            </p>
          </div>
          <button
            onClick={() => setShowNewAdminModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Admin</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {adminUsers.map((u) => (
            <div key={u.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{u.name}</h4>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  {u.role.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                <span>2FA: <strong className="text-emerald-400">{u.twoFactorEnabled ? 'Enabled' : 'Disabled'}</strong></span>
                <span>{u.permissions.length} Permissions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Versions Tracker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>Active Client Releases &amp; App Versions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {appVersions.map((v) => (
            <div key={v.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">{v.platform}</span>
                <span className="text-xs font-bold text-emerald-400 font-num">v{v.version}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{v.releaseNotes}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-num">
                <span>Min: v{v.minSupportedVersion}</span>
                <span>{v.releaseDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showNewAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-3">Onboard Admin Staff User</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role &amp; Permissions</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="super_admin">Super Admin (All permissions)</option>
                  <option value="admin">Platform Admin</option>
                  <option value="support_admin">Support Admin (Tickets &amp; Privacy Shield)</option>
                  <option value="finance_admin">Finance Admin (Plans &amp; Payments)</option>
                  <option value="content_admin">Content Admin (Categories &amp; Announcements)</option>
                  <option value="analyst">Analyst (Analytics &amp; Audit Logs)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
                >
                  Add Admin Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
