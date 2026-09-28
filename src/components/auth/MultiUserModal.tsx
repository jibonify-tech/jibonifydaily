import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  KeyRound,
  Shield,
  ShieldAlert,
  Sparkles,
  Briefcase,
  Home,
  User,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  Smartphone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { AppUserAccount, Language, UserProfile } from '../../types';
import { multiUserService, RegisterAccountParams } from '../../services/multiUserService';

interface MultiUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAccountSwitched: () => void;
}

type AuthTab = 'switch' | 'login' | 'register';

export const MultiUserModal: React.FC<MultiUserModalProps> = ({
  isOpen,
  onClose,
  language,
  onAccountSwitched,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('switch');
  const [savedAccounts, setSavedAccounts] = useState<AppUserAccount[]>(
    multiUserService.getSavedAccounts()
  );
  const [activeAccount, setActiveAccount] = useState<AppUserAccount>(
    multiUserService.getActiveAccount()
  );

  // Switcher state
  const [pinPromptUser, setPinPromptUser] = useState<AppUserAccount | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSecret, setLoginSecret] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('1234');
  const [regPinEnabled, setRegPinEnabled] = useState(false);
  const [regType, setRegType] = useState<AppUserAccount['accountType']>('personal');
  const [regInitialCash, setRegInitialCash] = useState<number>(2500);
  const [regError, setRegError] = useState<string | null>(null);

  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const refreshAccounts = () => {
    setSavedAccounts(multiUserService.getSavedAccounts());
    setActiveAccount(multiUserService.getActiveAccount());
  };

  useEffect(() => {
    if (isOpen) {
      refreshAccounts();
      setSwitchError(null);
      setLoginError(null);
      setRegError(null);
      setPinPromptUser(null);
      setPinInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Handle Account Switch
  const handleSelectAccount = (account: AppUserAccount) => {
    setSwitchError(null);
    if (account.id === activeAccount.id) {
      showToast(
        language === 'bn'
          ? `ইতিমধ্যেই ${account.name} সক্রিয় আছে`
          : `Already logged in as ${account.name}`
      );
      return;
    }

    if (account.pinLockEnabled && account.pinCode) {
      setPinPromptUser(account);
      setPinInput('');
      return;
    }

    executeSwitch(account.id);
  };

  const executeSwitch = (targetId: string, pin?: string) => {
    const res = multiUserService.switchAccount(targetId, pin);
    if (!res.success) {
      setSwitchError(res.error || 'Failed to switch account');
      return;
    }

    showToast(
      language === 'bn'
        ? `সফলভাবে পরিবর্তন হয়েছে: ${res.user?.name}`
        : `Switched account to ${res.user?.name}`
    );
    setPinPromptUser(null);
    setPinInput('');
    refreshAccounts();
    onAccountSwitched();
    setTimeout(() => onClose(), 600);
  };

  // Handle PIN Submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptUser) return;
    executeSwitch(pinPromptUser.id, pinInput);
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginSecret.trim()) {
      setLoginError(language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড প্রদান করুন' : 'Email and password/PIN required');
      return;
    }

    const res = multiUserService.loginWithCredentials(loginEmail, loginSecret);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials');
      return;
    }

    showToast(
      language === 'bn'
        ? `লগইন সফল: ${res.user?.name}`
        : `Logged in successfully as ${res.user?.name}`
    );
    refreshAccounts();
    onAccountSwitched();
    setTimeout(() => onClose(), 600);
  };

  // Quick Demo fill
  const handleQuickFill = (email: string, secret: string) => {
    setLoginEmail(email);
    setLoginSecret(secret);
    setLoginError(null);
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim() || !regEmail.trim()) {
      setRegError(language === 'bn' ? 'নাম এবং ইমেইল আবশ্যক' : 'Name and email are required');
      return;
    }

    const res = multiUserService.registerAccount({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword || 'password123',
      pinCode: regPin || '1234',
      pinLockEnabled: regPinEnabled,
      accountType: regType,
      initialCash: regInitialCash,
    });

    if (!res.success) {
      setRegError(res.error || 'Failed to create account');
      return;
    }

    showToast(
      language === 'bn'
        ? `নতুন অ্যাকাউন্ট তৈরি ও লগইন হয়েছে: ${res.user?.name}`
        : `Account created & signed in: ${res.user?.name}`
    );
    refreshAccounts();
    onAccountSwitched();
    setTimeout(() => onClose(), 600);
  };

  // Handle Remove Account
  const handleRemoveAccount = (userId: string, accountName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        language === 'bn'
          ? `আপনি কি নিশ্চিত যে "${accountName}" ডিভাইস থেকে সরিয়ে ফেলবেন?`
          : `Remove "${accountName}" from this device?`
      )
    ) {
      return;
    }

    const res = multiUserService.removeAccount(userId);
    if (!res.success) {
      alert(res.error);
      return;
    }
    showToast('Account removed from this device');
    refreshAccounts();
    onAccountSwitched();
  };

  const getAccountTypeIcon = (type?: string) => {
    switch (type) {
      case 'business':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-400" />;
      case 'household':
        return <Home className="w-3.5 h-3.5 text-emerald-400" />;
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'personal':
      default:
        return <User className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="rounded bg-rose-950 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider">
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="rounded bg-amber-950 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider">
            Admin
          </span>
        );
      case 'accountant':
        return (
          <span className="rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider">
            Accountant
          </span>
        );
      case 'user':
      default:
        return (
          <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider">
            Member
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{language === 'bn' ? 'মাল্টি-ইউজার লগইন ও অ্যাকাউন্ট সুইচ' : 'Multi-User Authentication'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'একই ডিভাইসে একাধিক ব্যবহারকারী ও হিসাব পরিচালনা করুন'
                  : 'Manage multiple user accounts with complete ledger separation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast Notice */}
        {statusNotice && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-2.5 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Tabs Switcher */}
        <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'switch'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'অ্যাকাউন্টস তালিকা' : 'Switch Account'}</span>
            <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-num">
              {savedAccounts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লগইন' : 'Sign In'}</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Register'}</span>
          </button>
        </div>

        {/* TAB 1: SWITCH SAVED ACCOUNTS */}
        {activeTab === 'switch' && (
          <div className="space-y-3">
            {switchError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-950/80 border border-rose-500/50 p-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{switchError}</span>
              </div>
            )}

            {/* PIN Entry Prompt if selected account is locked */}
            {pinPromptUser && (
              <form
                onSubmit={handlePinSubmit}
                className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 space-y-3 animate-fadeIn"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">
                      Enter PIN for {pinPromptUser.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPinPromptUser(null);
                      setPinInput('');
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter 4-digit PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    Unlock
                  </button>
                </div>
                {pinPromptUser.pinCode && (
                  <p className="text-[10px] text-slate-400">
                    Hint: Default demo PIN is <strong className="text-indigo-300">{pinPromptUser.pinCode}</strong>
                  </p>
                )}
              </form>
            )}

            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {language === 'bn' ? 'এই ডিভাইসে সংরক্ষিত অ্যাকাউন্টসমূহ:' : 'Saved Accounts on this device:'}
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {savedAccounts.map((account) => {
                const isActive = account.id === activeAccount.id;

                return (
                  <div
                    key={account.id}
                    onClick={() => handleSelectAccount(account)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {account.avatarUrl ? (
                          <img
                            src={account.avatarUrl}
                            alt={account.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-white text-sm">
                            {account.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isActive && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-[200px]">
                            {account.name}
                          </p>
                          {getRoleBadge(account.role)}
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono truncate">{account.email}</p>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            {getAccountTypeIcon(account.accountType)}
                            <span className="capitalize">{account.accountType}</span>
                          </span>
                          <span>•</span>
                          <span className="uppercase text-slate-400 font-semibold">{account.plan}</span>
                          {account.pinLockEnabled && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> PIN
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1 rounded-xl bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white text-xs font-semibold transition"
                        >
                          Switch
                        </button>
                      )}

                      {savedAccounts.length > 1 && !isActive && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(account.id, account.name, e)}
                          title="Remove account from device"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ {language === 'bn' ? 'আরেকটি অ্যাকাউন্ট যোগ করুন' : 'Add another account'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পাসওয়ার্ড দিয়ে লগইন' : 'Sign in with credentials'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-950/80 border border-rose-500/50 p-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড অথবা ৪ ডিজিট পিন' : 'Password or 4-digit PIN'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginSecret}
                  onChange={(e) => setLoginSecret(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Quick Demo Logins for Fast Evaluation */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                ⚡ {language === 'bn' ? 'এক-ক্লিকে ডেমো একাউন্ট নির্বাচন:' : 'Quick Demo Logins (1-Click Fill):'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('tanveer.bd@example.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left transition border border-slate-700/60"
                >
                  <p className="font-bold text-white">Tanveer</p>
                  <p className="text-[10px] text-slate-400">Personal (৳85k/mo)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sadia.islam@example.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left transition border border-slate-700/60"
                >
                  <p className="font-bold text-white">Sadia Islam</p>
                  <p className="text-[10px] text-slate-400">Freelance & Business</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('family@jibonify.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left transition border border-slate-700/60"
                >
                  <p className="font-bold text-white">Household</p>
                  <p className="text-[10px] text-slate-400">Family & Home Ledger</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('rupomxc@gmail.com', 'adminpassword')}
                  className="p-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-left transition border border-indigo-500/40"
                >
                  <p className="font-bold text-indigo-300">Rupom Admin</p>
                  <p className="text-[10px] text-indigo-400">Super Admin Console</p>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('switch')}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: REGISTER NEW USER ACCOUNT */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-950/80 border border-rose-500/50 p-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'ব্যবহারকারীর পূর্ণ নাম' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakil Mahmud"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="shakil@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'অ্যাকাউন্টের ধরন' : 'Account Type'}
                </label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="personal">Personal (ব্যক্তিগত হিসাব)</option>
                  <option value="household">Household / Family (পারিবারিক হিসাব)</option>
                  <option value="business">Business / Freelance (ব্যবসা ও ফ্রিল্যান্স)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'শুরুর পকেট ক্যাশ (৳)' : 'Initial Pocket Cash (৳)'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={regInitialCash}
                  onChange={(e) => setRegInitialCash(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-num"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder="password123"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={regPinEnabled}
                  onChange={(e) => setRegPinEnabled(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span className="font-semibold text-white">
                  {language === 'bn' ? 'এই ব্যবহারকারীর জন্য ৪-ডিজিট পিন লক সক্রিয় করুন' : 'Enable 4-digit PIN protection'}
                </span>
              </label>

              {regPinEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    className="w-32 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-center font-mono text-sm tracking-widest text-white focus:outline-hidden focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">
                    Used for rapid profile switching &amp; lock screen
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('switch')}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি ও শুরু করুন' : 'Create & Sign In'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
