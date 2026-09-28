import {
  AdminPermission,
  AdminRole,
  AdminUser,
  AppReleaseVersion,
  GlobalPlatformConfig,
  PlatformAnnouncement,
  PlatformFeatureFlag,
  PlatformPayment,
  PlatformPushNotification,
  PlatformUser,
  PrivilegedAccessSession,
  SubscriptionPlan,
  SupportTicket,
  SystemErrorLog,
} from '../types';

const ADMIN_STORAGE_KEYS = {
  ADMIN_SESSION: 'jibonify_admin_session_v1',
  ADMIN_USERS: 'jibonify_admin_users_v1',
  PLATFORM_USERS: 'jibonify_platform_users_v1',
  PLANS: 'jibonify_platform_plans_v1',
  PAYMENTS: 'jibonify_platform_payments_v1',
  FEATURES: 'jibonify_platform_features_v1',
  ANNOUNCEMENTS: 'jibonify_platform_announcements_v1',
  NOTIFICATIONS: 'jibonify_platform_notifications_v1',
  SUPPORT_TICKETS: 'jibonify_support_tickets_v1',
  ERROR_LOGS: 'jibonify_error_logs_v1',
  APP_VERSIONS: 'jibonify_app_versions_v1',
  PLATFORM_CONFIG: 'jibonify_platform_config_v1',
  PRIVILEGED_SESSIONS: 'jibonify_privileged_sessions_v1',
};

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  'users.view',
  'users.manage',
  'users.suspend',
  'users.delete',
  'subscriptions.view',
  'subscriptions.manage',
  'payments.view',
  'payments.refund',
  'plans.manage',
  'features.manage',
  'categories.manage',
  'announcements.manage',
  'notifications.send',
  'support.manage',
  'analytics.view',
  'system.settings',
  'audit.view',
  'privacy.access',
  'admin.manage',
];

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [...ALL_ADMIN_PERMISSIONS],
  admin: [
    'users.view',
    'users.manage',
    'users.suspend',
    'subscriptions.view',
    'subscriptions.manage',
    'payments.view',
    'plans.manage',
    'features.manage',
    'categories.manage',
    'announcements.manage',
    'notifications.send',
    'support.manage',
    'analytics.view',
    'audit.view',
  ],
  support_admin: ['users.view', 'support.manage', 'privacy.access', 'audit.view'],
  finance_admin: [
    'subscriptions.view',
    'subscriptions.manage',
    'payments.view',
    'payments.refund',
    'plans.manage',
    'analytics.view',
    'audit.view',
  ],
  content_admin: ['categories.manage', 'announcements.manage', 'notifications.send', 'support.manage'],
  analyst: ['analytics.view', 'audit.view', 'users.view'],
};

// Initial Seed Data
const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin_super_1',
    name: 'Rupom Super Admin',
    email: 'rupomxc@gmail.com',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    permissions: ALL_ADMIN_PERMISSIONS,
    isActive: true,
    twoFactorEnabled: true,
    lastLogin: new Date().toISOString(),
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'admin_support_2',
    name: 'Karim Support Lead',
    email: 'support@jibonify.com',
    role: 'support_admin',
    permissions: ROLE_DEFAULT_PERMISSIONS.support_admin,
    isActive: true,
    twoFactorEnabled: false,
    lastLogin: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'admin_finance_3',
    name: 'Fatema Finance Head',
    email: 'finance@jibonify.com',
    role: 'finance_admin',
    permissions: ROLE_DEFAULT_PERMISSIONS.finance_admin,
    isActive: true,
    twoFactorEnabled: true,
    lastLogin: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: '2026-03-01T00:00:00Z',
  },
];

