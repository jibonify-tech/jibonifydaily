import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Lock,
  Globe,
  Download,
  Upload,
  Trash2,
  Database,
  CheckCircle,
  FileSpreadsheet,
  ShieldAlert,
  Eye,
  EyeOff,
  Bell,
  Clock,
  Wallet,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { AppSettings, Language, UserProfile } from '../../types';
import { translations } from '../../i18n/translations';

interface SettingsViewProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onSeedDemoData: () => void;
  onClearAllData: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => void;
  onExportCSV: () => void;
  language: Language;
  onOpenAdminDashboard?: () => void;
}

type SettingsSection = 'profile' | 'localization' | 'daily' | 'security' | 'data';

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  settings,
  onUpdateProfile,
  onUpdateSettings,
  onSeedDemoData,
  onClearAllData,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  language,
  onOpenAdminDashboard,
}) => {
  const t = translations[language];

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Profile states
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || '');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(
    profile.monthlyIncomeTarget?.toString() || '65000'
  );
  const [monthlyExpenseTarget, setMonthlyExpenseTarget] = useState(
    profile.monthlyExpenseTarget?.toString() || '45000'
  );
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'accountant'>(
    profile.role || 'admin'
  );

  // Security states
  const [pinEnabled, setPinEnabled] = useState(profile.pinLockEnabled);
  const [pinCode, setPinCode] = useState(profile.pinCode || '1234');
  const [privacyMode, setPrivacyMode] = useState(settings.privacyMode || false);
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes || 0);

  // Localization & Preferences
  const [numberFormat, setNumberFormat] = useState<'bengali' | 'english'>(
    settings.numberFormat || 'bengali'
  );
  const [weekStartDay, setWeekStartDay] = useState<'saturday' | 'sunday' | 'monday'>(
    settings.weekStartDay || 'saturday'
  );
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'YYYY-MM-DD');

  // Daily Routine & Cash
  const [defaultPocketCash, setDefaultPocketCash] = useState(
    (settings.defaultPocketCash || 2000).toString()
  );
  const [enableOutsidePrompt, setEnableOutsidePrompt] = useState(
    settings.enableOutsidePrompt !== false
  );
  const [autoCreateReconciliationAdjustment, setAutoCreateReconciliationAdjustment] = useState(
    settings.autoCreateReconciliationAdjustment !== false
  );
  const [highExpenseAlertThreshold, setHighExpenseAlertThreshold] = useState(
    (settings.highExpenseAlertThreshold || 2500).toString()
  );

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    onUpdateProfile({
      ...profile,
      name,
      email,
      phone,
      monthlyIncomeTarget: parseFloat(monthlyIncomeTarget) || 0,
      monthlyExpenseTarget: parseFloat(monthlyExpenseTarget) || 0,
      role: userRole,
      pinLockEnabled: pinEnabled,
      pinCode,
    });

    onUpdateSettings({
      ...settings,
      privacyMode,
      autoLockMinutes,
      numberFormat,
      weekStartDay,
      dateFormat,
      defaultPocketCash: parseFloat(defaultPocketCash) || 2000,
      enableOutsidePrompt,
      autoCreateReconciliationAdjustment,
      highExpenseAlertThreshold: parseFloat(highExpenseAlertThreshold) || 2500,
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          onImportJSON(content);
          alert(language === 'bn' ? 'সফলভাবে ব্যাকআপ রিস্টোর হয়েছে!' : 'Backup restored successfully!');
        } catch {
          alert(language === 'bn' ? 'ভুল ফাইল ফরম্যাট!' : 'Invalid backup file format!');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>{t.settings}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'প্রোফাইল, ভাষা, সংখ্যা পদ্ধতি, পিন নিরাপত্তা, ক্যাশ সেটিংস ও ব্যাকআপ'
              : 'Profile, localization, numeral system, PIN security, cash settings & backup'}
          </p>
        </div>

        {/* Quick Admin Portal Button */}
        {onOpenAdminDashboard && (
          <button
            onClick={onOpenAdminDashboard}
            className="flex items-center gap-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-300 px-3.5 py-2 text-xs font-bold transition shadow-sm active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>{language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}</span>
          </button>
        )}
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{language === 'bn' ? 'সকল সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!' : 'All settings saved successfully!'}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'profile', labelBn: 'ব্যক্তিগত প্রোফাইল', labelEn: 'Profile & Targets', icon: User },
          { id: 'localization', labelBn: 'ভাষা ও সংখ্যা পদ্ধতি', labelEn: 'Language & Formats', icon: Globe },
          { id: 'daily', labelBn: 'দৈনন্দিন ও ক্যাশ হিসাব', labelEn: 'Daily & Cash Rules', icon: Wallet },
          { id: 'security', labelBn: 'নিরাপত্তা ও স্ক্রিন', labelEn: 'Security & PIN', icon: Shield },
          { id: 'data', labelBn: 'ডেটা ব্যাকআপ ও রিস্টোর', labelEn: 'Data & Backup', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as SettingsSection)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Profile & Targets */}
      {activeSection === 'profile' && (
        <form onSubmit={handleSaveAll} className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'ব্যক্তিগত প্রোফাইল ও আর্থিক লক্ষ্য' : 'Personal Profile & Financial Goals'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'ইমেইল' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm font-num text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'ব্যবহারকারী রোল (System Role)' : 'User Role'}
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as 'admin' | 'user' | 'accountant')}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="admin">সুপার অ্যাডমিন (Super Admin)</option>
                  <option value="user">সাধারণ ব্যবহারকারী (Standard User)</option>
                  <option value="accountant">হিসাবরক্ষক (Accountant)</option>
                </select>
              </div>
            </div>

            {/* Financial Targets */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'মাসিক আনুমানিক আয়ের লক্ষ্য (BDT)' : 'Monthly Income Target (BDT)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    value={monthlyIncomeTarget}
                    onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                    className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-8 pr-3 py-2 text-xs sm:text-sm font-num text-emerald-400 focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'মাসিক সর্বোচ্চ খরচের সিলিং (BDT)' : 'Monthly Expense Limit (BDT)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    value={monthlyExpenseTarget}
                    onChange={(e) => setMonthlyExpenseTarget(e.target.value)}
                    className="w-full rounded-xl bg-slate-800/90 border border-slate-700 pl-8 pr-3 py-2 text-xs sm:text-sm font-num text-rose-400 focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
              >
                {language === 'bn' ? 'প্রোফাইল পরিবর্তন সংরক্ষণ' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. Localization & Formats */}
      {activeSection === 'localization' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{language === 'bn' ? 'ভাষা, মুদ্রা ও ফরম্যাট পছন্দ' : 'Language, Currency & Formats'}</span>
          </h3>

          {/* Language Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {language === 'bn' ? 'অ্যাপের প্রধান ভাষা (Language)' : 'Primary App Language'}
              </span>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'বাংলা এবং ইংরেজিতে এক ক্লিকে টগল করুন' : 'Toggle between Bangla and English'}
              </p>
            </div>
            <button
              onClick={() => {
                const nextLang = language === 'bn' ? 'en' : 'bn';
                onUpdateSettings({ ...settings, language: nextLang });
              }}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-700 transition"
            >
              {language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
            </button>
          </div>

          {/* Numeral System */}
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {language === 'bn' ? 'সংখ্যার ডিজিট ফরম্যাট (Numeral Style)' : 'Number System'}
              </span>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'বাংলা সংখ্যা (১২,৩৪০) নাকি আন্তর্জাতিক ডিজিট (12,340)' : 'Bengali (১২,৩৪০) vs English digits (12,340)'}
              </p>
            </div>
            <select
              value={numberFormat}
              onChange={(e) => {
                const val = e.target.value as 'bengali' | 'english';
                setNumberFormat(val);
                onUpdateSettings({ ...settings, numberFormat: val });
              }}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="bengali">বাংলা সংখ্যা (১২৩৪)</option>
              <option value="english">English Digits (1234)</option>
            </select>
          </div>

          {/* Week Start Day */}
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {language === 'bn' ? 'সপ্তাহের শুরুর দিন (Week Start Day)' : 'First Day of Week'}
              </span>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'বাংলাদেশে শনিবার থেকে কাজের সপ্তাহ শুরু হয়' : 'Saturday is official start in Bangladesh'}
              </p>
            </div>
            <select
              value={weekStartDay}
              onChange={(e) => {
                const val = e.target.value as 'saturday' | 'sunday' | 'monday';
                setWeekStartDay(val);
                onUpdateSettings({ ...settings, weekStartDay: val });
              }}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="saturday">শনিবার (Saturday)</option>
              <option value="sunday">রবিবার (Sunday)</option>
              <option value="monday">সোমবার (Monday)</option>
            </select>
          </div>

          {/* Currency Display */}
          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {language === 'bn' ? 'মুদ্রা প্রতীক (Default Currency)' : 'Default Currency'}
              </span>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'বাংলাদেশি টাকা (৳ BDT)' : 'Bangladeshi Taka (৳ BDT)'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-num">
              ৳ BDT
            </span>
          </div>
        </div>
      )}

      {/* 3. Daily Routine & Cash Rules */}
      {activeSection === 'daily' && (
        <form onSubmit={handleSaveAll} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'দৈনন্দিন রুটিন ও ক্যাশ মেলানো রুলস' : 'Daily Lifecycle & Cash Reconciliation'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'ডিফল্ট পকেট ক্যাশ (টাকা)' : 'Default Pocket Cash (BDT)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                <input
                  type="number"
                  value={defaultPocketCash}
                  onChange={(e) => setDefaultPocketCash(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-8 pr-3 py-2 text-xs sm:text-sm font-num text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'bn' ? 'সকালে ঘর থেকে বের হওয়ার সময় পকেটে থাকার গড় অংক' : 'Standard daily pocket money allowance'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'বড় খরচের সতর্কতা সীমা (BDT)' : 'High Expense Alert Threshold (BDT)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                <input
                  type="number"
                  value={highExpenseAlertThreshold}
                  onChange={(e) => setHighExpenseAlertThreshold(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-8 pr-3 py-2 text-xs sm:text-sm font-num text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'bn' ? 'এর বেশি খরচ রেকর্ড করার সময় সতর্কতা জানাবে' : 'Flag single expenses exceeding this amount'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  {language === 'bn' ? 'বাইরে যাওয়ার সক্রিয় প্রম্পট (Outside Mode Auto-Prompt)' : 'Outside Mode Auto-Prompt'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn' ? 'সকাল ৯টায় বাইরে যাওয়ার জার্নি শুরু করার স্মরণিকা' : 'Suggest opening an outside session in the morning'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableOutsidePrompt}
                  onChange={(e) => setEnableOutsidePrompt(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  {language === 'bn' ? 'ক্যাশ অমিল হলে অটো-অ্যাডজাস্টমেন্ট এন্ট্রি তৈরি' : 'Auto Create Reconciliation Adjustment'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn' ? 'বাসায় ফিরে ক্যাশ শর্ট বা বেশি হলে ব্যালেন্স নিজে ঠিক করবে' : 'Automatically sync pocket ledger when reconciliation difference occurs'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCreateReconciliationAdjustment}
                  onChange={(e) => setAutoCreateReconciliationAdjustment(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
            >
              {language === 'bn' ? 'ক্যাশ সেটিংস সংরক্ষণ' : 'Save Cash Rules'}
            </button>
          </div>
        </form>
      )}

      {/* 4. Security & PIN */}
      {activeSection === 'security' && (
        <form onSubmit={handleSaveAll} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'নিরাপত্তা, পিন লক ও গোপনীয়তা' : 'Security, PIN Lock & Privacy'}</span>
          </h3>

          {/* PIN Lock */}
          <div className="space-y-3 pb-3 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{t.pinLock}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn' ? 'অ্যাপে প্রবেশের জন্য ৪-সংখ্যার পাসকোড প্রয়োজন হবে' : 'Require 4-digit PIN code to unlock app'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinEnabled}
                  onChange={(e) => setPinEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {pinEnabled && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-0.5">
                    {language === 'bn' ? '৪-সংখ্যার পিন কোড সেট করুন' : 'Change 4-Digit PIN Code'}
                  </label>
                  <p className="text-[10px] text-slate-500">
                    {language === 'bn' ? 'ডিফল্ট পিন: 1234' : 'Default PIN: 1234'}
                  </p>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-28 rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-base font-black font-num text-center tracking-widest text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Privacy Mode (Mask balances) */}
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                {privacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                <span>{language === 'bn' ? 'প্রাইভেসি মোড (টাকার অংক লুকানো)' : 'Privacy Mode (Mask Balances)'}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'পাবলিক প্লেসে বা বাসে হিসাব খোলার সময় টাকার অংক ••••• দেখাবে' : 'Hide money numbers with ••••• when viewing in public'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Auto Lock Duration */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{language === 'bn' ? 'অটো-লক সময় (Auto-Lock Timer)' : 'Auto-Lock Inactivity Timeout'}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'কতক্ষণ অব্যবহৃত থাকলে স্বয়ংক্রিয়ভাবে পিন লক হয়ে যাবে' : 'Lock app after period of inactivity'}
              </p>
            </div>
            <select
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(parseInt(e.target.value) || 0)}
              className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-white focus:outline-hidden"
            >
              <option value={0}>{language === 'bn' ? 'বন্ধ (Never)' : 'Never'}</option>
              <option value={1}>{language === 'bn' ? '১ মিনিট পর' : 'After 1 Minute'}</option>
              <option value={5}>{language === 'bn' ? '৫ মিনিট পর' : 'After 5 Minutes'}</option>
              <option value={15}>{language === 'bn' ? '১৫ মিনিট পর' : 'After 15 Minutes'}</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
            >
              {language === 'bn' ? 'নিরাপত্তা সেটিংস সংরক্ষণ' : 'Save Security Settings'}
            </button>
          </div>
        </form>
      )}

      {/* 5. Data & Backup */}
      {activeSection === 'data' && (
        <div className="space-y-4">
          {/* Demo Data Management */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'ডেমো ডেটা জেনারেটর' : 'Demo Data Management'}</span>
            </h3>

            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'বাস্তবসম্মত বাংলাদেশি দৈনন্দিন খরচ (বিকাশ রিচার্জ, অফিস লাঞ্চ, রিকশা ভাড়া, কাঁচাবাজার) দেখতে ডেমো ডেটা লোড করুন।'
                : 'Populate or clear realistic Bangladeshi daily expenses to explore all dashboard features.'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => {
                  if (window.confirm(language === 'bn' ? 'ডেমো ডেটা লোড করতে চান?' : 'Load sample demo data?')) {
                    onSeedDemoData();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডেমো ডেটা লোড করুন' : 'Load Demo Data'}</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত সব হিসাব মুছে ফ্রেশ শুরু করতে চান?' : 'Clear all data and start completely fresh?')) {
                    onClearAllData();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700 px-3.5 py-2 text-xs font-semibold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearDemoData}</span>
              </button>
            </div>
          </div>

          {/* Backup & Export */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{t.backupData}</span>
            </h3>

            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'আপনার সম্পূর্ণ হিসাব যেকোনো সময় ব্যাকআপ ডাউনলোড বা এক্সপোর্ট করে রাখতে পারেন।'
                : 'Safely backup and restore your financial accounts, records and diaries.'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={onExportJSON}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 text-xs font-semibold transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'bn' ? 'ব্যাকআপ ডাউনলোড (JSON)' : 'Download Backup (JSON)'}</span>
              </button>

              <label className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 text-xs font-semibold cursor-pointer transition active:scale-95">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'bn' ? 'ব্যাকআপ রিস্টোর (JSON)' : 'Restore Backup (JSON)'}</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 text-xs font-semibold transition active:scale-95"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                <span>{language === 'bn' ? 'লেনদেন এক্সেল/CSV' : 'Export Excel/CSV'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
