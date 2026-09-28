import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  UserCheck,
  UserX,
  Clock,
  Smartphone,
  Eye,
  Edit3,
  Trash2,
  Lock,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  X,
  CreditCard,
  Send,
  Plus,
} from 'lucide-react';
import { AdminUser, PlatformUser } from '../../types';
import { adminDb } from '../../services/adminStorage';
import { db } from '../../services/storage';
import { auditService } from '../../services/auditService';

interface AdminUsersTabProps {
  admin: AdminUser;
  language: 'bn' | 'en';
  onRequestPrivilegedAccess: (user: PlatformUser) => void;
  onRefresh: () => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  admin,
  language,
  onRequestPrivilegedAccess,
  onRefresh,
}) => {
  const [users, setUsers] = useState<PlatformUser[]>(adminDb.getPlatformUsers());
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [newNote, setNewNote] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const refreshList = () => {
    const list = adminDb.getPlatformUsers();
    setUsers(list);
    if (selectedUser) {
      const updated = list.find((u) => u.id === selectedUser.id);
      if (updated) setSelectedUser(updated);
    }
    onRefresh();
  };

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleUpdateStatus = (user: PlatformUser, newStatus: 'active' | 'suspended' | 'deactivated') => {
    const actionLabel = newStatus === 'active' ? 'Activate' : newStatus === 'suspended' ? 'Suspend' : 'Deactivate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} user "${user.name}"?`)) return;

    const previousStatus = user.status;
    const updated: PlatformUser = { ...user, status: newStatus };
    adminDb.updatePlatformUser(updated);

    auditService.logAction({
      action: newStatus === 'suspended' ? 'USER_SUSPENDED' : `USER_${newStatus.toUpperCase()}`,
      category: 'user',
      severity: newStatus === 'suspended' ? 'critical' : 'warning',
      targetEntity: {
        type: 'user',
        id: user.id,
        name: `${user.name} (${user.email})`,
      },
      changes: {
        field: 'status',
        previousValue: previousStatus,
        newValue: newStatus,
      },
      details: `Admin ${admin.name} (${admin.role}) changed user "${user.name}" status from "${previousStatus}" to "${newStatus}".`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    showToast(`User status updated to ${newStatus}`);
    refreshList();
  };

  const handleExtendTrial = (user: PlatformUser) => {
    const days = 7;
    const currentEnd = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : Date.now();
    const newEnd = new Date(currentEnd + days * 86400000).toISOString();
    const updated: PlatformUser = {
      ...user,
      subscriptionStatus: 'trial',
      trialEndsAt: newEnd,
    };
    adminDb.updatePlatformUser(updated);

    auditService.logAction({
      action: 'TRIAL_EXTENDED',
      category: 'subscription',
      severity: 'warning',
      targetEntity: {
        type: 'user',
        id: user.id,
        name: `${user.name} (${user.email})`,
      },
      changes: {
        field: 'trialEndsAt',
        previousValue: user.trialEndsAt || 'none',
        newValue: newEnd,
      },
      details: `Admin ${admin.name} extended 7 trial days for ${user.name}. New expiry: ${new Date(newEnd).toLocaleDateString()}`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    showToast('Extended 7 trial days successfully');
    refreshList();
  };

  const handleChangePlan = (user: PlatformUser, newPlan: PlatformUser['plan']) => {
    const previousPlan = user.plan;
    const updated: PlatformUser = {
      ...user,
      plan: newPlan,
      subscriptionStatus: newPlan === 'free' ? 'expired' : 'active',
      subscriptionEndsAt:
        newPlan === 'free'
          ? undefined
          : new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    adminDb.updatePlatformUser(updated);

    auditService.logAction({
      action: 'USER_PLAN_CHANGED',
      category: 'subscription',
      severity: 'warning',
      targetEntity: {
        type: 'user',
        id: user.id,
        name: `${user.name} (${user.email})`,
      },
      changes: {
        field: 'plan',
        previousValue: previousPlan,
        newValue: newPlan,
      },
      details: `Admin ${admin.name} switched subscription plan for user "${user.name}" from "${previousPlan}" to "${newPlan}".`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    showToast(`Switched plan to ${newPlan}`);
    refreshList();
  };

  const handleResetPassword = (user: PlatformUser) => {
    if (window.confirm(`Send secure one-time password reset link to ${user.email}?`)) {
      auditService.logAction({
        action: 'PASSWORD_RESET_DISPATCHED',
        category: 'auth',
        severity: 'warning',
        targetEntity: {
          type: 'user',
          id: user.id,
          name: `${user.name} (${user.email})`,
        },
        details: `Admin ${admin.name} initiated secure password reset workflow for ${user.email}.`,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        status: 'success',
      });
      showToast(`Password reset link dispatched to ${user.email}`);
    }
  };

  const handleForceLogout = (user: PlatformUser) => {
    if (window.confirm(`Force terminate all active device sessions for ${user.name}?`)) {
      const updated: PlatformUser = { ...user, deviceCount: 0 };
      adminDb.updatePlatformUser(updated);

      auditService.logAction({
        action: 'FORCE_LOGOUT_ALL_DEVICES',
        category: 'security',
        severity: 'warning',
        targetEntity: {
          type: 'user',
          id: user.id,
          name: `${user.name} (${user.email})`,
        },
        details: `Admin ${admin.name} revoked all active device sessions for user ${user.name}.`,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        status: 'success',
      });

      showToast('All user device sessions revoked successfully');
      refreshList();
    }
  };

  const handleAddNote = (user: PlatformUser) => {
    if (!newNote.trim()) return;
    const currentNotes = user.notes || [];
    const formatted = `[${new Date().toLocaleDateString()} - ${admin.name}]: ${newNote.trim()}`;
    const updated: PlatformUser = {
      ...user,
      notes: [formatted, ...currentNotes],
    };
    adminDb.updatePlatformUser(updated);

    auditService.logAction({
      action: 'INTERNAL_SUPPORT_NOTE_ADDED',
      category: 'user',
      severity: 'info',
      targetEntity: {
        type: 'user',
        id: user.id,
        name: user.name,
      },
      details: `Admin ${admin.name} added internal support note to ${user.name}: "${newNote.trim().substring(0, 60)}..."`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      status: 'success',
    });

    setNewNote('');
    showToast('Internal support note saved');
    refreshList();
  };

  const handleDeleteUser = (user: PlatformUser) => {
    const confirmName = prompt(
      `DANGER: To delete user "${user.name}" permanently according to GDPR/data policy, type their user ID (${user.id}):`
    );
    if (confirmName === user.id) {
      adminDb.deletePlatformUser(user.id);

      auditService.logAction({
        action: 'USER_ACCOUNT_PURGED',
        category: 'user',
        severity: 'critical',
        targetEntity: {
          type: 'user',
          id: user.id,
          name: `${user.name} (${user.email})`,
        },
        details: `Admin ${admin.name} (${admin.role}) permanently deleted user account ${user.name} (${user.id}) in accordance with platform data-retention policy.`,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        status: 'success',
      });

      setSelectedUser(null);
      showToast('User account purged permanently');
      refreshList();
    }
  };

  const activePrivilege = selectedUser ? adminDb.getActivePrivilegedSession(selectedUser.id) : null;

  return (
    <div className="space-y-4">
      {statusNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-3 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'নাম, ইমেইল, ফোন অথবা আইডি দিয়ে খুঁজুন...' : 'Search by name, email, phone, ID...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
          >
            <option value="all">{language === 'bn' ? 'সকল প্ল্যান' : 'All Plans'}</option>
            <option value="free">Free Starter</option>
            <option value="pro_monthly">Pro Monthly</option>
            <option value="pro_yearly">Pro Yearly</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
          >
            <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>

          <button
            onClick={refreshList}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{language === 'bn' ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'প্ল্যান' : 'Plan'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'ডিভাইস' : 'Devices'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'সর্বশেষ সক্রিয়' : 'Last Active'}</th>
                <th className="px-4 py-3 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No platform users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-indigo-950/70 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                        {u.plan.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : u.status === 'suspended'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.deviceCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-num text-[11px]">
                      {new Date(u.lastActive).toLocaleDateString()} {new Date(u.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="rounded-xl bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/40 text-indigo-300 px-3 py-1.5 font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected User Detail Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-lg text-white">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedUser.name}</span>
                    <span className="text-xs font-mono text-slate-400">({selectedUser.id})</span>
                  </h3>
                  <p className="text-xs text-slate-400">{selectedUser.email} · {selectedUser.phone || 'No phone'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy Shield Banner */}
            <div className={`p-4 rounded-xl border ${activePrivilege ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' : 'bg-slate-950/80 border-slate-800 text-slate-300'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className={`w-5 h-5 ${activePrivilege ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {activePrivilege
                        ? `Privileged Support Access Active (Expires: ${new Date(activePrivilege.expiresAt).toLocaleTimeString()})`
                        : 'User Financial Privacy Shield Active'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {activePrivilege
                        ? `Authorized reason: "${activePrivilege.reason}"`
                        : 'Private personal transactions, income & life diaries are isolated.'}
                    </p>
                  </div>
                </div>

                {activePrivilege ? (
                  <button
                    onClick={() => {
                      adminDb.endPrivilegedSession(activePrivilege.id);
                      db.addAuditLog('PRIVILEGED_ACCESS_REVOKED', 'auth', `Admin ${admin.name} voluntarily revoked privileged session for ${selectedUser.name}.`, admin.name);
                      showToast('Privileged session ended');
                      refreshList();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    End Access Now
                  </button>
                ) : (
                  <button
                    onClick={() => onRequestPrivilegedAccess(selectedUser)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                  >
                    Request Support Access
                  </button>
                )}
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Plan</span>
                <p className="text-xs font-bold text-indigo-400 capitalize mt-0.5">{selectedUser.plan.replace('_', ' ')}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Account Status</span>
                <p className="text-xs font-bold text-white capitalize mt-0.5">{selectedUser.status}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Storage Used</span>
                <p className="text-xs font-bold text-white font-num mt-0.5">{selectedUser.storageUsedKB} KB</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">App Version</span>
                <p className="text-xs font-bold text-emerald-400 font-num mt-0.5">v{selectedUser.appVersion}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Administrative Actions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedUser, 'suspended')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs font-bold hover:bg-rose-900/60 transition"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend User</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedUser, 'active')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-900/60 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Activate User</span>
                  </button>
                )}

                <button
                  onClick={() => handleExtendTrial(selectedUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Extend Trial (+7d)</span>
                </button>

                <button
                  onClick={() => handleResetPassword(selectedUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Reset Password</span>
                </button>

                <button
                  onClick={() => handleForceLogout(selectedUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  <span>Force Device Logout</span>
                </button>

                <button
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-400 hover:bg-rose-900/80 text-xs font-bold transition ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge User</span>
                </button>
              </div>
            </div>

            {/* Plan Switcher */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">Modify Subscription Plan</label>
              <div className="flex flex-wrap gap-2">
                {(['free', 'pro_monthly', 'pro_yearly', 'enterprise'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleChangePlan(selectedUser, p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedUser.plan === p
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Internal Support Notes (Staff-Only)</span>
              </h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add private staff note regarding this user..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
                <button
                  onClick={() => handleAddNote(selectedUser)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Save Note
                </button>
              </div>

              {selectedUser.notes && selectedUser.notes.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                  {selectedUser.notes.map((n, idx) => (
                    <p key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      {n}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
