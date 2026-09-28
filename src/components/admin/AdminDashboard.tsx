import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Database,
  Layers,
  Activity,
  Trash2,
  RefreshCw,
  Plus,
  Edit2,
  CheckCircle,
  AlertTriangle,
  FileCode,
  HardDrive,
  Users,
  Lock,
  Search,
  Copy,
  Check,
  Tag,
  Wrench,
  Cpu,
  BarChart2,
  Server,
  Zap,
  CreditCard,
  LifeBuoy,
  Megaphone,
  LogOut,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import {
  Account,
  AdminRole,
  AdminUser,
  AppSettings,
  Category,
  Language,
  PlatformUser,
  SystemAuditLog,
  Transaction,
  UserProfile,
} from '../../types';
import { db } from '../../services/storage';
import { adminDb } from '../../services/adminStorage';
import { auditService } from '../../services/auditService';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminSubscriptionsTab } from './AdminSubscriptionsTab';
import { AdminSupportTab } from './AdminSupportTab';
import { AdminFeaturesTab } from './AdminFeaturesTab';
import { AdminSystemTab } from './AdminSystemTab';
import { AdminAuditTab } from './AdminAuditTab';
import { AdminLoginModal } from './AdminLoginModal';
import { AdminPrivacyModal } from './AdminPrivacyModal';

interface AdminDashboardProps {
  profile: UserProfile;
  settings: AppSettings;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  language: Language;
  onRefreshAll: () => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenSettings: () => void;
  onExitAdmin?: () => void;
}