const DEFAULT_PLATFORM_USERS: PlatformUser[] = [
  {
    id: 'usr_101',
    name: 'তানভীর আহমেদ (Tanveer)',
    email: 'tanveer.bd@example.com',
    phone: '01712-345678',
    plan: 'pro_monthly',
    status: 'active',
    registeredAt: '2026-01-15T08:30:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    deviceCount: 2,
    subscriptionStatus: 'active',
    subscriptionEndsAt: '2026-10-15T00:00:00Z',
    storageUsedKB: 1420,
    appVersion: '1.2.0',
    language: 'bn',
    theme: 'dark',
    notes: ['VIP customer', 'Reported bKash sync on Sept 12 - resolved.'],
  },
  {
    id: 'usr_102',
    name: 'Sadia Islam',
    email: 'sadia.islam@example.com',
    phone: '01819-876543',
    plan: 'pro_yearly',
    status: 'active',
    registeredAt: '2026-02-01T10:00:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    deviceCount: 1,
    subscriptionStatus: 'active',
    subscriptionEndsAt: '2027-02-01T00:00:00Z',
    storageUsedKB: 2150,
    appVersion: '1.2.0',
    language: 'en',
    theme: 'dark',
  },
  {
    id: 'usr_103',
    name: 'Md. Rafiqul Hasan',
    email: 'rafiqul@example.com',
    phone: '01911-223344',
    plan: 'free',
    status: 'active',
    registeredAt: '2026-03-10T14:15:00Z',
    lastActive: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
    deviceCount: 1,
    subscriptionStatus: 'trial',
    trialEndsAt: new Date(Date.now() + 1000 * 3600 * 24 * 6).toISOString(),
    storageUsedKB: 680,
    appVersion: '1.1.8',
    language: 'bn',
    theme: 'system',
  },
  {
    id: 'usr_104',
    name: 'Nusrat Jahan',
    email: 'nusrat.j@example.com',
    phone: '01678-998877',
    plan: 'enterprise',
    status: 'active',
    registeredAt: '2026-01-20T11:00:00Z',
    lastActive: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    deviceCount: 3,
    subscriptionStatus: 'active',
    subscriptionEndsAt: '2027-01-20T00:00:00Z',
    storageUsedKB: 4120,
    appVersion: '1.2.0',
    language: 'bn',
    theme: 'dark',
    notes: ['Family accounts pack owner'],
  },
  {
    id: 'usr_105',
    name: 'Shakil Mahmud',
    email: 'shakil.m@example.com',
    phone: '01552-112233',
    plan: 'free',
    status: 'suspended',
    registeredAt: '2026-02-18T16:45:00Z',
    lastActive: '2026-08-20T09:12:00Z',
    deviceCount: 1,
    subscriptionStatus: 'expired',
    storageUsedKB: 320,
    appVersion: '1.0.5',
    language: 'bn',
    theme: 'light',
    notes: ['Suspended pending verification on 2026-08-25'],
  },
  {
    id: 'usr_106',
    name: 'Ayesha Siddiqua',
    email: 'ayesha.s@example.com',
    phone: '01799-445566',
    plan: 'pro_monthly',
    status: 'active',
    registeredAt: '2026-04-05T09:20:00Z',
    lastActive: new Date(Date.now() - 1000 * 3600 * 28).toISOString(),
    deviceCount: 1,
    subscriptionStatus: 'active',
    subscriptionEndsAt: '2026-10-05T00:00:00Z',
    storageUsedKB: 980,
    appVersion: '1.2.0',
    language: 'bn',
    theme: 'dark',
  },
];

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    nameBn: 'ফ্রি স্টার্টার',
    priceBDT: 0,
    billingCycle: 'free',
    trialDays: 0,
    features: [
      'Basic Daily Expenses & Income',
      'Up to 3 Accounts (Pocket, Cash, 1 MFS)',
      'Single Journey Outside Mode',
      'Local Storage Persistence',
      'Standard Cash Reconciliation',
    ],
    storageLimitMB: 50,
    deviceLimit: 1,
    isActive: true,
  },
  {
    id: 'pro_monthly',
    name: 'Jibonify Pro Monthly',
    nameBn: 'প্রো মাসিক প্ল্যান',
    priceBDT: 250,
    billingCycle: 'monthly',
    trialDays: 14,
    features: [
      'Unlimited Financial Accounts',
      'Unlimited Outside Journeys per Day',
      'Denomination Counter (নোট গণক)',
      'Full People Ledger & Debt Tracking',
      'Monthly & Weekly Budgets with Alerts',
      'Photo Receipt Attachments',
      'Excel / CSV & JSON Export',
      'Daily Life Financial Diary',
    ],
    isPopular: true,
    storageLimitMB: 500,
    deviceLimit: 2,
    isActive: true,
  },
  {
    id: 'pro_yearly',
    name: 'Jibonify Pro Yearly',
    nameBn: 'প্রো বাৎসরিক (২০% সাশ্রয়)',
    priceBDT: 2400,
    billingCycle: 'yearly',
    trialDays: 14,
    features: [
      'All Pro Monthly Features Included',
      '20% Yearly Discount (৳2,400 vs ৳3,000)',
      'Multi-Device Real-Time Sync',
      'Priority VIP Customer Support',
      'Advanced Multi-Year Trend Reports',
      'Automated Encrypted Cloud Backups',
    ],
    storageLimitMB: 2000,
    deviceLimit: 3,
    isActive: true,
  },
  {
    id: 'enterprise',
    name: 'Family & Business Suite',
    nameBn: 'ফ্যামিলি ও বিজনেস স্যুট',
    priceBDT: 4500,
    billingCycle: 'yearly',
    trialDays: 14,
    features: [
      'Up to 5 Family Member Profiles',
      'Shared Expense Splits & Settlements',
      'Dedicated Account Manager Support',
      'Custom Category Matrix & Tagging',
      'Unlimited High-Res Receipt Vault',
      'Early Access to AI Expense Categorization',
    ],
    storageLimitMB: 10000,
    deviceLimit: 5,
    isActive: true,
  },
];

