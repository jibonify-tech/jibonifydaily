import {
  Account,
  AppSettings,
  AuditCategory,
  AuditSeverity,
  AuditTargetEntity,
  Budget,
  Category,
  DailyClosing,
  DaySession,
  DebtRecord,
  DiaryEntry,
  EmergencyFund,
  NotificationItem,
  OutsideSession,
  Person,
  RecurringTransaction,
  Reminder,
  SavingsGoal,
  SharedExpense,
  SystemAuditLog,
  Transaction,
  UserProfile,
} from '../types';
import { defaultCategories } from '../i18n/translations';
import { auditService } from './auditService';

const STORAGE_KEYS = {
  PROFILE: 'jibonify_profile_v1',
  SETTINGS: 'jibonify_settings_v1',
  ACCOUNTS: 'jibonify_accounts_v1',
  CATEGORIES: 'jibonify_categories_v1',
  TRANSACTIONS: 'jibonify_transactions_v1',
  DAY_SESSIONS: 'jibonify_day_sessions_v1',
  OUTSIDE_SESSIONS: 'jibonify_outside_sessions_v1',
  DAILY_CLOSINGS: 'jibonify_daily_closings_v1',
  PEOPLE: 'jibonify_people_v1',
  DEBTS: 'jibonify_debts_v1',
  BUDGETS: 'jibonify_budgets_v1',
  RECURRING: 'jibonify_recurring_v1',
  REMINDERS: 'jibonify_reminders_v1',
  DIARIES: 'jibonify_diaries_v1',
  SAVINGS_GOALS: 'jibonify_savings_goals_v1',
  EMERGENCY_FUND: 'jibonify_emergency_fund_v1',
  SHARED_EXPENSES: 'jibonify_shared_expenses_v1',
  NOTIFICATIONS: 'jibonify_notifications_v1',
  AUDIT_LOGS: 'jibonify_audit_logs_v1',
};

