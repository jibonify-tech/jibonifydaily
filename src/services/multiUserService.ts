import {
  Account,
  AppUserAccount,
  Category,
  Transaction,
  UserProfile,
} from '../types';
import { auditService } from './auditService';

const ACTIVE_USER_ID_KEY = 'jibonify_active_user_id_v1';
const SAVED_ACCOUNTS_KEY = 'jibonify_saved_accounts_v1';
const USER_DATA_PREFIX = 'jibonify_store_user_';

export interface RegisterAccountParams {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  pinCode?: string;
  pinLockEnabled?: boolean;
  role?: 'user' | 'admin' | 'accountant' | 'super_admin';
  accountType?: 'personal' | 'household' | 'business' | 'admin';
  initialCash?: number;
}

// Initial demo users available on this device
export const DEFAULT_ACCOUNTS: AppUserAccount[] = [
  {
    id: 'usr_tanveer',
    name: 'তানভীর আহমেদ (Tanveer)',
    email: 'tanveer.bd@example.com',
    phone: '01712-345678',
    role: 'user',
    plan: 'pro_monthly',
    accountType: 'personal',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    pinLockEnabled: false,
    pinCode: '1234',
    password: 'password123',
    monthlyIncomeTarget: 85000,
    monthlyExpenseTarget: 45000,
    createdAt: '2026-01-15T08:30:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_sadia',
    name: 'সাদিয়া ইসলাম (Sadia Islam)',
    email: 'sadia.islam@example.com',
    phone: '01819-876543',
    role: 'accountant',
    plan: 'pro_yearly',
    accountType: 'business',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    pinLockEnabled: true,
    pinCode: '2345',
    password: 'password123',
    monthlyIncomeTarget: 120000,
    monthlyExpenseTarget: 50000,
    createdAt: '2026-02-10T11:00:00Z',
    lastLogin: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'usr_family',
    name: 'পারিবারিক বাজেট (Family & Home)',
    email: 'family@jibonify.com',
    phone: '01911-223344',
    role: 'user',
    plan: 'free',
    accountType: 'household',
    avatarUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=120&auto=format&fit=crop&q=80',
    pinLockEnabled: false,
    pinCode: '3456',
    password: 'password123',
    monthlyIncomeTarget: 95000,
    monthlyExpenseTarget: 70000,
    createdAt: '2026-03-01T09:15:00Z',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'usr_rupom_admin',
    name: 'Rupom Super Admin',
    email: 'rupomxc@gmail.com',
    phone: '01700-112233',
    role: 'super_admin',
    plan: 'enterprise',
    accountType: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    pinLockEnabled: true,
    pinCode: '9999',
    password: 'adminpassword',
    monthlyIncomeTarget: 250000,
    monthlyExpenseTarget: 80000,
    createdAt: '2026-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

// Pre-seeded initial ledgers for the default users to demonstrate clear multi-user data segregation
const USER_SEEDS: Record<string, { accounts: Account[]; transactions: Transaction[] }> = {
  usr_sadia: {
    accounts: [
      {
        id: 'sadia_pocket',
        name: 'সাদিয়া পার্স ক্যাশ (Wallet Cash)',
        type: 'cash',
        subType: 'pocket',
        balance: 4200,
        initialBalance: 4200,
        color: '#ec4899',
        icon: 'Wallet',
        isDefaultPocket: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sadia_nagad',
        name: 'নগদ ফ্রিল্যান্স ওয়ালেট (Nagad)',
        type: 'mobile_wallet',
        subType: 'nagad',
        balance: 18500,
        initialBalance: 18500,
        accountNumber: '01819-876543',
        institutionName: 'Nagad Post Office',
        color: '#f97316',
        icon: 'Smartphone',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sadia_bank',
        name: 'ইবিএল ক্লায়েন্ট ব্যাংক (EBL Account)',
        type: 'bank',
        subType: 'savings',
        balance: 142000,
        initialBalance: 142000,
        accountNumber: '1081XXXXXXXX',
        institutionName: 'Eastern Bank PLC',
        color: '#0284c7',
        icon: 'Building',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    transactions: [
      {
        id: 'sadia_tx_1',
        type: 'income',
        amount: 45000,
        accountId: 'sadia_bank',
        categoryId: 'cat_salary',
        date: new Date().toISOString().split('T')[0],
        time: '11:30',
        description: 'ক্লায়েন্ট ওয়েবসাইট রিডিজাইন পেমেন্ট (Upwork Escrow)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sadia_tx_2',
        type: 'expense',
        amount: 2200,
        accountId: 'sadia_pocket',
        categoryId: 'cat_food',
        date: new Date().toISOString().split('T')[0],
        time: '15:45',
        description: 'ধানমন্ডি ক্যাফেতে টিম মিটিং ও কফি',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  usr_family: {
    accounts: [
      {
        id: 'family_cash',
        name: 'ঘরের ড্রয়ার ক্যাশ (Household Cash)',
        type: 'cash',
        subType: 'home',
        balance: 8500,
        initialBalance: 8500,
        color: '#10b981',
        icon: 'Home',
        isDefaultPocket: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'family_bank',
        name: 'ডাচ-বাংলা ফ্যামিলি অ্যাকাউন্ট (DBBL)',
        type: 'bank',
        subType: 'savings',
        balance: 62400,
        initialBalance: 62400,
        accountNumber: '115XXXXXXXX',
        institutionName: 'Dutch-Bangla Bank PLC',
        color: '#16a34a',
        icon: 'Building',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'family_bkash',
        name: 'গৃহস্থালি বিকাশ (Family bKash)',
        type: 'mobile_wallet',
        subType: 'bkash',
        balance: 6300,
        initialBalance: 6300,
        accountNumber: '01911-223344',
        institutionName: 'bKash Limited',
        color: '#e11d48',
        icon: 'Smartphone',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    transactions: [
      {
        id: 'fam_tx_1',
        type: 'expense',
        amount: 4500,
        accountId: 'family_cash',
        categoryId: 'cat_groceries',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        description: 'সাপ্তাহিক পারিবারিক বাজার (মাছ, মাংস ও সবজি)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'fam_tx_2',
        type: 'expense',
        amount: 2850,
        accountId: 'family_bkash',
        categoryId: 'cat_utility',
        date: new Date().toISOString().split('T')[0],
        time: '12:15',
        description: 'ডেসকো বিদ্যুৎ বিল ও ওয়াসা পানি বিল',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  usr_rupom_admin: {
    accounts: [
      {
        id: 'admin_cash',
        name: 'অ্যাডমিন অফিস পেটি ক্যাশ (Admin Cash)',
        type: 'cash',
        subType: 'pocket',
        balance: 15000,
        initialBalance: 15000,
        color: '#6366f1',
        icon: 'Wallet',
        isDefaultPocket: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'admin_bank',
        name: 'প্ল্যাটফর্ম অপারেশন ব্যাংক (City Bank)',
        type: 'bank',
        subType: 'current',
        balance: 385000,
        initialBalance: 385000,
        accountNumber: '3101XXXXXXXX',
        institutionName: 'City Bank PLC',
        color: '#4f46e5',
        icon: 'Building',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    transactions: [
      {
        id: 'adm_tx_1',
        type: 'expense',
        amount: 4500,
        accountId: 'admin_bank',
        categoryId: 'cat_office',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        description: 'ক্লাউড সার্ভার ও ডাটাবেজ ব্যাকআপ সাবস্ক্রিপশন',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
};

const DATA_KEYS = [
  'jibonify_accounts_v1',
  'jibonify_transactions_v1',
  'jibonify_day_sessions_v1',
  'jibonify_outside_sessions_v1',
  'jibonify_daily_closings_v1',
  'jibonify_people_v1',
  'jibonify_debts_v1',
  'jibonify_budgets_v1',
  'jibonify_recurring_v1',
  'jibonify_reminders_v1',
  'jibonify_diaries_v1',
  'jibonify_savings_goals_v1',
  'jibonify_emergency_fund_v1',
];

class MultiUserService {
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
      } catch (err) {
        console.error('MultiUser listener error:', err);
      }
    });
  }

  /**
   * Retrieves all accounts registered on this device
   */
  public getSavedAccounts(): AppUserAccount[] {
    try {
      const data = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  /**
   * Saves updated accounts list
   */
  public saveAccounts(accounts: AppUserAccount[]): void {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    this.notify();
  }

  /**
   * Returns current active account ID
   */
  public getActiveUserId(): string {
    return localStorage.getItem(ACTIVE_USER_ID_KEY) || 'usr_tanveer';
  }

  /**
   * Returns the currently logged in account
   */
  public getActiveAccount(): AppUserAccount {
    const activeId = this.getActiveUserId();
    const accounts = this.getSavedAccounts();
    const found = accounts.find((a) => a.id === activeId);
    if (found) return found;

    // Fallback to first available account
    const fallback = accounts[0] || DEFAULT_ACCOUNTS[0];
    localStorage.setItem(ACTIVE_USER_ID_KEY, fallback.id);
    return fallback;
  }

  /**
   * Archives current active database state into user-specific store
   */
  private snapshotUserLedger(userId: string) {
    try {
      const dump: Record<string, string | null> = {};
      DATA_KEYS.forEach((key) => {
        dump[key] = localStorage.getItem(key);
      });
      localStorage.setItem(`${USER_DATA_PREFIX}${userId}`, JSON.stringify(dump));
    } catch (e) {
      console.error('Failed to snapshot user ledger:', e);
    }
  }

  /**
   * Restores user-specific database state into active localStorage keys
   */
  private restoreUserLedger(userId: string) {
    try {
      const stored = localStorage.getItem(`${USER_DATA_PREFIX}${userId}`);
      if (stored) {
        const dump: Record<string, string | null> = JSON.parse(stored);
        DATA_KEYS.forEach((key) => {
          if (dump[key] !== undefined && dump[key] !== null) {
            localStorage.setItem(key, dump[key]!);
          } else {
            localStorage.removeItem(key);
          }
        });
      } else if (USER_SEEDS[userId]) {
        // Seed customized ledger for this demo user
        const seed = USER_SEEDS[userId];
        localStorage.setItem('jibonify_accounts_v1', JSON.stringify(seed.accounts));
        localStorage.setItem('jibonify_transactions_v1', JSON.stringify(seed.transactions));
        localStorage.setItem('jibonify_day_sessions_v1', JSON.stringify([]));
        localStorage.setItem('jibonify_outside_sessions_v1', JSON.stringify([]));
        localStorage.setItem('jibonify_daily_closings_v1', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Failed to restore user ledger:', e);
    }
  }

  /**
   * Switches the active user session on this device
   */
  public switchAccount(
    targetUserId: string,
    pin?: string
  ): { success: boolean; error?: string; user?: AppUserAccount } {
    const accounts = this.getSavedAccounts();
    const target = accounts.find((a) => a.id === targetUserId);

    if (!target) {
      return { success: false, error: 'User account not found' };
    }

    // Verify PIN if enabled and provided
    if (target.pinLockEnabled && target.pinCode) {
      if (pin !== undefined && pin !== target.pinCode) {
        return { success: false, error: 'Invalid PIN code. Please try again.' };
      }
    }

    const currentId = this.getActiveUserId();

    // 1. Snapshot current user's financial ledger
    if (currentId && currentId !== targetUserId) {
      this.snapshotUserLedger(currentId);
    }

    // 2. Set new active user ID
    localStorage.setItem(ACTIVE_USER_ID_KEY, target.id);

    // 3. Restore target user's ledger
    this.restoreUserLedger(target.id);

    // 4. Update profile in active storage
    const updatedProfile: UserProfile = {
      id: target.id,
      name: target.name,
      email: target.email,
      phone: target.phone,
      avatarUrl: target.avatarUrl,
      role: target.role,
      plan: target.plan,
      accountType: target.accountType,
      monthlyIncomeTarget: target.monthlyIncomeTarget,
      monthlyExpenseTarget: target.monthlyExpenseTarget,
      pinLockEnabled: target.pinLockEnabled,
      pinCode: target.pinCode,
      isLoggedIn: true,
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem('jibonify_profile_v1', JSON.stringify(updatedProfile));

    // 5. Update lastLogin in saved accounts list
    const updatedAccounts = accounts.map((a) =>
      a.id === target.id ? { ...a, lastLogin: new Date().toISOString() } : a
    );
    this.saveAccounts(updatedAccounts);

    // 6. Record audit action
    auditService.logAction({
      action: 'USER_ACCOUNT_SWITCHED',
      category: 'auth',
      severity: 'info',
      targetEntity: {
        type: 'user',
        id: target.id,
        name: `${target.name} (${target.email})`,
      },
      details: `Active user switched from "${currentId}" to "${target.name}" (${target.role}).`,
      admin: {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
      },
      status: 'success',
    });

    this.notify();
    return { success: true, user: target };
  }

  /**
   * Logs in using email and password / PIN
   */
  public loginWithCredentials(
    email: string,
    secret: string
  ): { success: boolean; error?: string; user?: AppUserAccount } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanSecret = secret.trim();

    const accounts = this.getSavedAccounts();
    const target = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!target) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    // Verify password or PIN
    const matchesPassword = target.password && target.password === cleanSecret;
    const matchesPin = target.pinCode && target.pinCode === cleanSecret;

    if (!matchesPassword && !matchesPin) {
      return { success: false, error: 'Incorrect password or PIN code.' };
    }

    return this.switchAccount(target.id);
  }

  /**
   * Registers a new user account on this device
   */
  public registerAccount(
    params: RegisterAccountParams
  ): { success: boolean; error?: string; user?: AppUserAccount } {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !params.name.trim()) {
      return { success: false, error: 'Name and email are required.' };
    }

    const accounts = this.getSavedAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists on this device.' };
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newAccount: AppUserAccount = {
      id: newId,
      name: params.name.trim(),
      email: cleanEmail,
      phone: params.phone?.trim() || undefined,
      password: params.password?.trim() || 'password123',
      pinCode: params.pinCode?.trim() || '1234',
      pinLockEnabled: Boolean(params.pinLockEnabled),
      role: params.role || 'user',
      plan: 'pro_monthly',
      accountType: params.accountType || 'personal',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Initialize their starting ledger
    const startingCash = Number(params.initialCash) || 2000;
    const initialUserAccounts: Account[] = [
      {
        id: `acc_pocket_${newId}`,
        name: 'পকেট ক্যাশ (Pocket Cash)',
        type: 'cash',
        subType: 'pocket',
        balance: startingCash,
        initialBalance: startingCash,
        color: '#059669',
        icon: 'Wallet',
        isDefaultPocket: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Save initial ledger snapshot
    localStorage.setItem(
      `${USER_DATA_PREFIX}${newId}`,
      JSON.stringify({
        jibonify_accounts_v1: JSON.stringify(initialUserAccounts),
        jibonify_transactions_v1: JSON.stringify([]),
        jibonify_day_sessions_v1: JSON.stringify([]),
        jibonify_outside_sessions_v1: JSON.stringify([]),
        jibonify_daily_closings_v1: JSON.stringify([]),
      })
    );

    const updated = [...accounts, newAccount];
    this.saveAccounts(updated);

    // Switch into the new account
    const switchRes = this.switchAccount(newId);

    auditService.logAction({
      action: 'USER_REGISTERED',
      category: 'auth',
      severity: 'info',
      targetEntity: {
        type: 'user',
        id: newId,
        name: `${newAccount.name} (${newAccount.email})`,
      },
      details: `New user account created on device: "${newAccount.name}" (${newAccount.accountType}).`,
      admin: {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
      },
      status: 'success',
    });

    return switchRes;
  }

  /**
   * Removes an account from this device's saved accounts
   */
  public removeAccount(userId: string): { success: boolean; error?: string } {
    const accounts = this.getSavedAccounts();
    if (accounts.length <= 1) {
      return { success: false, error: 'Cannot remove the only account on this device.' };
    }

    const filtered = accounts.filter((a) => a.id !== userId);
    this.saveAccounts(filtered);

    // If removed active user, switch to the first remaining one
    if (this.getActiveUserId() === userId) {
      this.switchAccount(filtered[0].id);
    }

    return { success: true };
  }

  /**
   * Logs out current user (sets loggedIn to false)
   */
  public logout(): void {
    const active = this.getActiveAccount();
    const profile = JSON.parse(localStorage.getItem('jibonify_profile_v1') || '{}');
    profile.isLoggedIn = false;
    localStorage.setItem('jibonify_profile_v1', JSON.stringify(profile));

    auditService.logAction({
      action: 'USER_LOGGED_OUT',
      category: 'auth',
      severity: 'info',
      targetEntity: {
        type: 'user',
        id: active.id,
        name: active.name,
      },
      details: `User "${active.name}" logged out of session.`,
      status: 'success',
    });

    this.notify();
  }
}

export const multiUserService = new MultiUserService();