const DEFAULT_PAYMENTS: PlatformPayment[] = [
  {
    id: 'pay_901',
    transactionId: 'TXN_BK_99281726',
    userId: 'usr_101',
    userName: 'তানভীর আহমেদ (Tanveer)',
    userEmail: 'tanveer.bd@example.com',
    amount: 250,
    currency: 'BDT',
    method: 'bkash',
    planId: 'pro_monthly',
    planName: 'Jibonify Pro Monthly',
    status: 'paid',
    date: '2026-09-15T10:14:22Z',
    invoiceNumber: 'INV-2026-09151',
  },
  {
    id: 'pay_902',
    transactionId: 'TXN_NG_44829104',
    userId: 'usr_102',
    userName: 'Sadia Islam',
    userEmail: 'sadia.islam@example.com',
    amount: 2400,
    currency: 'BDT',
    method: 'nagad',
    planId: 'pro_yearly',
    planName: 'Jibonify Pro Yearly',
    status: 'paid',
    date: '2026-09-01T15:22:11Z',
    invoiceNumber: 'INV-2026-09012',
  },
  {
    id: 'pay_903',
    transactionId: 'TXN_CRD_1109482',
    userId: 'usr_104',
    userName: 'Nusrat Jahan',
    userEmail: 'nusrat.j@example.com',
    amount: 4500,
    currency: 'BDT',
    method: 'card',
    planId: 'enterprise',
    planName: 'Family & Business Suite',
    status: 'paid',
    date: '2026-08-20T11:05:40Z',
    invoiceNumber: 'INV-2026-08203',
  },
  {
    id: 'pay_904',
    transactionId: 'TXN_BK_77491028',
    userId: 'usr_106',
    userName: 'Ayesha Siddiqua',
    userEmail: 'ayesha.s@example.com',
    amount: 250,
    currency: 'BDT',
    method: 'bkash',
    planId: 'pro_monthly',
    planName: 'Jibonify Pro Monthly',
    status: 'paid',
    date: '2026-09-05T18:40:19Z',
    invoiceNumber: 'INV-2026-09054',
  },
  {
    id: 'pay_905',
    transactionId: 'TXN_BK_33918274',
    userId: 'usr_103',
    userName: 'Md. Rafiqul Hasan',
    userEmail: 'rafiqul@example.com',
    amount: 250,
    currency: 'BDT',
    method: 'bkash',
    planId: 'pro_monthly',
    planName: 'Jibonify Pro Monthly',
    status: 'failed',
    date: '2026-09-22T08:19:02Z',
    invoiceNumber: 'INV-2026-09225',
  },
];