// Initial default accounts
export const initialAccounts: Account[] = [
  {
    id: 'acc_pocket',
    name: 'পকেট ক্যাশ (Pocket Cash)',
    type: 'cash',
    subType: 'pocket',
    balance: 2450,
    initialBalance: 2450,
    color: '#059669',
    icon: 'Wallet',
    isDefaultPocket: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_home_cash',
    name: 'বাসার ড্রয়ার ক্যাশ (Home Cash)',
    type: 'cash',
    subType: 'home',
    balance: 15000,
    initialBalance: 15000,
    color: '#10b981',
    icon: 'Home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_bkash',
    name: 'বিকাশ (bKash)',
    type: 'mobile_wallet',
    subType: 'bkash',
    balance: 8520,
    initialBalance: 8520,
    accountNumber: '017XXXXXXXX',
    institutionName: 'bKash Limited',
    color: '#e11d48',
    icon: 'Smartphone',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_nagad',
    name: 'নগদ (Nagad)',
    type: 'mobile_wallet',
    subType: 'nagad',
    balance: 3200,
    initialBalance: 3200,
    accountNumber: '018XXXXXXXX',
    institutionName: 'Nagad Post Office',
    color: '#f97316',
    icon: 'Smartphone',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_bank_brac',
    name: 'ব্র্যাক ব্যাংক (BRAC Bank)',
    type: 'bank',
    subType: 'savings',
    balance: 84600,
    initialBalance: 84600,
    accountNumber: '1501XXXXXXXX001',
    institutionName: 'BRAC Bank PLC',
    color: '#0284c7',
    icon: 'Building',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_city_card',
    name: 'সিটি ব্যাংক ভিসা কার্ড (Credit Card)',
    type: 'card',
    subType: 'credit',
    balance: -4500, // Used limit
    initialBalance: 0,
    accountNumber: '4214-XXXX-XXXX-8920',
    institutionName: 'City Bank PLC',
    color: '#7c3aed',
    icon: 'CreditCard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialProfile: UserProfile = {
  name: 'তানভীর আহমেদ (Tanveer)',
  email: 'rupomxc@gmail.com',
  phone: '01712-345678',
  role: 'admin',
  pinLockEnabled: false,
  pinCode: '1234',
  isLoggedIn: true,
  lastLogin: new Date().toISOString(),
};

export const initialSettings: AppSettings = {
  language: 'bn',
  currency: 'BDT',
  currencySymbol: '৳',
  theme: 'dark',
  dateFormat: 'YYYY-MM-DD',
  enableOutsidePrompt: true,
  autoReconcileThreshold: 0,
  numberFormat: 'bengali',
  weekStartDay: 'saturday',
  defaultPocketCash: 2000,
  highExpenseAlertThreshold: 2500,
  autoCreateReconciliationAdjustment: true,
  privacyMode: false,
  autoLockMinutes: 0,
  maintenanceMode: false,
};

// Safe storage wrapper
export const db = {
  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : initialProfile;
    } catch {
      return initialProfile;
    }
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : initialSettings;
    } catch {
      return initialSettings;
    }
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getAccounts: (): Account[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
      return initialAccounts;
    } catch {
      return initialAccounts;
    }
  },
  saveAccounts: (accounts: Account[]) => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
      return defaultCategories;
    } catch {
      return defaultCategories;
    }
  },
  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveTransactions: (txs: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  getDaySessions: (): DaySession[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDaySessions: (sessions: DaySession[]) => {
    localStorage.setItem(STORAGE_KEYS.DAY_SESSIONS, JSON.stringify(sessions));
  },

  getOutsideSessions: (): OutsideSession[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OUTSIDE_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveOutsideSessions: (sessions: OutsideSession[]) => {
    localStorage.setItem(STORAGE_KEYS.OUTSIDE_SESSIONS, JSON.stringify(sessions));
  },

  getDailyClosings: (): DailyClosing[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_CLOSINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDailyClosings: (closings: DailyClosing[]) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_CLOSINGS, JSON.stringify(closings));
  },

  getPeople: (): Person[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PEOPLE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePeople: (people: Person[]) => {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  },

  getDebts: (): DebtRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEBTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDebts: (debts: DebtRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  },

  getBudgets: (): Budget[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveBudgets: (budgets: Budget[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getRecurring: (): RecurringTransaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveRecurring: (recurring: RecurringTransaction[]) => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  },

  getReminders: (): Reminder[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveReminders: (reminders: Reminder[]) => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getDiaries: (): DiaryEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIARIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDiaries: (diaries: DiaryEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.DIARIES, JSON.stringify(diaries));
  },

  getSavingsGoals: (): SavingsGoal[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSavingsGoals: (goals: SavingsGoal[]) => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  },

  getEmergencyFund: (): EmergencyFund => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY_FUND);
      return data
        ? JSON.parse(data)
        : { targetAmount: 100000, currentAmount: 45000, updatedAt: new Date().toISOString() };
    } catch {
      return { targetAmount: 100000, currentAmount: 45000, updatedAt: new Date().toISOString() };
    }
  },
  saveEmergencyFund: (fund: EmergencyFund) => {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_FUND, JSON.stringify(fund));
  },

  getSharedExpenses: (): SharedExpense[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHARED_EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSharedExpenses: (expenses: SharedExpense[]) => {
    localStorage.setItem(STORAGE_KEYS.SHARED_EXPENSES, JSON.stringify(expenses));
  },

  getNotifications: (): NotificationItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveNotifications: (notifications: NotificationItem[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },
  markNotificationRead: (id: string) => {
    const list = db.getNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
    db.saveNotifications(list);
  },

  getDeletedTransactions: (): Transaction[] => {
    return db.getTransactions().filter((t) => t.isDeleted);
  },
  restoreTransaction: (id: string) => {
    const txs = db.getTransactions().map((t) => (t.id === id ? { ...t, isDeleted: false } : t));
    db.saveTransactions(txs);
    db.recalculateAccountBalances();
  },
  permanentDeleteTransaction: (id: string) => {
    const txs = db.getTransactions().filter((t) => t.id !== id);
    db.saveTransactions(txs);
    db.recalculateAccountBalances();
  },
  emptyTrash: () => {
    const txs = db.getTransactions().filter((t) => !t.isDeleted);
    db.saveTransactions(txs);
    db.recalculateAccountBalances();
  },

  // Calculate current account balances accurately from initial balance + all transactions
  recalculateAccountBalances: () => {
    const accounts = db.getAccounts();
    const transactions = db.getTransactions().filter((t) => !t.isDeleted);

    const balanceMap: Record<string, number> = {};
    accounts.forEach((acc) => {
      balanceMap[acc.id] = acc.initialBalance || 0;
    });

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'expense') {
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] -= amt;
        }
      } else if (tx.type === 'income') {
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] += amt;
        }
      } else if (tx.type === 'transfer') {
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] -= amt;
        }
        if (tx.toAccountId && balanceMap[tx.toAccountId] !== undefined) {
          balanceMap[tx.toAccountId] += amt;
        }
      } else if (tx.type === 'lend') {
        // Lending decreases my account balance
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] -= amt;
        }
      } else if (tx.type === 'borrow') {
        // Borrowing increases my account balance
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] += amt;
        }
      } else if (tx.type === 'repayment_received') {
        // Someone repaid me -> increases my account
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] += amt;
        }
      } else if (tx.type === 'repayment_given') {
        // I repaid someone -> decreases my account
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] -= amt;
        }
      } else if (tx.type === 'adjustment') {
        // Can be positive or negative
        if (balanceMap[tx.accountId] !== undefined) {
          balanceMap[tx.accountId] += amt;
        }
      }
    });

    const updated = accounts.map((acc) => ({
      ...acc,
      balance: balanceMap[acc.id] ?? acc.balance,
      updatedAt: new Date().toISOString(),
    }));

    db.saveAccounts(updated);
    return updated;
  },

  // Add transaction and automatically recalculate
  addTransaction: (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const txs = db.getTransactions();
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    txs.unshift(newTx);
    db.saveTransactions(txs);
    db.recalculateAccountBalances();
    return newTx;
  },

  deleteTransaction: (id: string) => {
    const txs = db.getTransactions().map((t) => (t.id === id ? { ...t, isDeleted: true } : t));
    db.saveTransactions(txs);
    db.recalculateAccountBalances();
  },

  // Seed rich demo data
  seedDemoData: () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBefore = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

    // Seed People
    const demoPeople: Person[] = [
      {
        id: 'p_rahim',
        name: 'রহিম উল্লাহ (Rahim)',
        phone: '01819-234567',
        address: 'মিরপুর-১০, ঢাকা',
        notes: 'অফিস কলিগ',
        totalLent: 1500,
        totalBorrowed: 0,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: 'p_karim',
        name: 'করিম ভাই (Karim)',
        phone: '01711-987654',
        address: 'ধানমন্ডি, ঢাকা',
        notes: 'ব্যবসায়িক পার্টনার',
        totalLent: 0,
        totalBorrowed: 5000,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
      {
        id: 'p_shakil',
        name: 'শাকিল আহমেদ (Shakil)',
        phone: '01912-887766',
        address: 'উত্তরা সেক্টর ৭',
        notes: 'বিশ্ববিদ্যালয়ের বন্ধু',
        totalLent: 3000,
        totalBorrowed: 0,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];
    db.savePeople(demoPeople);

    // Seed Debts
    const demoDebts: DebtRecord[] = [
      {
        id: 'debt_1',
        personId: 'p_rahim',
        type: 'lend',
        amount: 1500,
        paidAmount: 500,
        remainingAmount: 1000,
        date: yesterday,
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        reason: 'মেডিকেল ইমার্জেন্সি ঋণ',
        isFullyPaid: false,
        repayments: [
          {
            id: 'rep_1',
            amount: 500,
            date: today,
            accountId: 'acc_pocket',
            note: 'নগদে ৫০০ টাকা ফেরত দিলেন',
          },
        ],
        createdAt: yesterday,
      },
      {
        id: 'debt_2',
        personId: 'p_karim',
        type: 'borrow',
        amount: 5000,
        paidAmount: 2000,
        remainingAmount: 3000,
        date: dayBefore,
        dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
        reason: 'ল্যাপটপ মেরামতের জন্য ধার',
        isFullyPaid: false,
        repayments: [
          {
            id: 'rep_2',
            amount: 2000,
            date: yesterday,
            accountId: 'acc_bkash',
            note: 'বিকাশে ২০০০ টাকা দিয়েছি',
          },
        ],
        createdAt: dayBefore,
      },
    ];
    db.saveDebts(demoDebts);

    // Seed Day Sessions
    const demoDaySessions: DaySession[] = [
      {
        id: 'day_' + today,
        date: today,
        startTime: '08:00',
        isStarted: true,
        isClosed: false,
        openingCash: 3500,
        openingBank: 84600,
        openingWallet: 11720,
        openingTotal: 99820,
        accountSnapshots: [
          { accountId: 'acc_pocket', accountName: 'পকেট ক্যাশ', balance: 3500 },
          { accountId: 'acc_bkash', accountName: 'বিকাশ', balance: 8520 },
          { accountId: 'acc_nagad', accountName: 'নগদ', balance: 3200 },
          { accountId: 'acc_bank_brac', accountName: 'ব্র্যাক ব্যাংক', balance: 84600 },
        ],
        notes: 'সকালে বাসা থেকে বের হওয়ার সময় হিসাব নিশ্চিত করেছি।',
      },
      {
        id: 'day_' + yesterday,
        date: yesterday,
        startTime: '07:30',
        endTime: '22:45',
        isStarted: true,
        isClosed: true,
        openingCash: 4200,
        openingBank: 84600,
        openingWallet: 10500,
        openingTotal: 99300,
        accountSnapshots: [],
        notes: 'গতকাল সারাদিন অফিস ও মিটিংয়ে ছিলাম।',
      },
    ];
    db.saveDaySessions(demoDaySessions);

    // Seed Outside Session for Today
    const demoOutsideSessions: OutsideSession[] = [
      {
        id: 'out_' + today,
        daySessionId: 'day_' + today,
        date: today,
        startTime: '08:30',
        isActive: true,
        destination: 'কারওয়ান বাজার অফিস ও ধানমন্ডি মিটিং',
        purpose: 'অফিস মিটিং ও ক্লায়েন্ট প্রেজেন্টেশন',
        transportType: 'মেট্রোরেল ও রিকশা',
        cashTaken: 2000,
        additionalCashTaken: 500,
        notes: 'পকেটে ২৫০০ টাকা নিয়ে বের হয়েছিলাম।',
      },
      {
        id: 'out_' + yesterday,
        daySessionId: 'day_' + yesterday,
        date: yesterday,
        startTime: '09:00',
        endTime: '19:30',
        isActive: false,
        destination: 'গুলশান-২ বাণিজ্যিক এলাকা',
        purpose: 'অফিস কাজ ও টিম লাঞ্চ',
        transportType: 'উবার ও রিকশা',
        cashTaken: 3000,
        expectedCashAtReturn: 1950,
        actualCashAtReturn: 1950,
        cashDifference: 0,
        reconciliationStatus: 'matched',
        differenceReason: 'হিসাব সম্পূর্ণ মিলেছে',
        notes: 'সব হিসাব ঠিকঠাক ছিল।',
      },
    ];
    db.saveOutsideSessions(demoOutsideSessions);

    // Seed Budgets
    const currentMonth = today.slice(0, 7);
    const demoBudgets: Budget[] = [
      { id: 'b_food', categoryId: 'cat_food', monthlyLimit: 8000, alertThreshold: 80, month: currentMonth },
      { id: 'b_transport', categoryId: 'cat_transport', monthlyLimit: 4000, alertThreshold: 80, month: currentMonth },
      { id: 'b_shopping', categoryId: 'cat_shopping', monthlyLimit: 5000, alertThreshold: 75, month: currentMonth },
      { id: 'b_bills', categoryId: 'cat_bills', monthlyLimit: 3500, alertThreshold: 90, month: currentMonth },
    ];
    db.saveBudgets(demoBudgets);

    // Seed Recurring Reminders
    const demoRecurring: RecurringTransaction[] = [
      {
        id: 'rec_rent',
        title: 'বাসা ভাড়া (House Rent)',
        amount: 18000,
        type: 'expense',
        categoryId: 'cat_rent',
        accountId: 'acc_bank_brac',
        frequency: 'monthly',
        startDate: '2026-09-01',
        nextDueDate: '2026-10-01',
        isActive: true,
        autoRecord: false,
        description: 'মাসের শুরুতে বাড়িওয়ালার ব্যাংক অ্যাকাউন্টে পাঠাতে হবে',
      },
      {
        id: 'rec_wifi',
        title: 'ইন্টারনেট বিল (Carnival Internet)',
        amount: 1050,
        type: 'expense',
        categoryId: 'cat_internet',
        accountId: 'acc_bkash',
        frequency: 'monthly',
        startDate: '2026-09-05',
        nextDueDate: '2026-10-05',
        isActive: true,
        autoRecord: true,
        description: 'বিকাশ পে বিল',
      },
    ];
    db.saveRecurring(demoRecurring);

    // Seed Transactions
    const demoTxs: Transaction[] = [
      {
        id: 'tx_01',
        type: 'expense',
        amount: 40,
        accountId: 'acc_pocket',
        categoryId: 'cat_tea',
        outsideSessionId: 'out_' + today,
        date: today,
        time: '08:45',
        description: 'সকালের স্পেশাল চা ও বিস্কুট',
        note: 'মেট্রো স্টেশনের সামনে',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_02',
        type: 'expense',
        amount: 80,
        accountId: 'acc_pocket',
        categoryId: 'cat_transport',
        outsideSessionId: 'out_' + today,
        date: today,
        time: '09:15',
        description: 'মেট্রোরেল টিকিট (উত্তরা থেকে সচিবালয়)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_03',
        type: 'expense',
        amount: 220,
        accountId: 'acc_pocket',
        categoryId: 'cat_lunch',
        outsideSessionId: 'out_' + today,
        date: today,
        time: '13:30',
        description: 'অফিস ক্যাফেটেরিয়ায় দুপুরের খাবার (ভাত, মাছ ও ডাল)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_04',
        type: 'expense',
        amount: 60,
        accountId: 'acc_pocket',
        categoryId: 'cat_transport',
        outsideSessionId: 'out_' + today,
        date: today,
        time: '14:20',
        description: 'রিকশা ভাড়া কারওয়ান বাজার থেকে ফার্মগেট',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_05',
        type: 'repayment_received',
        amount: 500,
        accountId: 'acc_pocket',
        personId: 'p_rahim',
        outsideSessionId: 'out_' + today,
        date: today,
        time: '15:10',
        description: 'রহিম উল্লাহর থেকে পূর্বের ঋণের নগদ ৫০০ টাকা ফেরত',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_06',
        type: 'transfer',
        amount: 1000,
        accountId: 'acc_bkash',
        toAccountId: 'acc_pocket',
        date: today,
        time: '16:00',
        description: 'বিকাশ ক্যাশ-আউট করে পকেটে ক্যাশ নিলাম',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_07',
        type: 'income',
        amount: 15000,
        accountId: 'acc_bank_brac',
        categoryId: 'cat_freelance',
        date: yesterday,
        time: '11:00',
        description: 'ইউআই/ইউএক্স প্রজেক্ট মাইলস্টোন পেমেন্ট',
        note: 'কানাডিয়ান ক্লায়েন্ট ইনভয়েস #104',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'tx_08',
        type: 'expense',
        amount: 850,
        accountId: 'acc_bkash',
        categoryId: 'cat_bazar',
        date: yesterday,
        time: '18:40',
        description: 'স্বপ্ন সুপারশপ থেকে ডিম, ফলমূল ও দুধ কেনা',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'tx_09',
        type: 'expense',
        amount: 200,
        accountId: 'acc_nagad',
        categoryId: 'cat_mobile',
        date: yesterday,
        time: '10:15',
        description: 'গ্রামীণফোন মাসিক ডাটা ও মিনিট প্যাক রিচার্জ',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    db.saveTransactions(demoTxs);

    // Seed Diaries
    const demoDiaries: DiaryEntry[] = [
      {
        id: 'diary_' + yesterday,
        date: yesterday,
        activities: 'অফিস মিটিং, নতুন ডিজাইন স্প্রিন্ট শুরু এবং বিকেলে ক্লায়েন্টের সাথে অনলাইন কল।',
        placesVisited: 'বাসা → অফিস (গুলশান) → স্বপ্ন সুপারশপ → বাসা',
        financialReflections: 'গতকাল খরচ খুব নিয়ন্ত্রিত ছিল। ফ্রিল্যান্সিং পেমেন্ট আসার কারণে সঞ্চয় বৃদ্ধি পেয়েছে।',
        rating: 5,
        updatedAt: yesterday,
      },
    ];
    db.saveDiaries(demoDiaries);

    // Seed Savings Goals
    const demoGoals: SavingsGoal[] = [
      {
        id: 'goal_laptop',
        title: 'নতুন ম্যাকবুক / ল্যাপটপ কেনা',
        targetAmount: 80000,
        currentAmount: 32000,
        targetDate: '2026-12-31',
        category: 'ইলেকট্রনিক্স',
        notes: 'ফ্রিল্যান্সিং কাজের সুবিধার জন্য',
        icon: 'Laptop',
        color: '#3b82f6',
        isCompleted: false,
        contributions: [
          { id: 'c_1', amount: 20000, date: dayBefore, accountId: 'acc_bank_brac', note: 'প্রথম কিস্তি' },
          { id: 'c_2', amount: 12000, date: yesterday, accountId: 'acc_bkash', note: 'ফ্রিল্যান্সিং প্রজেক্ট বোনাস' },
        ],
        createdAt: dayBefore,
        updatedAt: yesterday,
      },
      {
        id: 'goal_travel',
        title: 'পরিবার নিয়ে কক্সবাজার ভ্রমণ',
        targetAmount: 40000,
        currentAmount: 18500,
        targetDate: '2026-11-15',
        category: 'ভ্রমণ',
        notes: 'সেন্টমার্টিন ও কক্সবাজার ৩ দিনের ট্রিপ',
        icon: 'Palmtree',
        color: '#10b981',
        isCompleted: false,
        contributions: [
          { id: 'c_3', amount: 10000, date: dayBefore, accountId: 'acc_bank_brac' },
          { id: 'c_4', amount: 8500, date: today, accountId: 'acc_home_cash' },
        ],
        createdAt: dayBefore,
        updatedAt: today,
      },
    ];
    db.saveSavingsGoals(demoGoals);

    // Seed Emergency Fund
    db.saveEmergencyFund({
      targetAmount: 100000,
      currentAmount: 45000,
      notes: '৩ মাসের পারিবারিক জরুরি নিরাপত্তা ফান্ড',
      updatedAt: today,
    });

    // Seed Shared Expenses (Split bill)
    const demoShared: SharedExpense[] = [
      {
        id: 'split_dinner_1',
        totalAmount: 1800,
        description: 'পানসী রেস্তোরাঁ রাতের খাবার (Dinner with colleagues)',
        paidByAccountId: 'acc_bkash',
        myShare: 600,
        splits: [
          { personId: 'p_karim', personName: 'করিম চৌধুরী (Karim)', amount: 600, isSettled: false },
          { personId: 'p_rahim', personName: 'রহিম উল্লাহ (Rahim)', amount: 600, isSettled: true, settledAt: today },
        ],
        date: yesterday,
        createdAt: yesterday,
      },
    ];
    db.saveSharedExpenses(demoShared);

    // Seed Notifications
    const demoNotifications: NotificationItem[] = [
      {
        id: 'notif_1',
        title: 'ওয়াইফাই বিল রিমাইন্ডার',
        message: 'আগামীকাল কার্নেল ওয়াইফাই ইন্টারনেটের ৳১,০০০ বিল পরিশোধের শেষ তারিখ।',
        type: 'reminder',
        isRead: false,
        date: today,
        linkTab: 'reminders',
      },
      {
        id: 'notif_2',
        title: 'বাজেট সতর্কতা: খাবার খাত',
        message: 'খাবার ক্যাটাগরিতে মাসিক বাজেটের ৮২% ইতিমধ্যে খরচ হয়ে গেছে।',
        type: 'budget',
        isRead: false,
        date: today,
        linkTab: 'budget',
      },
      {
        id: 'notif_3',
        title: 'সকাল বেলার হিসাব নিশ্চিত করুন',
        message: 'আজকের দিনের হিসাব সফলভাবে শুরু হয়েছে। পকেট ক্যাশ: ৳২,৪৫০।',
        type: 'system',
        isRead: true,
        date: today,
        linkTab: 'today',
      },
    ];
    db.saveNotifications(demoNotifications);

    // Recalculate
    db.recalculateAccountBalances();
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DAY_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.OUTSIDE_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_CLOSINGS);
    localStorage.removeItem(STORAGE_KEYS.PEOPLE);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.DIARIES);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS_GOALS);
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_FUND);
    localStorage.removeItem(STORAGE_KEYS.SHARED_EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
  },

  exportAllDataJSON: () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: db.getProfile(),
      settings: db.getSettings(),
      accounts: db.getAccounts(),
      categories: db.getCategories(),
      transactions: db.getTransactions(),
      daySessions: db.getDaySessions(),
      outsideSessions: db.getOutsideSessions(),
      dailyClosings: db.getDailyClosings(),
      people: db.getPeople(),
      debts: db.getDebts(),
      budgets: db.getBudgets(),
      recurring: db.getRecurring(),
      reminders: db.getReminders(),
      diaries: db.getDiaries(),
      savingsGoals: db.getSavingsGoals(),
      emergencyFund: db.getEmergencyFund(),
      sharedExpenses: db.getSharedExpenses(),
      notifications: db.getNotifications(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllDataJSON: (jsonStr: string) => {
    const parsed = JSON.parse(jsonStr);
    if (parsed.accounts) db.saveAccounts(parsed.accounts);
    if (parsed.categories) db.saveCategories(parsed.categories);
    if (parsed.transactions) db.saveTransactions(parsed.transactions);
    if (parsed.daySessions) db.saveDaySessions(parsed.daySessions);
    if (parsed.outsideSessions) db.saveOutsideSessions(parsed.outsideSessions);
    if (parsed.dailyClosings) db.saveDailyClosings(parsed.dailyClosings);
    if (parsed.people) db.savePeople(parsed.people);
    if (parsed.debts) db.saveDebts(parsed.debts);
    if (parsed.budgets) db.saveBudgets(parsed.budgets);
    if (parsed.recurring) db.saveRecurring(parsed.recurring);
    if (parsed.reminders) db.saveReminders(parsed.reminders);
    if (parsed.diaries) db.saveDiaries(parsed.diaries);
    if (parsed.savingsGoals) db.saveSavingsGoals(parsed.savingsGoals);
    if (parsed.emergencyFund) db.saveEmergencyFund(parsed.emergencyFund);
    if (parsed.sharedExpenses) db.saveSharedExpenses(parsed.sharedExpenses);
    if (parsed.notifications) db.saveNotifications(parsed.notifications);
    db.recalculateAccountBalances();
  },

  exportCSVTransactions: (): string => {
    const txs = db.getTransactions().filter((t) => !t.isDeleted);
    const accounts = db.getAccounts();
    const categories = db.getCategories();
    const accMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.nameBn + ' / ' + c.nameEn]));

    const headers = ['ID', 'Date', 'Time', 'Type', 'Amount (BDT)', 'Account', 'Category', 'Description', 'Note'];
    const rows = txs.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type,
      t.amount,
      `"${accMap[t.accountId] || t.accountId}"`,
      `"${catMap[t.categoryId || ''] || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  // --- Audit Logs ---
  getAuditLogs: (): SystemAuditLog[] => {
    return auditService.getLogs();
  },
  saveAuditLogs: (logs: SystemAuditLog[]) => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },
  addAuditLog: (
    action: string,
    category: SystemAuditLog['category'],
    details: string,
    user: string = 'Admin User',
    targetEntity?: AuditTargetEntity,
    changes?: { field?: string; previousValue?: any; newValue?: any },
    severity?: AuditSeverity
  ) => {
    return auditService.logAction({
      action,
      category: category as AuditCategory,
      details,
      targetEntity,
      changes,
      severity,
      admin: {
        name: user,
      },
    });
  },
  clearAuditLogs: (reason: string = 'Audit trail cleared by Admin.') => {
    auditService.clearLogs(reason);
  },

  // --- Category CRUD for Admin ---
  addCategory: (category: Category) => {
    const list = db.getCategories();
    list.push(category);
    db.saveCategories(list);
    db.addAuditLog(
      'CATEGORY_CREATED',
      'settings',
      `Created category "${category.nameBn} / ${category.nameEn}" (${category.type})`,
      'Admin User',
      { type: 'category', id: category.id, name: category.nameEn },
      undefined,
      'info'
    );
  },
  updateCategory: (category: Category) => {
    const list = db.getCategories();
    const idx = list.findIndex((c) => c.id === category.id);
    if (idx !== -1) {
      list[idx] = category;
      db.saveCategories(list);
      db.addAuditLog(
        'CATEGORY_UPDATED',
        'settings',
        `Updated category "${category.nameBn} / ${category.nameEn}"`,
        'Admin User',
        { type: 'category', id: category.id, name: category.nameEn },
        undefined,
        'info'
      );
    }
  },
  deleteCategory: (categoryId: string) => {
    const existing = db.getCategories().find((c) => c.id === categoryId);
    const list = db.getCategories().filter((c) => c.id !== categoryId);
    db.saveCategories(list);
    db.addAuditLog(
      'CATEGORY_DELETED',
      'settings',
      `Removed custom category ID: ${categoryId} (${existing?.nameEn || 'N/A'})`,
      'Admin User',
      { type: 'category', id: categoryId, name: existing?.nameEn || categoryId },
      undefined,
      'warning'
    );
  },

  // --- Database Health & Diagnostics ---
  getDatabaseStats: () => {
    const keys = Object.values(STORAGE_KEYS);
    let totalBytes = 0;
    const tableCounts: Record<string, number> = {};

    keys.forEach((key) => {
      const val = localStorage.getItem(key);
      if (val) {
        totalBytes += val.length * 2; // UTF-16
        try {
          const parsed = JSON.parse(val);
          tableCounts[key] = Array.isArray(parsed) ? parsed.length : 1;
        } catch {
          tableCounts[key] = 1;
        }
      } else {
        tableCounts[key] = 0;
      }
    });

    return {
      storageKB: (totalBytes / 1024).toFixed(2),
      tableCounts,
      totalRecords: Object.values(tableCounts).reduce((a, b) => a + b, 0),
    };
  },

  checkDatabaseIntegrity: () => {
    const accounts = db.getAccounts();
    const transactions = db.getTransactions();
    const outsideSessions = db.getOutsideSessions();

    const accountIds = new Set(accounts.map((a) => a.id));
    const orphanedTxs = transactions.filter((t) => !accountIds.has(t.accountId));
    const negativeAccounts = accounts.filter((a) => a.balance < 0 && a.type !== 'card');
    const unclosedOutsideJourneys = outsideSessions.filter((s) => s.isActive);

    const issuesFixed: string[] = [];

    // Recalculate balances to ensure 100% mathematical integrity
    db.recalculateAccountBalances();
    issuesFixed.push('Calculated and verified math ledger across all accounts');

    db.addAuditLog(
      'INTEGRITY_CHECK_COMPLETED',
      'system',
      `Diagnosed ${transactions.length} transactions across ${accounts.length} accounts. Orphans: ${orphanedTxs.length}, Negative balances: ${negativeAccounts.length}.`,
      'Admin User',
      { type: 'system', id: 'integrity_engine', name: 'Database Integrity Verifier' },
      undefined,
      'info'
    );

    return {
      healthy: orphanedTxs.length === 0 && negativeAccounts.length === 0,
      orphanedTxs: orphanedTxs.length,
      negativeAccounts: negativeAccounts.length,
      unclosedOutsideJourneys: unclosedOutsideJourneys.length,
      totalTransactions: transactions.length,
      totalAccounts: accounts.length,
      issuesFixed,
    };
  },

  vacuumDatabase: () => {
    const txs = db.getTransactions().filter((t) => !t.isDeleted);
    db.saveTransactions(txs);
    db.recalculateAccountBalances();
    db.addAuditLog(
      'DATABASE_VACUUMED',
      'system',
      `Cleaned soft-deleted items. Active records retained: ${txs.length}.`,
      'Admin User',
      { type: 'system', id: 'vacuum_engine', name: 'Database Vacuum Optimizer' },
      undefined,
      'info'
    );
    return txs.length;
  },

  clearSpecificCollection: (collection: 'transactions' | 'journeys' | 'people' | 'diary' | 'budgets') => {
    if (collection === 'transactions') {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      db.recalculateAccountBalances();
      db.addAuditLog(
        'COLLECTION_PURGED',
        'data',
        'All transaction records purged by Admin.',
        'Admin User',
        { type: 'system', id: 'table_transactions', name: 'Transactions Collection' },
        undefined,
        'critical'
      );
    } else if (collection === 'journeys') {
      localStorage.removeItem(STORAGE_KEYS.OUTSIDE_SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.DAY_SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.DAILY_CLOSINGS);
      db.addAuditLog(
        'COLLECTION_PURGED',
        'data',
        'All outside journeys and day sessions purged by Admin.',
        'Admin User',
        { type: 'system', id: 'table_journeys', name: 'Journeys Collection' },
        undefined,
        'critical'
      );
    } else if (collection === 'people') {
      localStorage.removeItem(STORAGE_KEYS.PEOPLE);
      localStorage.removeItem(STORAGE_KEYS.DEBTS);
      db.addAuditLog(
        'COLLECTION_PURGED',
        'data',
        'All debt and lending records purged by Admin.',
        'Admin User',
        { type: 'system', id: 'table_people', name: 'People & Debts Collection' },
        undefined,
        'critical'
      );
    } else if (collection === 'diary') {
      localStorage.removeItem(STORAGE_KEYS.DIARIES);
      db.addAuditLog(
        'COLLECTION_PURGED',
        'data',
        'All daily life diary entries purged by Admin.',
        'Admin User',
        { type: 'system', id: 'table_diary', name: 'Diary Collection' },
        undefined,
        'critical'
      );
    } else if (collection === 'budgets') {
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      db.addAuditLog(
        'COLLECTION_PURGED',
        'data',
        'All monthly budgets purged by Admin.',
        'Admin User',
        { type: 'system', id: 'table_budgets', name: 'Budgets Collection' },
        undefined,
        'critical'
      );
    }
  },
};
