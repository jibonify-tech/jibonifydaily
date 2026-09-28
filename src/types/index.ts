export type Language = 'bn' | 'en';
export type ThemeMode = 'dark' | 'light' | 'system';

export type AccountType = 'cash' | 'mobile_wallet' | 'bank' | 'card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  subType?: 'pocket' | 'home' | 'bag' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'cellfin' | 'savings' | 'current' | 'debit' | 'credit' | 'other';
  balance: number;
  initialBalance: number;
  accountNumber?: string;
  institutionName?: string; // e.g. BRAC Bank, City Bank
  color?: string;
  icon?: string;
  isDefaultPocket?: boolean; // indicates pocket cash used for outside journey
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'lend' // Money given to someone (Receivable)
  | 'borrow' // Money borrowed from someone (Payable)
  | 'repayment_received' // Someone repaid me
  | 'repayment_given' // I repaid someone
  | 'adjustment'; // Cash reconciliation adjustment

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId?: string; // For transfers
  categoryId?: string;
  personId?: string; // For lend, borrow, repayments
  debtId?: string; // Linked debt record
  outsideSessionId?: string; // Associated outside session if recorded while out
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
  note?: string;
  receiptImage?: string; // Data URL or image reference
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isSystem?: boolean;
}

export interface DaySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  isStarted: boolean;
  isClosed: boolean;
  openingCash: number;
  openingBank: number;
  openingWallet: number;
  openingTotal: number;
  accountSnapshots: {
    accountId: string;
    accountName: string;
    balance: number;
  }[];
  notes?: string;
}

export interface OutsideSession {
  id: string;
  daySessionId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm when returned home
  isActive: boolean;
  destination: string; // e.g. "কারওয়ান বাজার অফিস"
  purpose: string; // e.g. "অফিস ও ক্লায়েন্ট মিটিং"
  transportType: string; // e.g. "রিকশা", "বাস", "মেট্রোরেল", "উবার", "বাইক", "হাঁটা"
  cashTaken: number; // Cash carried out
  additionalCashTaken?: number;
  notes?: string;
  // Return home reconciliation
  expectedCashAtReturn?: number;
  actualCashAtReturn?: number;
  cashDifference?: number; // actual - expected
  reconciliationStatus?: 'matched' | 'short' | 'extra';
  differenceReason?: string;
  differenceNote?: string;
}

export interface DailyClosing {
  id: string;
  date: string;
  daySessionId: string;
  closedAt: string;
  openingTotal: number;
  totalIncome: number;
  totalExpense: number;
  totalTransfers: number;
  moneyGiven: number;
  moneyReceived: number;
  expectedPocketCash: number;
  actualPocketCash: number;
  cashDifference: number;
  todaySavings: number;
  netCashFlow: number;
  categoryExpenses: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  // Diary notes
  diaryActivities?: string;
  diaryPlaces?: string;
  diaryImportantEvents?: string;
  diaryFinancialNotes?: string;
  rating?: number; // 1-5
}

export interface Person {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  avatarUrl?: string;
  totalLent: number; // I gave (Receivable)
  totalBorrowed: number; // I took (Payable)
  createdAt: string;
}

export interface DebtRecord {
  id: string;
  personId: string;
  type: 'lend' | 'borrow';
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  date: string;
  dueDate?: string;
  reason?: string;
  isFullyPaid: boolean;
  repayments: {
    id: string;
    amount: number;
    date: string;
    accountId: string;
    note?: string;
  }[];
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  alertThreshold: number; // e.g. 80 (%)
  month: string; // YYYY-MM
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  isActive: boolean;
  autoRecord: boolean;
  description?: string;
}

