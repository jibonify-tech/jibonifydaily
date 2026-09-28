import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  FileText,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Shield,
  Layers,
  Database,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  Copy,
  Check,
  X,
  Sliders,
  Sparkles,
  Smartphone,
  Globe,
  Tag,
  ArrowRight,
  Table,
  LayoutList,
} from 'lucide-react';
import {
  AdminRole,
  AdminUser,
  AuditCategory,
  AuditSeverity,
  AuditTargetEntity,
  SystemAuditLog,
} from '../../types';
import { auditService, AuditFilterParams } from '../../services/auditService';
import { adminDb } from '../../services/adminStorage';
import { AuditLogList } from './AuditLogList';

interface AdminAuditTabProps {
  admin: AdminUser;
  language: 'bn' | 'en';
  onRefresh?: () => void;
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({
  admin,
  language,
  onRefresh,
}) => {
  const [logs, setLogs] = useState<SystemAuditLog[]>(auditService.getLogs());
  const [metrics, setMetrics] = useState(auditService.getMetrics());
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('all');
  const [selectedAdminId, setSelectedAdminId] = useState<string>('all');

  // Detail Modal / Inspector
  const [inspectLog, setInspectLog] = useState<SystemAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Purge confirmation dialog
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeReason, setPurgeReason] = useState('');
  const [purgeConfirmText, setPurgeConfirmText] = useState('');

  // Toast status notice
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Reload logs and metrics
  const reloadData = () => {
    setLogs(auditService.getLogs());
    setMetrics(auditService.getMetrics());
    if (onRefresh) onRefresh();
  };

  // Subscribe to live audit updates
  useEffect(() => {
    reloadData();
    const unsubscribe = auditService.subscribe(() => {
      setLogs(auditService.getLogs());
      setMetrics(auditService.getMetrics());
    });
    return () => unsubscribe();
  }, []);

  // Filtered log results
  const filteredLogs = useMemo(() => {
    const filters: AuditFilterParams = {
      search,
      category: selectedCategory,
      severity: selectedSeverity,
      targetType: selectedTargetType,
      adminId: selectedAdminId,
    };
    return auditService.filterLogs(filters);
  }, [logs, search, selectedCategory, selectedSeverity, selectedTargetType, selectedAdminId]);