const DEFAULT_FEATURE_FLAGS: PlatformFeatureFlag[] = [
  {
    key: 'outside_mode',
    name: 'বাইরে বের হলাম (Outside Mode)',
    description: 'Enables real-time journey tracker with carried cash and expected balance calculations.',
    isEnabledGlobally: true,
    allowedPlans: ['free', 'pro_monthly', 'pro_yearly', 'enterprise'],
  },
  {
    key: 'daily_diary',
    name: 'দৈনিক আর্থিক ডায়েরি (Daily Life Diary)',
    description: 'Reflections, activities, and daily financial notes.',
    isEnabledGlobally: true,
    allowedPlans: ['free', 'pro_monthly', 'pro_yearly', 'enterprise'],
  },
  {
    key: 'budget_planner',
    name: 'বাজেট ও লিমিট প্ল্যানার (Monthly Budget)',
    description: 'Category thresholds with visual 50%, 75%, 90% and 100% alerts.',
    isEnabledGlobally: true,
    allowedPlans: ['pro_monthly', 'pro_yearly', 'enterprise'],
  },
  {
    key: 'savings_goals',
    name: 'সঞ্চয় লক্ষ্যমাত্রা (Savings Goals)',
    description: 'Goal progress tracker for laptops, emergency funds, and travel.',
    isEnabledGlobally: true,
    allowedPlans: ['pro_monthly', 'pro_yearly', 'enterprise'],
  },
  {
    key: 'receipt_upload',
    name: 'রসিদ ও ভাউচার ক্যামেরা আপলোড (Receipt Upload)',
    description: 'Attach photo receipts directly to expenses with gallery/camera.',
    isEnabledGlobally: true,
    allowedPlans: ['pro_monthly', 'pro_yearly', 'enterprise'],
  },
  {
    key: 'cloud_backup',
    name: 'অটোমেটেড ক্লাউড ব্যাকআপ (Automated Cloud Sync)',
    description: 'Secure encrypted background synchronization to cloud database.',
    isEnabledGlobally: true,
    allowedPlans: ['pro_yearly', 'enterprise'],
  },
  {
    key: 'ai_insights',
    name: 'এআই আর্থিক অ্যানালাইসিস (AI Financial Insights)',
    description: 'AI-assisted expense categorization, overspending diagnosis & suggestions.',
    isEnabledGlobally: false,
    allowedPlans: ['enterprise'],
  },
  {
    key: 'voice_entry',
    name: 'ভয়েস দিয়ে খরচ এন্ট্রি (Voice Fast Entry)',
    description: 'Speak in Bangla (যেমন: "চা ২০ টাকা") to instantly record expenses.',
    isEnabledGlobally: false,
    allowedPlans: ['pro_yearly', 'enterprise'],
  },
];

const DEFAULT_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: 'ann_1',
    title: 'স্বাগতম জীবনফাই ডেইলি ১.২ আপডেটে!',
    content: 'নতুন ক্যাশ ডিনমিনেশন নোট গণক এবং উন্নত ক্যালেন্ডার ভিউ এখন সক্রিয় রয়েছে। সব ডিভাইসে নিরবচ্ছিন্ন কাজ করবে।',
    type: 'feature',
    audience: 'all',
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ann_2',
    title: 'বিকাশ ও নগদ ইন্টিগ্রেশন নোটিশ',
    content: 'প্রতি শুক্রবার রাত ২টা থেকে ৩টা পর্যন্ত গেটওয়ে সার্ভার রক্ষণাবেক্ষণ করা হবে। লেনদেনে কোনো সমস্যা হলে সাপোর্ট সেন্টারে যোগাযোগ করুন।',
    type: 'maintenance',
    audience: 'premium',
    startDate: '2026-09-15T00:00:00Z',
    endDate: '2026-10-15T23:59:59Z',
    isActive: true,
    createdAt: '2026-09-15T00:00:00Z',
  },
];

const DEFAULT_NOTIFICATIONS: PlatformPushNotification[] = [
  {
    id: 'notif_1',
    title: 'আজকের দিনের হিসাব শুরু করেছেন কি?',
    message: 'সকালের উদ্বৃত্ত ক্যাশ নিশ্চিত করে আজকের দিনটি সুন্দরভাবে শুরু করুন।',
    targetSegment: 'all',
    sentAt: '2026-09-27T03:00:00Z',
    sentCount: 1240,
    deliveredCount: 1215,
    openedCount: 842,
  },
  {
    id: 'notif_2',
    title: 'আপনার প্রো ট্রায়াল মেয়াদ আর ৩ দিন বাকি',
    message: 'নির্বিঘ্নে সকল প্রিমিয়াম ফিচার উপভোগ করতে বাৎসরিক প্ল্যানে আপগ্রেড করুন এবং ২০% ছাড় পান।',
    targetSegment: 'trial',
    sentAt: '2026-09-25T11:00:00Z',
    sentCount: 310,
    deliveredCount: 305,
    openedCount: 189,
  },
];