export interface Reminder {
  id: string;
  title: string;
  type: 'bill' | 'loan' | 'due' | 'budget' | 'subscription' | 'custom';
  amount?: number;
  dueDate: string;
  isCompleted: boolean;
  personId?: string;
  notes?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  activities: string;
  placesVisited: string;
  financialReflections: string;
  rating: number; // 1 to 5
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: string;
  notes?: string;
  icon?: string;
  color?: string;
  isCompleted: boolean;
  contributions: {
    id: string;
    amount: number;
    date: string;
    accountId: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyFund {
  targetAmount: number;
  currentAmount: number;
  notes?: string;
  updatedAt: string;
}

export interface SharedExpense {
  id: string;
  transactionId?: string;
  totalAmount: number;
  description: string;
  paidByAccountId: string;
  myShare: number;
  splits: {
    personId: string;
    personName: string;
    amount: number;
    isSettled: boolean;
    settledAt?: string;
  }[];
  date: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'budget' | 'due' | 'system' | 'sync';
  isRead: boolean;
  date: string;
  linkTab?: string;
}

export interface CashDenominationCounts {
  1000: number;
  500: number;
  200: number;
  100: number;
  50: number;
  20: number;
  10: number;
  5: number;
  2: number;
  1: number;
}

export interface AppUserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'accountant' | 'super_admin';
  plan: 'free' | 'pro_monthly' | 'pro_yearly' | 'enterprise';
  accountType: 'personal' | 'household' | 'business' | 'admin';
  avatarUrl?: string;
  pinLockEnabled: boolean;
  pinCode?: string;
  password?: string;
  monthlyIncomeTarget?: number;
  monthlyExpenseTarget?: number;
  createdAt: string;
  lastLogin: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: 'admin' | 'user' | 'accountant' | 'super_admin';
  plan?: 'free' | 'pro_monthly' | 'pro_yearly' | 'enterprise';
  accountType?: 'personal' | 'household' | 'business' | 'admin';
  monthlyIncomeTarget?: number;
  monthlyExpenseTarget?: number;
  pinLockEnabled: boolean;
  pinCode?: string;
  password?: string;
  isLoggedIn: boolean;
  lastLogin?: string;
}

export interface AppSettings {
  language: Language;
  currency: 'BDT' | 'USD';
  currencySymbol: string;
  theme: ThemeMode;
  dateFormat: string;
  enableOutsidePrompt: boolean;
  autoReconcileThreshold: number;
  numberFormat?: 'bengali' | 'english';
  weekStartDay?: 'saturday' | 'sunday' | 'monday';
  defaultPocketCash?: number;
  highExpenseAlertThreshold?: number;
  autoCreateReconciliationAdjustment?: boolean;
  privacyMode?: boolean;
  autoLockMinutes?: number;
  maintenanceMode?: boolean;
}

export type AuditCategory =
  | 'user'
  | 'subscription'
  | 'settings'
  | 'security'
  | 'feature'
  | 'system'
  | 'privacy'
  | 'data'
  | 'auth'
  | 'account'
  | 'transaction'
  | 'reconciliation';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditTargetEntity {
  type: 'user' | 'plan' | 'setting' | 'feature' | 'category' | 'ticket' | 'system' | 'session' | 'account';
  id: string;
  name: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: AuditCategory;
  details: string;
  user: string; // fallback / legacy identifier
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  adminRole?: string;
  targetEntity?: AuditTargetEntity;
  severity?: AuditSeverity;
  changes?: {
    field?: string;
    previousValue?: any;
    newValue?: any;
  };
  ipAddress?: string;
  deviceSession?: string;
  status?: 'success' | 'failed' | 'warning';
  metadata?: Record<string, any>;
}

// ==========================================
// SUPER ADMIN DASHBOARD TYPES & MODELS
// ==========================================

export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'support_admin'
  | 'finance_admin'
  | 'content_admin'
  | 'analyst';

export type AdminPermission =
  | 'users.view'
  | 'users.manage'
  | 'users.suspend'
  | 'users.delete'
  | 'subscriptions.view'
  | 'subscriptions.manage'
  | 'payments.view'
  | 'payments.refund'
  | 'plans.manage'
  | 'features.manage'
  | 'categories.manage'
  | 'announcements.manage'
  | 'notifications.send'
  | 'support.manage'
  | 'analytics.view'
  | 'system.settings'
  | 'audit.view'
  | 'privacy.access'
  | 'admin.manage';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  permissions: AdminPermission[];
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: 'free' | 'pro_monthly' | 'pro_yearly' | 'enterprise';
  status: 'active' | 'suspended' | 'deactivated';
  registeredAt: string;
  lastActive: string;
  deviceCount: number;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  storageUsedKB: number;
  appVersion: string;
  language: string;
  theme: string;
  notes?: string[];
  privateAccessExpiresAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameBn: string;
  priceBDT: number;
  billingCycle: 'monthly' | 'yearly' | 'custom' | 'free';
  trialDays: number;
  features: string[];
  isPopular?: boolean;
  storageLimitMB: number;
  deviceLimit: number;
  isActive: boolean;
}

export interface PlatformPayment {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'card' | 'bank';
  planId: string;
  planName: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  date: string;
  invoiceNumber: string;
  refundReason?: string;
}

export interface PlatformFeatureFlag {
  key: string;
  name: string;
  description: string;
  isEnabledGlobally: boolean;
  allowedPlans: string[];
  userOverrides?: Record<string, boolean>;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'maintenance' | 'feature' | 'important' | 'general';
  audience: 'all' | 'free' | 'premium' | 'selected';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlatformPushNotification {
  id: string;
  title: string;
  message: string;
  actionUrl?: string;
  targetSegment: 'all' | 'free' | 'premium' | 'trial' | 'inactive';
  sentAt: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: 'bug' | 'account' | 'payment' | 'sync' | 'feature' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  internalNotes?: { id: string; author: string; text: string; createdAt: string }[];
  replies?: { id: string; author: string; isStaff: boolean; text: string; createdAt: string }[];
  diagnosticInfo?: {
    appVersion: string;
    os: string;
    deviceType: string;
    network: string;
    errorCode?: string;
  };
}

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  module: string;
  severity: 'warning' | 'error' | 'fatal';
  message: string;
  appVersion: string;
  platform: string;
  status: 'investigating' | 'resolved' | 'unresolved';
  count: number;
}

export interface AppReleaseVersion {
  id: string;
  version: string;
  platform: 'android' | 'ios' | 'web';
  releaseDate: string;
  minSupportedVersion: string;
  isForceUpdate: boolean;
  releaseNotes: string;
}

export interface PrivilegedAccessSession {
  id: string;
  adminId: string;
  adminName: string;
  userId: string;
  userName: string;
  reason: string;
  ticketId?: string;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface GlobalPlatformConfig {
  appName: string;
  tagline: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceEstimatedEnd?: string;
  defaultTrialDays: number;
  gracePeriodDays: number;
  defaultCurrency: string;
  allowedPaymentMethods: {
    bkash: boolean;
    nagad: boolean;
    rocket: boolean;
    card: boolean;
    bank: boolean;
  };
}

