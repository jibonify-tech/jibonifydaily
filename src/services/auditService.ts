import {
  AuditCategory,
  AuditSeverity,
  AuditTargetEntity,
  SystemAuditLog,
} from '../types';
import { adminDb } from './adminStorage';

const AUDIT_STORAGE_KEY = 'jibonify_audit_logs_v1';

export interface LogActionParams {
  action: string;
  category: AuditCategory;
  details: string;
  targetEntity?: AuditTargetEntity;
  severity?: AuditSeverity;
  changes?: {
    field?: string;
    previousValue?: any;
    newValue?: any;
  };
  admin?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  status?: 'success' | 'failed' | 'warning';
  metadata?: Record<string, any>;
}

export interface AuditFilterParams {
  search?: string;
  category?: string;
  severity?: string;
  adminId?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
}

const INITIAL_AUDIT_SEED: SystemAuditLog[] = [
  {
    id: 'log_seed_1',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    action: 'USER_SUSPENDED',
    category: 'user',
    severity: 'critical',
    adminId: 'admin_super_1',
    adminName: 'Rupom Super Admin',
    adminEmail: 'rupomxc@gmail.com',
    adminRole: 'super_admin',
    user: 'Rupom Super Admin',
    targetEntity: {
      type: 'user',
      id: 'usr_105',
      name: 'Shakil Mahmud (shakil.m@example.com)',
    },
    details: 'User account flagged and suspended pending multi-device compliance review.',
    changes: {
      field: 'status',
      previousValue: 'active',
      newValue: 'suspended',
    },
    status: 'success',
    ipAddress: '192.168.1.104',
    deviceSession: 'MacBook Pro / Chrome 129',
  },
  {
    id: 'log_seed_2',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    action: 'MAINTENANCE_MODE_TOGGLED',
    category: 'system',
    severity: 'warning',
    adminId: 'admin_super_1',
    adminName: 'Rupom Super Admin',
    adminEmail: 'rupomxc@gmail.com',
    adminRole: 'super_admin',
    user: 'Rupom Super Admin',
    targetEntity: {
      type: 'setting',
      id: 'maintenanceMode',
      name: 'Global Platform Maintenance Mode',
    },
    details: 'Scheduled system maintenance banner toggled to test cloud sync migration.',
    changes: {
      field: 'maintenanceMode',
      previousValue: false,
      newValue: true,
    },
    status: 'success',
    ipAddress: '192.168.1.104',
    deviceSession: 'MacBook Pro / Chrome 129',
  },
  {
    id: 'log_seed_3',
    timestamp: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    action: 'PRIVILEGED_SUPPORT_ACCESS_GRANTED',
    category: 'privacy',
    severity: 'critical',
    adminId: 'admin_support_2',
    adminName: 'Karim Support Lead',
    adminEmail: 'support@jibonify.com',
    adminRole: 'support_admin',
    user: 'Karim Support Lead',
    targetEntity: {
      type: 'user',
      id: 'usr_101',
      name: 'তানভীর আহমেদ (Tanveer)',
    },
    details: 'Authorized temporary 15-minute diagnostic support access for reconciliation ticket #TKT-2026-8812.',
    status: 'success',
    ipAddress: '10.0.0.45',
    deviceSession: 'Dell XPS 15 / Edge 128',
  },
  {
    id: 'log_seed_4',
    timestamp: new Date(Date.now() - 1000 * 3600 * 6).toISOString(),
    action: 'PLAN_PRICE_UPDATED',
    category: 'subscription',
    severity: 'warning',
    adminId: 'admin_finance_3',
    adminName: 'Fatema Finance Head',
    adminEmail: 'finance@jibonify.com',
    adminRole: 'finance_admin',
    user: 'Fatema Finance Head',
    targetEntity: {
      type: 'plan',
      id: 'pro_monthly',
      name: 'Jibonify Pro Monthly',
    },
    details: 'Updated monthly subscription price and feature limits for Q4 promotional campaign.',
    changes: {
      field: 'priceBDT',
      previousValue: 300,
      newValue: 250,
    },
    status: 'success',
    ipAddress: '172.16.0.88',
    deviceSession: 'ThinkPad T14 / Firefox 130',
  },
  {
    id: 'log_seed_5',
    timestamp: new Date(Date.now() - 1000 * 3600 * 18).toISOString(),
    action: 'FEATURE_FLAG_TOGGLED',
    category: 'feature',
    severity: 'info',
    adminId: 'admin_super_1',
    adminName: 'Rupom Super Admin',
    adminEmail: 'rupomxc@gmail.com',
    adminRole: 'super_admin',
    user: 'Rupom Super Admin',
    targetEntity: {
      type: 'feature',
      id: 'receipt_upload',
      name: 'Receipt & Voucher Photo Upload',
    },
    details: 'Enabled photo receipt attachment globally for all Pro Monthly and Pro Yearly subscribers.',
    changes: {
      field: 'isEnabledGlobally',
      previousValue: false,
      newValue: true,
    },
    status: 'success',
    ipAddress: '192.168.1.104',
    deviceSession: 'MacBook Pro / Chrome 129',
  },
];