  // Unique admins list for dropdown
  const adminOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email?: string }>();
    logs.forEach((l) => {
      const id = l.adminId || l.user;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: l.adminName || l.user || 'Unknown Admin',
          email: l.adminEmail,
        });
      }
    });
    return Array.from(map.values());
  }, [logs]);

  // Handle CSV export
  const handleExportCSV = () => {
    try {
      const csvData = auditService.exportAsCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `jibonify_audit_trail_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(language === 'bn' ? 'অডিট লগ CSV ডাউনলোড হয়েছে' : 'Audit logs exported as CSV');
    } catch (e) {
      console.error(e);
      showToast('Failed to export CSV');
    }
  };

  // Handle JSON export
  const handleExportJSON = () => {
    try {
      const jsonData = auditService.exportAsJSON();
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `jibonify_audit_records_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(language === 'bn' ? 'অডিট লগ JSON ডাউনলোড হয়েছে' : 'Audit logs exported as JSON');
    } catch (e) {
      console.error(e);
      showToast('Failed to export JSON');
    }
  };

  // Handle purge
  const handleConfirmPurge = (e: React.FormEvent) => {
    e.preventDefault();
    if (purgeConfirmText !== 'PURGE') {
      showToast('Type PURGE to verify action authorization');
      return;
    }
    auditService.clearLogs(purgeReason || 'Administrative maintenance cleanup');
    setShowPurgeModal(false);
    setPurgeReason('');
    setPurgeConfirmText('');
    showToast(
      language === 'bn'
        ? 'অডিট লগ আর্কাইভ রিসেট সম্পন্ন ও রেকর্ড করা হয়েছে'
        : 'Audit trail purged and self-audited'
    );
    reloadData();
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (sev?: AuditSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            INFO
          </span>
        );
    }
  };

  const getTargetTypeIcon = (type?: string) => {
    switch (type) {
      case 'user':
        return <User className="w-3.5 h-3.5 text-sky-400" />;
      case 'plan':
      case 'subscription':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'setting':
        return <Sliders className="w-3.5 h-3.5 text-purple-400" />;
      case 'feature':
        return <Tag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'privacy':
        return <Lock className="w-3.5 h-3.5 text-rose-400" />;
      case 'system':
      default:
        return <Database className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const ms = Date.now() - new Date(timestamp).getTime();
      const sec = Math.floor(ms / 1000);
      if (sec < 60) return `${sec}s ago`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min}m ago`;
      const hrs = Math.floor(min / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-3 text-xs text-emerald-300 shadow-lg animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Header & Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {language === 'bn' ? 'মোট অডিট ইভেন্ট' : 'Total Audit Events'}
            </p>
            <p className="text-xl font-black text-white font-num mt-0.5">{metrics.totalLogs}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {language === 'bn' ? 'সংবেদনশীল ক্রিটিকাল অ্যাকশন' : 'Critical Actions'}
            </p>
            <p className="text-xl font-black text-rose-400 font-num mt-0.5">
              {metrics.criticalCount}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {language === 'bn' ? 'গত ২৪ ঘণ্টার এক্টিভিটি' : 'Last 24 Hours'}
            </p>
            <p className="text-xl font-black text-emerald-400 font-num mt-0.5">
              {metrics.last24hCount}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {language === 'bn' ? 'সক্রিয় অ্যাডমিন অ্যাক্টর' : 'Active Admins'}
            </p>
            <p className="text-xl font-black text-amber-300 font-num mt-0.5">
              {metrics.uniqueAdmins}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Switcher and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>{language === 'bn' ? 'ডাটা টেবিল ভিউ' : 'Sortable Table View'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'timeline'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>{language === 'bn' ? 'ফিড টাইমলাইন ভিউ' : 'Card Feed View'}</span>
          </button>
        </div>

        {admin.role === 'super_admin' && (
          <button
            onClick={() => setShowPurgeModal(true)}
            title="Authorized Purge"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 text-slate-400 text-xs font-semibold transition border border-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লগ ক্লিনআপ' : 'Purge Trail'}</span>
          </button>
        )}
      </div>

      {viewMode === 'table' ? (
        <AuditLogList
          language={language}
          initialPageSize={10}
          showFilters={true}
          showExports={true}
        />
      ) : (
        <>
          {/* Control Bar: Filters & Export Tools */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder={
                language === 'bn'
                  ? 'অ্যাকশন, অ্যাডমিন নাম, আইডি বা টার্গেট সত্তা খুঁজুন...'
                  : 'Search actions, admin actor, target entity, details...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={reloadData}
              title="Refresh live audit feed"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700/60"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              title="Export complete audit trail to CSV spreadsheet"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-300 text-xs font-semibold transition border border-slate-700/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="Export complete audit trail to structured JSON"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 hover:border-indigo-500/40 text-slate-300 text-xs font-semibold transition border border-slate-700/60"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            {admin.role === 'super_admin' && (
              <button
                onClick={() => setShowPurgeModal(true)}
                title="Authorized Purge"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 text-slate-400 text-xs font-semibold transition border border-slate-700/60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Purge'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="user">User & Accounts</option>
              <option value="subscription">Subscriptions & Plans</option>
              <option value="settings">Platform Settings</option>
              <option value="security">Security & Roles</option>
              <option value="feature">Feature Flags</option>
              <option value="privacy">Privacy Shield</option>
              <option value="system">System & Health</option>
              <option value="data">Data Operations</option>
              <option value="auth">Authentication</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Target Entity
            </label>
            <select
              value={selectedTargetType}
              onChange={(e) => setSelectedTargetType(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Entity Types</option>
              <option value="user">User Account</option>
              <option value="plan">Subscription Plan</option>
              <option value="setting">System Setting</option>
              <option value="feature">Feature Flag</option>
              <option value="category">Category</option>
              <option value="system">System Core</option>
              <option value="ticket">Support Ticket</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Admin Actor
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Admin Actors</option>
              {adminOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick:</span>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSeverity('critical');
              setSelectedTargetType('all');
              setSelectedAdminId('all');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
              selectedSeverity === 'critical' && selectedCategory === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            🔥 Critical Events
          </button>
          <button
            onClick={() => {
              setSelectedCategory('user');
              setSelectedSeverity('all');
              setSelectedTargetType('user');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
              selectedCategory === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            👤 User Suspensions & Changes
          </button>
          <button
            onClick={() => {
              setSelectedCategory('settings');
              setSelectedSeverity('all');
              setSelectedTargetType('all');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
              selectedCategory === 'settings'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            ⚙️ Setting Modifications
          </button>
          <button
            onClick={() => {
              setSelectedCategory('privacy');
              setSelectedSeverity('all');
              setSelectedTargetType('all');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
              selectedCategory === 'privacy'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Privileged Privacy Access
          </button>
          {(selectedCategory !== 'all' ||
            selectedSeverity !== 'all' ||
            selectedTargetType !== 'all' ||
            selectedAdminId !== 'all' ||
            search) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setSelectedTargetType('all');
                setSelectedAdminId('all');
              }}
              className="text-[10px] text-slate-400 hover:text-rose-400 underline ml-2"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Trail Feed */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {language === 'bn' ? 'অডিট রেকর্ড তালিকা' : 'Audit Trail Ledger'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-num">
              {filteredLogs.length} records
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Immutable Append-Only Log</span>
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {language === 'bn' ? 'কোনো অডিট লগ পাওয়া যায়নি' : 'No audit records match your query'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords, category, or severity filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setSelectedTargetType('all');
                setSelectedAdminId('all');
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => {
              const target = log.targetEntity;
              const hasDiff = Boolean(log.changes?.field);

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs group"
                >
                  {/* Left Column: Action, Entity, Narrative */}
                  <div className="space-y-2 flex-1">
                    {/* Top line badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(log.severity)}
                      <span className="font-mono font-bold text-white text-xs bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                      <span className="rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {log.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-num">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="text-slate-400">({formatRelativeTime(log.timestamp)})</span>
                      </span>
                    </div>

                    {/* Target Entity Affected Display */}
                    {target && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1 uppercase font-bold text-[9px]">
                          {getTargetTypeIcon(target.type)}
                          <span>Target {target.type}:</span>
                        </span>
                        <span className="font-semibold text-slate-200">{target.name}</span>
                        <span className="font-mono text-slate-400 text-[10px]">({target.id})</span>
                      </div>
                    )}

                    {/* Diff Pill if change occurred */}
                    {hasDiff && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono bg-slate-950/90 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 w-fit">
                        <span className="text-indigo-400 font-semibold">{log.changes?.field}:</span>
                        <span className="text-rose-400 line-through">
                          {String(log.changes?.previousValue ?? 'null')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 inline" />
                        <span className="text-emerald-400 font-bold">
                          {String(log.changes?.newValue ?? 'null')}
                        </span>
                      </div>
                    )}

                    {/* Narrative Details */}
                    <p className="text-slate-300 text-xs leading-relaxed">{log.details}</p>

                    {/* Technical Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      <span>IP: {log.ipAddress || '192.168.1.1'}</span>
                      <span>•</span>
                      <span>Session: {log.deviceSession || 'Secure Console'}</span>
                      {log.metadata?.ticketId && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400 font-semibold">
                            Ticket: {log.metadata.ticketId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Admin Identifier & Inspect CTA */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 md:min-w-[190px]">
                    <div className="text-left md:text-right space-y-0.5">
                      <div className="flex items-center md:justify-end gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-white text-xs">
                          {log.adminName || log.user}
                        </span>
                      </div>
                      {log.adminEmail && (
                        <p className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</p>
                      )}
                      <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-slate-300">
                        {log.adminRole || 'admin'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleCopy(log.id, log.id)}
                        title="Copy Log ID"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => setInspectLog(log)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspect Modal / Forensic Drawer */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">{inspectLog.action}</span>
                  {getSeverityBadge(inspectLog.severity)}
                </div>
                <p className="text-xs text-slate-400 font-mono">ID: {inspectLog.id}</p>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Admin Actor</p>
                <p className="font-bold text-white">{inspectLog.adminName || inspectLog.user}</p>
                <p className="text-slate-400 font-mono text-[11px]">{inspectLog.adminEmail || 'N/A'}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider rounded bg-indigo-950 border border-indigo-500/30 px-1.5 py-0.5 text-indigo-300">
                  {inspectLog.adminRole || 'admin'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Target Entity</p>
                <p className="font-bold text-white">
                  {inspectLog.targetEntity?.name || 'Platform Environment'}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  Type: {inspectLog.targetEntity?.type || 'system'} | ID:{' '}
                  {inspectLog.targetEntity?.id || 'global'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Timestamp</p>
                <p className="font-semibold text-white font-num">
                  {new Date(inspectLog.timestamp).toISOString()}
                </p>
                <p className="text-slate-400 font-num">
                  Local: {new Date(inspectLog.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Security Context</p>
                <p className="text-slate-300 font-mono text-[11px]">
                  IP: {inspectLog.ipAddress || '192.168.1.104'}
                </p>
                <p className="text-slate-400 text-[11px] truncate">
                  Session: {inspectLog.deviceSession || 'Workstation'}
                </p>
              </div>
            </div>

            {/* Narrative Details */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">Details / Justification</p>
              <p className="text-xs text-slate-200 leading-relaxed">{inspectLog.details}</p>
            </div>

            {/* Field Diff if available */}
            {inspectLog.changes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
                <p className="text-[10px] font-bold uppercase text-slate-400">State Mutation</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-indigo-400 font-bold">{inspectLog.changes.field}:</span>
                  <span className="text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded">
                    {String(inspectLog.changes.previousValue ?? 'null')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded font-bold">
                    {String(inspectLog.changes.newValue ?? 'null')}
                  </span>
                </div>
              </div>
            )}

            {/* Raw JSON Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Raw Structured JSON Audit Record
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(inspectLog, null, 2));
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/90 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(inspectLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Authorized Purge Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border-2 border-rose-500/50 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Authorized Audit Purge</h3>
                <p className="text-xs text-rose-300">
                  Wipes prior history and records a tamper-evident purge entry.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPurge} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Purge (Required for self-audit)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quarterly audit data cycle cleanup"
                  value={purgeReason}
                  onChange={(e) => setPurgeReason(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Type <span className="font-mono text-rose-400 font-bold">PURGE</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  placeholder="PURGE"
                  value={purgeConfirmText}
                  onChange={(e) => setPurgeConfirmText(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPurgeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purgeConfirmText !== 'PURGE' || !purgeReason.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold transition"
                >
                  Execute Purge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