const DEFAULT_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_501',
    ticketNumber: 'TKT-2026-8812',
    userId: 'usr_101',
    userName: 'তানভীর আহমেদ',
    userEmail: 'tanveer.bd@example.com',
    subject: 'বাসায় ফিরে ক্যাশ হিসাব মেলানোর সময় নোট সেভ হয়নি',
    description: 'আমি গতকাল রাত ৯টায় বাসায় ফিরে নগদ হিসাব মেলানোর সময় নোট লিখেছিলাম, কিন্তু সেটি ড্যাশবোর্ডে শো করছে না। অনুগ্রহ করে যাচাই করবেন।',
    category: 'bug',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'Karim Support Lead',
    createdAt: '2026-09-26T15:20:00Z',
    updatedAt: '2026-09-27T08:10:00Z',
    diagnosticInfo: {
      appVersion: '1.2.0',
      os: 'Android 14',
      deviceType: 'Samsung Galaxy A54',
      network: 'WiFi',
    },
    internalNotes: [
      {
        id: 'in_1',
        author: 'Karim Support Lead',
        text: 'Checked diagnostic info. User was in offline mode when saving. Advised to trigger manual sync.',
        createdAt: '2026-09-26T16:00:00Z',
      },
    ],
    replies: [
      {
        id: 'rep_1',
        author: 'Karim Support Lead',
        isStaff: true,
        text: 'আসসালামু আলাইকুম তানভীর সাহেব। আপনার রিপোর্টটি আমরা গ্রহণ করেছি। অনুগ্রহ করে অ্যাপের সেটিংস থেকে একবার ব্যাকআপ সিঙ্ক বাটনে চাপ দিয়ে দেখুন। আমরা সমাধানটি নিশ্চিত করছি।',
        createdAt: '2026-09-26T16:05:00Z',
      },
    ],
  },
  {
    id: 'tkt_502',
    ticketNumber: 'TKT-2026-8813',
    userId: 'usr_102',
    userName: 'Sadia Islam',
    userEmail: 'sadia.islam@example.com',
    subject: 'বাৎসরিক সাবস্ক্রিপশনের ইনভয়েস ডাউনলোড প্রয়োজন',
    description: 'অফিসে রিইম্বার্সমেন্ট সাবমিট করার জন্য সেপ্টেম্বর মাসের অফিশিয়াল ভ্যাট ইনভয়েস দরকার।',
    category: 'payment',
    priority: 'low',
    status: 'resolved',
    assignedTo: 'Fatema Finance Head',
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-24T12:30:00Z',
    replies: [
      {
        id: 'rep_2',
        author: 'Fatema Finance Head',
        isStaff: true,
        text: 'Dear Sadia, your official Tax Invoice #INV-2026-09012 has been generated and sent to your email. Thank you for choosing Jibonify Daily!',
        createdAt: '2026-09-24T12:30:00Z',
      },
    ],
  },
  {
    id: 'tkt_503',
    ticketNumber: 'TKT-2026-8814',
    userId: 'usr_105',
    userName: 'Shakil Mahmud',
    userEmail: 'shakil.m@example.com',
    subject: 'অ্যাকাউন্ট ভেরিফিকেশন ও সাসপেনশন রিভিউ',
    description: 'আমার অ্যাকাউন্ট কেন সাসপেন্ড দেখানো হচ্ছে জানতে চাই। কোনো অনিচ্ছাকৃত ভুলের কারণে হলে অনুগ্রহ করে রিভিউ করবেন।',
    category: 'account',
    priority: 'high',
    status: 'open',
    createdAt: '2026-09-27T02:15:00Z',
    updatedAt: '2026-09-27T02:15:00Z',
  },
];

const DEFAULT_ERROR_LOGS: SystemErrorLog[] = [
  {
    id: 'err_1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    module: 'MFS Gateway (bKash)',
    severity: 'warning',
    message: 'MFS webhook timeout after 15000ms. Retry queue active.',
    appVersion: '1.2.0',
    platform: 'Android',
    status: 'investigating',
    count: 3,
  },
  {
    id: 'err_2',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    module: 'PWA Cache Sync',
    severity: 'warning',
    message: 'CacheStorage quota queried. 88% remaining on client device.',
    appVersion: '1.2.0',
    platform: 'Web',
    status: 'resolved',
    count: 14,
  },
  {
    id: 'err_3',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    module: 'Receipt Image Compression',
    severity: 'error',
    message: 'Canvas drawImage memory spike handled safely. Falling back to 1080p JPEG.',
    appVersion: '1.1.9',
    platform: 'iOS',
    status: 'resolved',
    count: 2,
  },
];