class AuditService {
  private listeners: Array<() => void> = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Audit listener error:', e);
      }
    });
  }

  /**
   * Retrieves all audit logs from storage, newest first
   */
  public getLogs(): SystemAuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (data) {
        const parsed: SystemAuditLog[] = JSON.parse(data);
        return parsed.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      // Populate seed if brand new
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_SEED));
      return INITIAL_AUDIT_SEED;
    } catch (e) {
      console.error('Failed to read audit logs:', e);
      return INITIAL_AUDIT_SEED;
    }
  }

  /**
   * Automatically records a privileged action with actor and target entity details
   */
  public logAction(params: LogActionParams): SystemAuditLog {
    const activeAdmin = params.admin || adminDb.getActiveAdminSession();
    const adminId = activeAdmin?.id || 'admin_super_1';
    const adminName = activeAdmin?.name || 'Rupom Super Admin';
    const adminEmail = activeAdmin?.email || 'rupomxc@gmail.com';
    const adminRole = activeAdmin?.role || 'super_admin';

    // Auto calculate severity if not explicitly provided
    let severity: AuditSeverity = params.severity || 'info';
    if (!params.severity) {
      const actionUpper = params.action.toUpperCase();
      if (
        actionUpper.includes('DELETE') ||
        actionUpper.includes('PURGE') ||
        actionUpper.includes('SUSPEND') ||
        actionUpper.includes('PRIVILEGED') ||
        actionUpper.includes('RESET_ALL') ||
        actionUpper.includes('FACTORY')
      ) {
        severity = 'critical';
      } else if (
        actionUpper.includes('TOGGLE') ||
        actionUpper.includes('STATUS') ||
        actionUpper.includes('PASSWORD') ||
        actionUpper.includes('PERMISSION') ||
        actionUpper.includes('PLAN')
      ) {
        severity = 'warning';
      }
    }

    const newLog: SystemAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: params.action,
      category: params.category,
      severity,
      adminId,
      adminName,
      adminEmail,
      adminRole,
      user: adminName, // backward compatibility
      targetEntity: params.targetEntity || {
        type: 'system',
        id: 'global',
        name: 'Platform Environment',
      },
      details: params.details,
      changes: params.changes,
      status: params.status || 'success',
      ipAddress: '192.168.1.104',
      deviceSession: typeof navigator !== 'undefined' ? `${navigator.platform || 'Workstation'} / Secure Admin Agent` : 'Workstation Admin Session',
      metadata: params.metadata,
    };

    try {
      const existing = this.getLogs();
      const updated = [newLog, ...existing].slice(0, 500); // retain latest 500 records
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to store audit log:', e);
    }

    this.notify();
    return newLog;
  }

  /**
   * Search and filter audit records
   */
  public filterLogs(filters: AuditFilterParams): SystemAuditLog[] {
    const logs = this.getLogs();
    const query = filters.search?.trim().toLowerCase() || '';

    return logs.filter((log) => {
      // Category filter
      if (filters.category && filters.category !== 'all' && log.category !== filters.category) {
        return false;
      }

      // Severity filter
      if (filters.severity && filters.severity !== 'all' && log.severity !== filters.severity) {
        return false;
      }

      // Admin filter
      if (filters.adminId && filters.adminId !== 'all' && log.adminId !== filters.adminId) {
        return false;
      }

      // Target type filter
      if (
        filters.targetType &&
        filters.targetType !== 'all' &&
        log.targetEntity?.type !== filters.targetType
      ) {
        return false;
      }

      // Text query match
      if (query) {
        const matchesAction = log.action.toLowerCase().includes(query);
        const matchesDetails = log.details.toLowerCase().includes(query);
        const matchesAdmin =
          (log.adminName && log.adminName.toLowerCase().includes(query)) ||
          (log.adminEmail && log.adminEmail.toLowerCase().includes(query)) ||
          (log.adminId && log.adminId.toLowerCase().includes(query));
        const matchesTarget =
          (log.targetEntity?.name && log.targetEntity.name.toLowerCase().includes(query)) ||
          (log.targetEntity?.id && log.targetEntity.id.toLowerCase().includes(query)) ||
          (log.targetEntity?.type && log.targetEntity.type.toLowerCase().includes(query));

        if (!matchesAction && !matchesDetails && !matchesAdmin && !matchesTarget) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Returns security summary metrics
   */
  public getMetrics() {
    const logs = this.getLogs();
    const oneDayAgo = Date.now() - 24 * 3600 * 1000;

    const last24hCount = logs.filter(
      (l) => new Date(l.timestamp).getTime() >= oneDayAgo
    ).length;

    const criticalCount = logs.filter((l) => l.severity === 'critical').length;
    const warningCount = logs.filter((l) => l.severity === 'warning').length;

    const uniqueAdmins = new Set(logs.map((l) => l.adminEmail || l.adminName || l.user)).size;

    return {
      totalLogs: logs.length,
      last24hCount,
      criticalCount,
      warningCount,
      uniqueAdmins,
    };
  }

  /**
   * Exports full audit records as JSON
   */
  public exportAsJSON(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  /**
   * Exports audit trail as CSV
   */
  public exportAsCSV(): string {
    const logs = this.getLogs();
    const headers = [
      'Log ID',
      'Timestamp',
      'Severity',
      'Action',
      'Category',
      'Admin ID',
      'Admin Name',
      'Admin Email',
      'Admin Role',
      'Target Type',
      'Target ID',
      'Target Name',
      'Details',
      'Status',
    ];

    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.severity || 'info'}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.adminId || ''}"`,
      `"${(l.adminName || l.user).replace(/"/g, '""')}"`,
      `"${l.adminEmail || ''}"`,
      `"${l.adminRole || ''}"`,
      `"${l.targetEntity?.type || ''}"`,
      `"${l.targetEntity?.id || ''}"`,
      `"${(l.targetEntity?.name || '').replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.status || 'success'}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Clears audit logs with an audited self-record
   */
  public clearLogs(reason: string = 'Authorized Audit Maintenance'): void {
    const activeAdmin = adminDb.getActiveAdminSession();
    const purgeRecord: SystemAuditLog = {
      id: `audit_purge_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'AUDIT_TRAIL_PURGED',
      category: 'system',
      severity: 'critical',
      adminId: activeAdmin?.id || 'admin_super_1',
      adminName: activeAdmin?.name || 'Rupom Super Admin',
      adminEmail: activeAdmin?.email || 'rupomxc@gmail.com',
      adminRole: activeAdmin?.role || 'super_admin',
      user: activeAdmin?.name || 'Rupom Super Admin',
      targetEntity: {
        type: 'system',
        id: 'audit_logs',
        name: 'Platform Audit Records',
      },
      details: `Audit trail history wiped by Super Admin. Reason: "${reason}".`,
      status: 'success',
      ipAddress: '192.168.1.104',
      deviceSession: 'Workstation / Secure Console',
    };

    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([purgeRecord]));
    this.notify();
  }
}

export const auditService = new AuditService();