type SuperAdminTab =
  | 'overview'
  | 'users'
  | 'subscriptions'
  | 'support'
  | 'features'
  | 'system'
  | 'categories'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profile,
  settings,
  categories,
  accounts,
  transactions,
  language,
  onRefreshAll,
  onUpdateSettings,
  onOpenSettings,
  onExitAdmin,
}) => {
  const [activeAdmin, setActiveAdmin] = useState<AdminUser | null>(
    adminDb.getActiveAdminSession()
  );
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [privacyModalUser, setPrivacyModalUser] = useState<PlatformUser | null>(null);

  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catNameBn, setCatNameBn] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  const [catColor, setCatColor] = useState('#10b981');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Diagnostics & Status
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const stats = db.getDatabaseStats();
  const platformUsers = adminDb.getPlatformUsers();
  const payments = adminDb.getPayments();
  const tickets = adminDb.getSupportTickets();
  const activePrivilege = adminDb.getActivePrivilegedSession();

  const loadAuditLogs = () => {
    // Audit logs are reactively observed by AdminAuditTab
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const triggerNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Run database mathematical integrity check
  const handleRunIntegrity = () => {
    const res = db.checkDatabaseIntegrity();
    loadAuditLogs();
    onRefreshAll();
    triggerNotice(
      language === 'bn'
        ? `ইন্টিগ্রিটি চেক সম্পন্ন! মোট লেনদেন: ${res.totalTransactions}, হিসাব যাচাইকৃত।`
        : `Integrity check complete! Audited ${res.totalTransactions} transactions.`
    );
  };

  // Vacuum database
  const handleVacuum = () => {
    const count = db.vacuumDatabase();
    loadAuditLogs();
    onRefreshAll();
    triggerNotice(
      language === 'bn'
        ? `ডাটাবেজ অপ্টিমাইজেশন সম্পন্ন (${count} টি রেকর্ড সক্রিয়)`
        : `Database vacuumed (${count} active records retained)`
    );
  };

  const handleLogout = () => {
    adminDb.setActiveAdminSession(null);
    setActiveAdmin(null);
    triggerNotice(language === 'bn' ? 'অ্যাডমিন সেশন সমাপ্ত হয়েছে।' : 'Admin session logged out.');
  };

  const handleQuickRoleSwitch = (role: AdminRole) => {
    if (!activeAdmin) return;
    const updated: AdminUser = {
      ...activeAdmin,
      role,
    };
    adminDb.setActiveAdminSession(updated);
    setActiveAdmin(updated);
    triggerNotice(`Role switched to ${role.replace('_', ' ').toUpperCase()}`);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameBn || !catNameEn) return;

    if (editingCategory) {
      db.updateCategory({
        ...editingCategory,
        nameBn: catNameBn,
        nameEn: catNameEn,
        type: catType,
        color: catColor,
      });
      triggerNotice('Category updated successfully');
    } else {
      const newCat: Category = {
        id: `cat_custom_${Date.now()}`,
        nameBn: catNameBn,
        nameEn: catNameEn,
        type: catType,
        icon: 'Tag',
        color: catColor,
        isSystem: false,
      };
      db.addCategory(newCat);
      triggerNotice('New custom category added');
    }
    setShowCatModal(false);
    loadAuditLogs();
    onRefreshAll();
  };

  const handleDeleteCategory = (cat: Category) => {
    if (cat.isSystem) {
      alert('System categories cannot be deleted.');
      return;
    }
    if (window.confirm(`Delete category "${cat.nameEn}"?`)) {
      db.deleteCategory(cat.id);
      loadAuditLogs();
      onRefreshAll();
      triggerNotice('Category deleted');
    }
  };

  const totalCapital = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Super Admin Top Control Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-6 border border-indigo-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-400 shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {language === 'bn' ? 'জীবনফাই সুপার অ্যাডমিন' : 'Jibonify Super Admin'}
                </h1>
                {activeAdmin && (
                  <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                    {activeAdmin.role.replace('_', ' ')}
                  </span>
                )}
                {activeAdmin?.twoFactorEnabled && (
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                    2FA Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Operator: <strong className="text-white">{activeAdmin ? activeAdmin.name : 'Guest Session'}</strong> ({activeAdmin?.email})
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Role Emulator for testing RBAC */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1 text-xs">
              <span className="text-[10px] text-slate-400 px-2 font-semibold">Role:</span>
              <select
                value={activeAdmin?.role || 'super_admin'}
                onChange={(e) => handleQuickRoleSwitch(e.target.value as AdminRole)}
                className="bg-transparent text-xs font-bold text-indigo-300 focus:outline-hidden pr-2 cursor-pointer"
              >
                <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
                <option value="support_admin" className="bg-slate-900 text-white">Support Admin</option>
                <option value="finance_admin" className="bg-slate-900 text-white">Finance Admin</option>
                <option value="content_admin" className="bg-slate-900 text-white">Content Admin</option>
                <option value="analyst" className="bg-slate-900 text-white">Analyst</option>
              </select>
            </div>

            <button
              onClick={handleRunIntegrity}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-xs font-bold transition shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Math Audit</span>
            </button>

            {onExitAdmin && (
              <button
                onClick={onExitAdmin}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>Return to User App</span>
              </button>
            )}

            {activeAdmin ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 transition"
                title="Logout Admin Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Privileged Support Session Active Banner */}
        {activePrivilege && (
          <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl bg-rose-950/90 border border-rose-500/60 p-3 text-xs text-rose-200 animate-pulse">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>PRIVILEGED SUPPORT SESSION ACTIVE:</strong> Accessing user{' '}
                <strong>{activePrivilege.userName}</strong>. Reason: &quot;{activePrivilege.reason}&quot;. Expires at{' '}
                {new Date(activePrivilege.expiresAt).toLocaleTimeString()}.
              </span>
            </div>
            <button
              onClick={() => {
                adminDb.endPrivilegedSession(activePrivilege.id);
                triggerNotice('Privileged session terminated immediately.');
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shrink-0 transition"
            >
              End Privileged Access
            </button>
          </div>
        )}

        {/* Status Notice Toast */}
        {statusNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-2.5 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}
      </div>

      {/* Main KPI Stats Command Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Users</span>
          <p className="text-lg font-black text-white font-num mt-0.5">{platformUsers.length}</p>
          <p className="text-[10px] text-emerald-400">100% Onboarded</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Subscriptions</span>
          <p className="text-lg font-black text-indigo-400 font-num mt-0.5">
            {platformUsers.filter((u) => u.plan !== 'free').length} Pro
          </p>
          <p className="text-[10px] text-slate-400">Paid Tiers</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Revenue</span>
          <p className="text-lg font-black text-emerald-400 font-num mt-0.5">৳{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">MFS &amp; Cards</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending Tickets</span>
          <p className="text-lg font-black text-amber-400 font-num mt-0.5">{pendingTickets}</p>
          <p className="text-[10px] text-slate-400">In Support Queue</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">System Health</span>
          <p className="text-lg font-black text-emerald-400 font-num mt-0.5">99.98%</p>
          <p className="text-[10px] text-slate-400">18ms Latency</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Tracked Capital</span>
          <p className="text-lg font-black text-white font-num mt-0.5">৳{totalCapital.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">{accounts.length} Accounts</p>
        </div>
      </div>

      {/* Primary Super Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Command Center', icon: BarChart2 },
          { id: 'users', label: 'User Management', icon: Users, badge: platformUsers.length.toString() },
          { id: 'subscriptions', label: 'Plans & Payments', icon: CreditCard },
          { id: 'support', label: 'Support & Bugs', icon: LifeBuoy, badge: pendingTickets > 0 ? pendingTickets.toString() : undefined },
          { id: 'features', label: 'Features & Broadcast', icon: Megaphone },
          { id: 'system', label: 'System & RBAC', icon: Server },
          { id: 'categories', label: 'Category Master', icon: Tag },
          { id: 'audit', label: 'Audit Trail', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SuperAdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview (Command Center & Database Master) */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Quick Action Buttons */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Super Admin Command Center</h3>
              <p className="text-xs text-slate-400">Quickly navigate to any platform subsystem or execute audits.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('users')}
                className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition"
              >
                Browse Users
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Manage Plans
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Support Queue
              </button>
              <button
                onClick={handleVacuum}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Vacuum Database
              </button>
            </div>
          </div>

          {/* Database Breakdown Matrix */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Database Collections &amp; Persistence Storage Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(stats.tableCounts).map(([tableKey, count]) => {
                const cleanName = tableKey.replace('jibonify_', '').replace('_v1', '');
                return (
                  <div key={tableKey} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-300 capitalize">{cleanName}</p>
                      <p className="text-[10px] text-slate-500">{tableKey}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-500/30 font-num">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <AdminUsersTab
          admin={activeAdmin || adminDb.getAdminUsers()[0]}
          language={settings.language}
          onRequestPrivilegedAccess={(user) => setPrivacyModalUser(user)}
          onRefresh={loadAuditLogs}
        />
      )}

      {/* Tab: Subscriptions & Pricing */}
      {activeTab === 'subscriptions' && (
        <AdminSubscriptionsTab
          admin={activeAdmin || adminDb.getAdminUsers()[0]}
          language={settings.language}
          onRefresh={loadAuditLogs}
        />
      )}

      {/* Tab: Support & Bug Reports */}
      {activeTab === 'support' && (
        <AdminSupportTab
          admin={activeAdmin || adminDb.getAdminUsers()[0]}
          language={settings.language}
          onRefresh={loadAuditLogs}
        />
      )}

      {/* Tab: Features & Broadcast */}
      {activeTab === 'features' && (
        <AdminFeaturesTab
          admin={activeAdmin || adminDb.getAdminUsers()[0]}
          language={settings.language}
          onRefresh={loadAuditLogs}
        />
      )}

      {/* Tab: System & RBAC */}
      {activeTab === 'system' && (
        <AdminSystemTab
          admin={activeAdmin || adminDb.getAdminUsers()[0]}
          language={settings.language}
          onRefresh={loadAuditLogs}
        />
      )}

      {/* Tab: Category Master */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  categoryFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('expense')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  categoryFilter === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setCategoryFilter('income')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  categoryFilter === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Income
              </button>
            </div>

            <button
              onClick={() => {
                setEditingCategory(null);
                setCatNameBn('');
                setCatNameEn('');
                setCatType('expense');
                setCatColor('#10b981');
                setShowCatModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {categories
              .filter((c) => categoryFilter === 'all' || c.type === categoryFilter)
              .map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    >
                      <Tag className="w-5 h-5 text-white/90" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{cat.nameBn}</p>
                      <p className="text-[11px] text-slate-400">{cat.nameEn}</p>
                      <span className="text-[9px] font-bold uppercase text-slate-400">{cat.type}</span>
                    </div>
                  </div>

                  {!cat.isSystem && (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab: Audit Trail */}
      {activeTab === 'audit' && (
        <AdminAuditTab
          admin={activeAdmin || adminDb.getAdminUsers()[0]}
          language={settings.language}
          onRefresh={loadAuditLogs}
        />
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bangla Name</label>
                <input
                  type="text"
                  required
                  value={catNameBn}
                  onChange={(e) => setCatNameBn(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">English Name</label>
                <input
                  type="text"
                  required
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Badge Color</label>
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(admin) => {
          setActiveAdmin(admin);
          triggerNotice(`Logged in as ${admin.name} (${admin.role})`);
        }}
        language={settings.language}
      />

      {/* Privileged Access Privacy Shield Modal */}
      <AdminPrivacyModal
        isOpen={Boolean(privacyModalUser)}
        user={privacyModalUser}
        admin={activeAdmin || adminDb.getAdminUsers()[0]}
        onClose={() => setPrivacyModalUser(null)}
        onSessionGranted={() => {
          triggerNotice('Temporary privileged support access granted. Audit log created.');
        }}
        language={settings.language}
      />
    </div>
  );
};