const DEFAULT_APP_VERSIONS: AppReleaseVersion[] = [
  {
    id: 'ver_1',
    version: '1.2.0',
    platform: 'android',
    releaseDate: '2026-09-20',
    minSupportedVersion: '1.0.0',
    isForceUpdate: false,
    releaseNotes: 'Added cash denomination counter, improved outside mode speed, tablet sidebar layout.',
  },
  {
    id: 'ver_2',
    version: '1.1.8',
    platform: 'ios',
    releaseDate: '2026-09-18',
    minSupportedVersion: '1.0.0',
    isForceUpdate: false,
    releaseNotes: 'Fixed safe-area bottom padding, smooth datepicker on iOS Safari, improved receipt viewer.',
  },
  {
    id: 'ver_3',
    version: '1.2.0',
    platform: 'web',
    releaseDate: '2026-09-25',
    minSupportedVersion: '1.0.0',
    isForceUpdate: false,
    releaseNotes: 'PWA install button update, responsive multi-device support, offline local storage engine.',
  },
];

const DEFAULT_PLATFORM_CONFIG: GlobalPlatformConfig = {
  appName: 'Jibonify Daily',
  tagline: 'Your Money. Your Day. Your Complete Hisab.',
  supportEmail: 'support@jibonify.com',
  maintenanceMode: false,
  maintenanceMessage: 'System is undergoing scheduled maintenance for cloud sync upgrade. Normal access will resume shortly.',
  maintenanceEstimatedEnd: '2026-09-28T04:00:00Z',
  defaultTrialDays: 14,
  gracePeriodDays: 3,
  defaultCurrency: 'BDT (৳)',
  allowedPaymentMethods: {
    bkash: true,
    nagad: true,
    rocket: true,
    card: true,
    bank: true,
  },
};

