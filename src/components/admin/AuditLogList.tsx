import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Copy,
  Check,
  X,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  User,
  Sliders,
  Filter,
  RefreshCw,
  Download,
  Layers,
  Sparkles,
  Lock,
  Tag,
  Database,
  ArrowRight,
} from 'lucide-react';
import {
  AuditCategory,
  AuditSeverity,
  SystemAuditLog,
} from '../../types';
import { auditService, AuditFilterParams } from '../../services/auditService';

export type SortField =
  | 'timestamp'
  | 'action'
  | 'category'
  | 'severity'
  | 'admin'
  | 'target'
  | 'status';

export type SortDirection = 'asc' | 'desc';

export interface AuditLogListProps {
  language?: 'bn' | 'en';
  initialPageSize?: number;
  showFilters?: boolean;
  showMetrics?: boolean;
  showExports?: boolean;
  className?: string;
  onSelectLog?: (log: SystemAuditLog) => void;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
  language = 'en',
  initialPageSize = 10,
  showFilters = true,
  showMetrics = false,
  showExports = true,
  className = '',
  onSelectLog,
}) => {
  // Logs & pub/sub state
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filtering state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Selected Log for detail modal
  const [inspectedLog, setInspectedLog] = useState<SystemAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Fetch logs from AuditLogService
  const loadLogs = () => {
    setLoading(true);
    try {
      const records = auditService.getLogs();
      setLogs(records);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time audit updates
  useEffect(() => {
    loadLogs();
    const unsubscribe = auditService.subscribe(() => {
      loadLogs();
    });
    return () => unsubscribe();
  }, []);

  // Unique admins list for dropdown filter
  const adminList = useMemo(() => {
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

  // Handle Sort header clicks
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // Default to desc for timestamp, asc for text
      setSortDirection(field === 'timestamp' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Severity ranking helper
  const getSeverityRank = (sev?: AuditSeverity): number => {
    switch (sev) {
      case 'critical':
        return 3;
      case 'warning':
        return 2;
      case 'info':
      default:
        return 1;
    }
  };

  // Filter and sort logs
  const processedLogs = useMemo(() => {
    // 1. Filter
    const filters: AuditFilterParams = {
      search,
      category: categoryFilter,
      severity: severityFilter,
      targetType: targetTypeFilter,
      adminId: adminFilter,
    };
    const filtered = auditService.filterLogs(filters);

    // 2. Sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'action':
          comparison = a.action.localeCompare(b.action);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'severity':
          comparison = getSeverityRank(a.severity) - getSeverityRank(b.severity);
          break;
        case 'admin': {
          const nameA = a.adminName || a.user || '';
          const nameB = b.adminName || b.user || '';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'target': {
          const targetA = a.targetEntity?.name || a.targetEntity?.type || '';
          const targetB = b.targetEntity?.name || b.targetEntity?.type || '';
          comparison = targetA.localeCompare(targetB);
          break;
        }
        case 'status': {
          const statusA = a.status || 'success';
          const statusB = b.status || 'success';
          comparison = statusA.localeCompare(statusB);
          break;
        }
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [logs, search, categoryFilter, severityFilter, targetTypeFilter, adminFilter, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = processedLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedLogs.slice(startIndex, startIndex + pageSize);
  }, [processedLogs, currentPage, pageSize]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CSV Export
  const handleExportCSV = () => {
    try {
      const csvData = auditService.exportAsCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `jibonify_audit_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  // JSON Export
  const handleExportJSON = () => {
    try {
      const jsonData = auditService.exportAsJSON();
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `jibonify_audit_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100 transition" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400 font-bold" />
    );
  };

  const getSeverityBadge = (sev?: AuditSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Info className="w-3 h-3 text-indigo-400" />
            INFO
          </span>
        );
    }
  };

  const getTargetIcon = (type?: string) => {
    switch (type) {
      case 'user':
        return <User className="w-3 h-3 text-sky-400" />;
      case 'plan':
      case 'subscription':
        return <Sparkles className="w-3 h-3 text-amber-400" />;
      case 'setting':
        return <Sliders className="w-3 h-3 text-purple-400" />;
      case 'feature':
        return <Tag className="w-3 h-3 text-emerald-400" />;
      case 'privacy':
        return <Lock className="w-3 h-3 text-rose-400" />;
      default:
        return <Database className="w-3 h-3 text-slate-400" />;
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

  // Generate pagination page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Optional Filters and Search Bar */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder={
                  language === 'bn'
                    ? 'অ্যাকশন, অ্যাডমিন নাম, টার্গেট সত্তা অথবা বিবরণ খুঁজুন...'
                    : 'Search actions, admin actor, target entity, or details...'
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 pl-10 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={loadLogs}
                title="Refresh table logs"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700/60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
              </button>

              {showExports && (
                <>
                  <button
                    onClick={handleExportCSV}
                    title="Export table to CSV"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-300 text-xs font-semibold transition border border-slate-700/60"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    title="Export table to JSON"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 hover:border-indigo-500/40 text-slate-300 text-xs font-semibold transition border border-slate-700/60"
                  >
                    <span>JSON</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="user">User Management</option>
                <option value="subscription">Subscriptions & Plans</option>
                <option value="settings">System Settings</option>
                <option value="security">Security & Roles</option>
                <option value="feature">Feature Flags</option>
                <option value="privacy">Privacy Access</option>
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
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                value={targetTypeFilter}
                onChange={(e) => {
                  setTargetTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">All Targets</option>
                <option value="user">User</option>
                <option value="plan">Plan</option>
                <option value="setting">Setting</option>
                <option value="feature">Feature</option>
                <option value="category">Category</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin Actor
              </label>
              <select
                value={adminFilter}
                onChange={(e) => {
                  setAdminFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">All Admins</option>
                {adminList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        {/* Table Top Bar: Items count and Page size */}
        <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {language === 'bn' ? 'অডিট লগ ডাটা টেবিল' : 'Audit Log Table'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-num">
              {totalItems} {totalItems === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* The Sortable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort('timestamp')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Timestamp</span>
                    {renderSortIcon('timestamp')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('severity')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Severity</span>
                    {renderSortIcon('severity')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('action')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Action Code</span>
                    {renderSortIcon('action')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    {renderSortIcon('category')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('admin')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Admin Actor</span>
                    {renderSortIcon('admin')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('target')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target Entity</span>
                    {renderSortIcon('target')}
                  </div>
                </th>

                <th className="py-3 px-4">
                  <span>Details / Mutation</span>
                </th>

                <th className="py-3 px-3 text-right">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">
                        No audit records match your filters
                      </p>
                      <button
                        onClick={() => {
                          setSearch('');
                          setCategoryFilter('all');
                          setSeverityFilter('all');
                          setTargetTypeFilter('all');
                          setAdminFilter('all');
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-400"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const target = log.targetEntity;
                  const hasDiff = Boolean(log.changes?.field);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => {
                        setInspectedLog(log);
                        if (onSelectLog) onSelectLog(log);
                      }}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-mono text-white text-[11px] font-num">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-num">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                          <span className="text-[9px] text-slate-400 block">
                            {formatRelativeTime(log.timestamp)}
                          </span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-white text-xs bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md inline-block">
                          {log.action}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          {log.category}
                        </span>
                      </td>

                      {/* Admin Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {(log.adminName || log.user || 'A')[0].toUpperCase()}
                          </div>
                          <div className="leading-tight">
                            <p className="font-semibold text-white text-xs">
                              {log.adminName || log.user}
                            </p>
                            {log.adminRole && (
                              <span className="text-[9px] font-bold text-slate-400 uppercase">
                                {log.adminRole}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {target ? (
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 rounded bg-slate-800 text-slate-300">
                              {getTargetIcon(target.type)}
                            </div>
                            <div className="leading-tight">
                              <p className="font-semibold text-slate-200 text-xs truncate max-w-[130px]">
                                {target.name}
                              </p>
                              <span className="text-[9px] font-mono text-slate-400">
                                {target.type}:{target.id}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Details / Mutation Diff */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-1">
                          <p className="text-slate-300 text-xs line-clamp-1 group-hover:line-clamp-none transition">
                            {log.details}
                          </p>
                          {hasDiff && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300">
                              <span className="text-indigo-400 font-semibold">{log.changes?.field}:</span>
                              <span className="text-rose-400 line-through">
                                {String(log.changes?.previousValue ?? 'null')}
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                              <span className="text-emerald-400 font-bold">
                                {String(log.changes?.newValue ?? 'null')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopy(log.id, log.id)}
                            title="Copy ID"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          >
                            {copiedId === log.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setInspectedLog(log);
                              if (onSelectLog) onSelectLog(log);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-semibold transition"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Entries Info */}
          <p className="text-slate-400 text-xs">
            Showing <span className="font-bold text-white font-num">{startEntry}</span> to{' '}
            <span className="font-bold text-white font-num">{endEntry}</span> of{' '}
            <span className="font-bold text-white font-num">{totalItems}</span> entries
          </p>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="First Page"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 transition"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Previous Page"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numeric Page Buttons */}
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`dots_${idx}`} className="px-2 py-1 text-slate-400 select-none">
                    ...
                  </span>
                );
              }
              const pageNumber = Number(num);
              const isActive = currentPage === pageNumber;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`min-w-[28px] h-7 rounded-lg text-xs font-bold transition flex items-center justify-center font-num ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              title="Next Page"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              title="Last Page"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 transition"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Record Inspection Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">
                    {inspectedLog.action}
                  </span>
                  {getSeverityBadge(inspectedLog.severity)}
                  <span className="rounded-md bg-indigo-950 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-300">
                    {inspectedLog.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">Log ID: {inspectedLog.id}</p>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Admin Actor</p>
                <p className="font-bold text-white">
                  {inspectedLog.adminName || inspectedLog.user}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  {inspectedLog.adminEmail || 'N/A'}
                </p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider rounded bg-indigo-950 border border-indigo-500/30 px-1.5 py-0.5 text-indigo-300">
                  {inspectedLog.adminRole || 'admin'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Target Entity</p>
                <p className="font-bold text-white">
                  {inspectedLog.targetEntity?.name || 'Platform Environment'}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  Type: {inspectedLog.targetEntity?.type || 'system'} | ID:{' '}
                  {inspectedLog.targetEntity?.id || 'global'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Timestamp</p>
                <p className="font-semibold text-white font-num">
                  {new Date(inspectedLog.timestamp).toISOString()}
                </p>
                <p className="text-slate-400 font-num">
                  Local: {new Date(inspectedLog.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Security Context</p>
                <p className="text-slate-300 font-mono text-[11px]">
                  IP: {inspectedLog.ipAddress || '192.168.1.104'}
                </p>
                <p className="text-slate-400 text-[11px] truncate">
                  Session: {inspectedLog.deviceSession || 'Secure Console'}
                </p>
              </div>
            </div>

            {/* Narrative Details */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">Details &amp; Audit Summary</p>
              <p className="text-xs text-slate-200 leading-relaxed">{inspectedLog.details}</p>
            </div>

            {/* State Mutation Diff */}
            {inspectedLog.changes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
                <p className="text-[10px] font-bold uppercase text-slate-400">State Mutation</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-indigo-400 font-bold">{inspectedLog.changes.field}:</span>
                  <span className="text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded">
                    {String(inspectedLog.changes.previousValue ?? 'null')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded font-bold">
                    {String(inspectedLog.changes.newValue ?? 'null')}
                  </span>
                </div>
              </div>
            )}

            {/* Raw JSON Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Raw Structured JSON
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(inspectedLog, null, 2));
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
                {JSON.stringify(inspectedLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