export const adminDb = {
  // Session & Auth
  getActiveAdminSession: (): AdminUser | null => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_SESSION);
      if (data) return JSON.parse(data);
      // Default to Super Admin so that prompt requirements work immediately
      const defaultUser = DEFAULT_ADMIN_USERS[0];
      localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return DEFAULT_ADMIN_USERS[0];
    }
  },
  setActiveAdminSession: (user: AdminUser | null) => {
    if (user) {
      localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEYS.ADMIN_SESSION);
    }
  },

  // Admin Users & RBAC
  getAdminUsers: (): AdminUser[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_USERS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_USERS, JSON.stringify(DEFAULT_ADMIN_USERS));
      return DEFAULT_ADMIN_USERS;
    } catch {
      return DEFAULT_ADMIN_USERS;
    }
  },
  saveAdminUsers: (users: AdminUser[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
  },
  addAdminUser: (user: AdminUser) => {
    const list = adminDb.getAdminUsers();
    list.push(user);
    adminDb.saveAdminUsers(list);
  },
  updateAdminUser: (user: AdminUser) => {
    const list = adminDb.getAdminUsers();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      list[idx] = user;
      adminDb.saveAdminUsers(list);
    }
  },

  // Platform Users Directory
  getPlatformUsers: (): PlatformUser[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.PLATFORM_USERS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.PLATFORM_USERS, JSON.stringify(DEFAULT_PLATFORM_USERS));
      return DEFAULT_PLATFORM_USERS;
    } catch {
      return DEFAULT_PLATFORM_USERS;
    }
  },
  savePlatformUsers: (users: PlatformUser[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.PLATFORM_USERS, JSON.stringify(users));
  },
  updatePlatformUser: (user: PlatformUser) => {
    const list = adminDb.getPlatformUsers();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      list[idx] = user;
      adminDb.savePlatformUsers(list);
    }
  },
  deletePlatformUser: (userId: string) => {
    const list = adminDb.getPlatformUsers().filter((u) => u.id !== userId);
    adminDb.savePlatformUsers(list);
  },

  // Plans
  getPlans: (): SubscriptionPlan[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.PLANS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
      return DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  },
  savePlans: (plans: SubscriptionPlan[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },

  // Payments
  getPayments: (): PlatformPayment[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.PAYMENTS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.PAYMENTS, JSON.stringify(DEFAULT_PAYMENTS));
      return DEFAULT_PAYMENTS;
    } catch {
      return DEFAULT_PAYMENTS;
    }
  },
  savePayments: (payments: PlatformPayment[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  // Feature Flags
  getFeatureFlags: (): PlatformFeatureFlag[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.FEATURES);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.FEATURES, JSON.stringify(DEFAULT_FEATURE_FLAGS));
      return DEFAULT_FEATURE_FLAGS;
    } catch {
      return DEFAULT_FEATURE_FLAGS;
    }
  },
  saveFeatureFlags: (flags: PlatformFeatureFlag[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.FEATURES, JSON.stringify(flags));
  },

  // Announcements
  getAnnouncements: (): PlatformAnnouncement[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.ANNOUNCEMENTS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
      return DEFAULT_ANNOUNCEMENTS;
    } catch {
      return DEFAULT_ANNOUNCEMENTS;
    }
  },
  saveAnnouncements: (ann: PlatformAnnouncement[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(ann));
  },

  // Notifications
  getNotifications: (): PlatformPushNotification[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },
  saveNotifications: (notifs: PlatformPushNotification[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  // Support Tickets
  getSupportTickets: (): SupportTicket[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.SUPPORT_TICKETS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(DEFAULT_SUPPORT_TICKETS));
      return DEFAULT_SUPPORT_TICKETS;
    } catch {
      return DEFAULT_SUPPORT_TICKETS;
    }
  },
  saveSupportTickets: (tickets: SupportTicket[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));
  },

  // System Error Logs
  getErrorLogs: (): SystemErrorLog[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.ERROR_LOGS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.ERROR_LOGS, JSON.stringify(DEFAULT_ERROR_LOGS));
      return DEFAULT_ERROR_LOGS;
    } catch {
      return DEFAULT_ERROR_LOGS;
    }
  },
  saveErrorLogs: (logs: SystemErrorLog[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.ERROR_LOGS, JSON.stringify(logs));
  },

  // App Versions
  getAppVersions: (): AppReleaseVersion[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.APP_VERSIONS);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.APP_VERSIONS, JSON.stringify(DEFAULT_APP_VERSIONS));
      return DEFAULT_APP_VERSIONS;
    } catch {
      return DEFAULT_APP_VERSIONS;
    }
  },
  saveAppVersions: (versions: AppReleaseVersion[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.APP_VERSIONS, JSON.stringify(versions));
  },

  // Global Platform Config
  getPlatformConfig: (): GlobalPlatformConfig => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.PLATFORM_CONFIG);
      if (data) return JSON.parse(data);
      localStorage.setItem(ADMIN_STORAGE_KEYS.PLATFORM_CONFIG, JSON.stringify(DEFAULT_PLATFORM_CONFIG));
      return DEFAULT_PLATFORM_CONFIG;
    } catch {
      return DEFAULT_PLATFORM_CONFIG;
    }
  },
  savePlatformConfig: (config: GlobalPlatformConfig) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.PLATFORM_CONFIG, JSON.stringify(config));
  },

  // Privacy Shield Sessions (Temporary Authorized Support Access)
  getPrivilegedSessions: (): PrivilegedAccessSession[] => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEYS.PRIVILEGED_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePrivilegedSessions: (sessions: PrivilegedAccessSession[]) => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.PRIVILEGED_SESSIONS, JSON.stringify(sessions));
  },
  getActivePrivilegedSession: (userId?: string): PrivilegedAccessSession | null => {
    const sessions = adminDb.getPrivilegedSessions();
    const now = new Date().toISOString();
    return (
      sessions.find(
        (s) => s.isActive && s.expiresAt > now && (!userId || s.userId === userId)
      ) || null
    );
  },
  startPrivilegedSession: (
    admin: AdminUser,
    user: PlatformUser,
    reason: string,
    ticketId?: string,
    durationMinutes: number = 15
  ): PrivilegedAccessSession => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    const session: PrivilegedAccessSession = {
      id: `priv_sess_${Date.now()}`,
      adminId: admin.id,
      adminName: admin.name,
      userId: user.id,
      userName: user.name,
      reason,
      ticketId,
      startedAt: now.toISOString(),
      expiresAt,
      isActive: true,
    };
    const list = adminDb.getPrivilegedSessions();
    list.unshift(session);
    adminDb.savePrivilegedSessions(list);
    return session;
  },
  endPrivilegedSession: (sessionId: string) => {
    const list = adminDb.getPrivilegedSessions().map((s) =>
      s.id === sessionId ? { ...s, isActive: false } : s
    );
    adminDb.savePrivilegedSessions(list);
  },
};
