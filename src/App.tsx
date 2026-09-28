import React, { useState, useEffect } from 'react';
import { db } from './services/storage';
import {
  Account,
  AppSettings,
  Budget,
  Category,
  DailyClosing,
  DaySession,
  DebtRecord,
  DiaryEntry,
  Language,
  OutsideSession,
  Person,
  RecurringTransaction,
  Reminder,
  ThemeMode,
  Transaction,
  UserProfile,
} from './types';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { PinLockModal } from './components/common/PinLockModal';

import { MainDashboard } from './components/dashboard/MainDashboard';
import { DayStartModal } from './components/dashboard/DayStartModal';
import { OutsideModeModal } from './components/dashboard/OutsideModeModal';
import { ReturnHomeModal } from './components/dashboard/ReturnHomeModal';
import { DailyClosingModal } from './components/dashboard/DailyClosingModal';

import { TransactionModal } from './components/transactions/TransactionModal';
import { TransferModal } from './components/transactions/TransferModal';
import { TransactionList } from './components/transactions/TransactionList';
import { ReceiptViewerModal } from './components/transactions/ReceiptViewerModal';

import { AccountsView } from './components/accounts/AccountsView';
import { OutsideJourneysView } from './components/outside/OutsideJourneysView';
import { PeopleView } from './components/people/PeopleView';
import { BudgetView } from './components/budget/BudgetView';
import { CalendarView } from './components/calendar/CalendarView';
import { DailyDiaryView } from './components/diary/DailyDiaryView';
import { ReportsView } from './components/reports/ReportsView';
import { RemindersView } from './components/reminders/RemindersView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';

export default function App() {
  // Global domain state
  const [profile, setProfile] = useState<UserProfile>(() => db.getProfile());
  const [settings, setSettings] = useState<AppSettings>(() => db.getSettings());
  const [accounts, setAccounts] = useState<Account[]>(() => db.getAccounts());
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => db.getTransactions());
  const [daySessions, setDaySessions] = useState<DaySession[]>(() => db.getDaySessions());
  const [outsideSessions, setOutsideSessions] = useState<OutsideSession[]>(() => db.getOutsideSessions());
  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>(() => db.getDailyClosings());
  const [people, setPeople] = useState<Person[]>(() => db.getPeople());
  const [debts, setDebts] = useState<DebtRecord[]>(() => db.getDebts());
  const [budgets, setBudgets] = useState<Budget[]>(() => db.getBudgets());
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => db.getRecurring());
  const [reminders, setReminders] = useState<Reminder[]>(() => db.getReminders());
  const [diaries, setDiaries] = useState<DiaryEntry[]>(() => db.getDiaries());

  // UI Navigation & App Lock State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [selectedAccountIdForFilter, setSelectedAccountIdForFilter] = useState<string | undefined>(undefined);

  // Modals
  const [showDayStartModal, setShowDayStartModal] = useState<boolean>(false);
  const [showOutsideModal, setShowOutsideModal] = useState<boolean>(false);
  const [showReturnHomeModal, setShowReturnHomeModal] = useState<boolean>(false);
  const [showDailyClosingModal, setShowDailyClosingModal] = useState<boolean>(false);
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [transactionModalType, setTransactionModalType] = useState<'expense' | 'income'>('expense');
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [receiptViewerData, setReceiptViewerData] = useState<{ url: string; title: string } | null>(null);

  // Initial seed check: if first time and no transactions, seed demo data
  useEffect(() => {
    const existing = db.getTransactions();
    if (existing.length === 0) {
      db.seedDemoData();
      refreshAllState();
    }
  }, []);

  const refreshAllState = () => {
    setProfile(db.getProfile());
    setSettings(db.getSettings());
    setAccounts(db.getAccounts());
    setCategories(db.getCategories());
    setTransactions(db.getTransactions());
    setDaySessions(db.getDaySessions());
    setOutsideSessions(db.getOutsideSessions());
    setDailyClosings(db.getDailyClosings());
    setPeople(db.getPeople());
    setDebts(db.getDebts());
    setBudgets(db.getBudgets());
    setRecurring(db.getRecurring());
    setReminders(db.getReminders());
    setDiaries(db.getDiaries());
  };

  // Today's Date String YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Active sessions
  const currentDaySession = daySessions.find((s) => s.date === todayStr);
  const currentOutsideSession = outsideSessions.find((s) => s.isActive);

  // Handlers for Day Start
  const handleConfirmDayStart = (sessionData: Omit<DaySession, 'id'>) => {
    const newSession: DaySession = {
      ...sessionData,
      id: 'day_' + sessionData.date,
    };
    const updated = [newSession, ...daySessions.filter((s) => s.date !== sessionData.date)];
    db.saveDaySessions(updated);
    setDaySessions(updated);
    setShowDayStartModal(false);
  };

  // Handlers for Outside Mode
  const handleConfirmOutside = (sessionData: Omit<OutsideSession, 'id'>) => {
    const newSession: OutsideSession = {
      ...sessionData,
      id: 'out_' + Date.now(),
      daySessionId: currentDaySession?.id,
    };
    const updated = [newSession, ...outsideSessions.map((s) => ({ ...s, isActive: false }))];
    db.saveOutsideSessions(updated);
    setOutsideSessions(updated);
    setShowOutsideModal(false);
  };

  // Handlers for Return Home Reconciliation
  const handleConfirmReconciliation = (
    actualCash: number,
    difference: number,
    status: 'matched' | 'short' | 'extra',
    reason: string,
    notes: string,
    createAutoAdjustment: boolean
  ) => {
    if (!currentOutsideSession) return;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Update outside session
    const updatedOutsideSessions = outsideSessions.map((s) => {
      if (s.id === currentOutsideSession.id) {
        return {
          ...s,
          endTime: currentTime,
          isActive: false,
          actualCashAtReturn: actualCash,
          cashDifference: difference,
          reconciliationStatus: status,
          differenceReason: reason,
          differenceNote: notes,
        };
      }
      return s;
    });

    db.saveOutsideSessions(updatedOutsideSessions);
    setOutsideSessions(updatedOutsideSessions);

    // If there is a difference and user agreed to auto adjustment, create an adjustment transaction
    if (createAutoAdjustment && Math.abs(difference) >= 0.01) {
      db.addTransaction({
        type: 'adjustment',
        amount: difference, // positive or negative
        accountId: 'acc_pocket',
        date: todayStr,
        time: currentTime,
        description: `ক্যাশ মেলানো সমন্বয় (${status === 'short' ? 'ঘাটতি' : 'উদ্বৃত্ত'}): ${reason}`,
        note: notes,
      });
      setTransactions(db.getTransactions());
      setAccounts(db.getAccounts());
    }

    setShowReturnHomeModal(false);
  };

  // Handlers for Daily Closing
  const handleConfirmDailyClosing = (closing: DailyClosing) => {
    const updatedClosings = [closing, ...dailyClosings.filter((c) => c.date !== closing.date)];
    db.saveDailyClosings(updatedClosings);
    setDailyClosings(updatedClosings);

    // Mark today's day session as closed
    const updatedSessions = daySessions.map((s) => {
      if (s.date === closing.date) {
        return { ...s, isClosed: true, endTime: closing.closedAt };
      }
      return s;
    });
    db.saveDaySessions(updatedSessions);
    setDaySessions(updatedSessions);

    // If diary was provided, save to diaries as well
    if (closing.diaryActivities || closing.diaryPlaces || closing.diaryFinancialNotes) {
      const diaryEntry: DiaryEntry = {
        id: 'diary_' + closing.date,
        date: closing.date,
        activities: closing.diaryActivities || '',
        placesVisited: closing.diaryPlaces || '',
        financialReflections: closing.diaryFinancialNotes || '',
        rating: closing.rating || 5,
        updatedAt: new Date().toISOString(),
      };
      const updatedDiaries = [diaryEntry, ...diaries.filter((d) => d.date !== closing.date)];
      db.saveDiaries(updatedDiaries);
      setDiaries(updatedDiaries);
    }

    setShowDailyClosingModal(false);
  };

  // Handlers for Transactions
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    db.addTransaction(txData);
    setTransactions(db.getTransactions());
    setAccounts(db.getAccounts());
    setShowTransactionModal(false);
    setShowTransferModal(false);
  };

  const handleDeleteTransaction = (id: string) => {
    db.deleteTransaction(id);
    setTransactions(db.getTransactions());
    setAccounts(db.getAccounts());
  };

  // Handlers for Accounts
  const handleAddAccount = (accData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const currentAccs = db.getAccounts();
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...currentAccs, newAcc];
    db.saveAccounts(updated);
    setAccounts(updated);
  };

  // Handlers for People & Debts
  const handleAddPerson = (personData: Omit<Person, 'id' | 'createdAt' | 'totalLent' | 'totalBorrowed'>) => {
    const currentPeople = db.getPeople();
    const newPerson: Person = {
      ...personData,
      id: `p_${Date.now()}`,
      totalLent: 0,
      totalBorrowed: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...currentPeople, newPerson];
    db.savePeople(updated);
    setPeople(updated);
  };

  const handleAddDebt = (
    debtData: Omit<DebtRecord, 'id' | 'paidAmount' | 'remainingAmount' | 'isFullyPaid' | 'repayments' | 'createdAt'>,
    accountId: string
  ) => {
    const currentDebts = db.getDebts();
    const newDebtId = `debt_${Date.now()}`;
    const newDebt: DebtRecord = {
      ...debtData,
      id: newDebtId,
      paidAmount: 0,
      remainingAmount: debtData.amount,
      isFullyPaid: false,
      repayments: [],
      createdAt: new Date().toISOString(),
    };

    const updatedDebts = [newDebt, ...currentDebts];
    db.saveDebts(updatedDebts);
    setDebts(updatedDebts);

    // Also record transaction for account deduction or credit
    const person = people.find((p) => p.id === debtData.personId);
    db.addTransaction({
      type: debtData.type,
      amount: debtData.amount,
      accountId,
      personId: debtData.personId,
      debtId: newDebtId,
      date: debtData.date,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      description:
        debtData.type === 'lend'
          ? `${person?.name || 'পরিচিতজনকে'} নগদ টাকা ধার প্রদান`
          : `${person?.name || 'পরিচিতজন থেকে'} নগদ ঋণ গ্রহণ`,
      note: debtData.reason,
    });

    setTransactions(db.getTransactions());
    setAccounts(db.getAccounts());
  };

  const handleAddRepayment = (debtId: string, amount: number, accountId: string, note?: string) => {
    const currentDebts = db.getDebts();
    const target = currentDebts.find((d) => d.id === debtId);
    if (!target) return;

    const person = people.find((p) => p.id === target.personId);
    const newPaid = target.paidAmount + amount;
    const newRemaining = Math.max(0, target.amount - newPaid);
    const isPaid = newRemaining === 0;

    const repaymentItem = {
      id: `rep_${Date.now()}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      accountId,
      note,
    };

    const updatedDebts = currentDebts.map((d) => {
      if (d.id === debtId) {
        return {
          ...d,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          isFullyPaid: isPaid,
          repayments: [repaymentItem, ...d.repayments],
        };
      }
      return d;
    });

    db.saveDebts(updatedDebts);
    setDebts(updatedDebts);

    // Record repayment transaction
    db.addTransaction({
      type: target.type === 'lend' ? 'repayment_received' : 'repayment_given',
      amount,
      accountId,
      personId: target.personId,
      debtId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      description:
        target.type === 'lend'
          ? `${person?.name || ''} থেকে পাওনা টাকা আদায় / ফেরত`
          : `${person?.name || ''} কে নেওয়া ঋণের টাকা পরিশোধ`,
      note,
    });

    setTransactions(db.getTransactions());
    setAccounts(db.getAccounts());
  };

  // Handlers for Budgets
  const handleSaveBudget = (budgetData: Omit<Budget, 'id'>) => {
    const currentBudgets = db.getBudgets();
    const existingIndex = currentBudgets.findIndex(
      (b) => b.categoryId === budgetData.categoryId && b.month === budgetData.month
    );

    let updated: Budget[];
    if (existingIndex >= 0) {
      updated = [...currentBudgets];
      updated[existingIndex] = { ...updated[existingIndex], ...budgetData };
    } else {
      updated = [...currentBudgets, { ...budgetData, id: `b_${Date.now()}` }];
    }

    db.saveBudgets(updated);
    setBudgets(updated);
  };

  // Handlers for Recurring
  const handleAddRecurring = (itemData: Omit<RecurringTransaction, 'id'>) => {
    const current = db.getRecurring();
    const newItem: RecurringTransaction = {
      ...itemData,
      id: `rec_${Date.now()}`,
    };
    const updated = [newItem, ...current];
    db.saveRecurring(updated);
    setRecurring(updated);
  };

  const handlePayRecurring = (item: RecurringTransaction) => {
    db.addTransaction({
      type: item.type,
      amount: item.amount,
      accountId: item.accountId,
      categoryId: item.categoryId,
      date: todayStr,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      description: `নিয়মিত বিল: ${item.title}`,
      note: item.description,
    });
    setTransactions(db.getTransactions());
    setAccounts(db.getAccounts());
    alert(settings.language === 'bn' ? 'লেনদেন সফলভাবে রেকর্ড করা হয়েছে!' : 'Transaction recorded successfully!');
  };

  // Handlers for Diary
  const handleSaveDiary = (entry: DiaryEntry) => {
    const current = db.getDiaries();
    const existing = current.findIndex((d) => d.date === entry.date);
    let updated: DiaryEntry[];
    if (existing >= 0) {
      updated = [...current];
      updated[existing] = entry;
    } else {
      updated = [entry, ...current];
    }
    db.saveDiaries(updated);
    setDiaries(updated);
  };

  // Handlers for Settings & Data
  const handleUpdateProfile = (newProfile: UserProfile) => {
    db.saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    db.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSeedDemoData = () => {
    db.seedDemoData();
    refreshAllState();
  };

  const handleClearAllData = () => {
    db.clearAllData();
    refreshAllState();
  };

  const handleExportJSON = () => {
    const jsonStr = db.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jibonify-daily-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = db.exportCSVTransactions();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jibonify-transactions-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render view router based on currentTab
  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <MainDashboard
            accounts={accounts}
            transactions={transactions}
            categories={categories}
            daySession={currentDaySession}
            activeOutsideSession={currentOutsideSession}
            dailyClosings={dailyClosings}
            onStartDay={() => setShowDayStartModal(true)}
            onGoOutside={() => setShowOutsideModal(true)}
            onReturnHome={() => setShowReturnHomeModal(true)}
            onCloseDay={() => setShowDailyClosingModal(true)}
            onOpenQuickExpense={() => {
              setTransactionModalType('expense');
              setShowTransactionModal(true);
            }}
            onOpenQuickIncome={() => {
              setTransactionModalType('income');
              setShowTransactionModal(true);
            }}
            onOpenTransfer={() => setShowTransferModal(true)}
            onViewReceipt={(img, title) => setReceiptViewerData({ url: img, title })}
            onViewAllTransactions={() => setCurrentTab('transactions')}
            language={settings.language}
          />
        );
      case 'accounts':
        return (
          <AccountsView
            accounts={accounts}
            transactions={transactions}
            onAddAccount={handleAddAccount}
            onOpenTransfer={() => setShowTransferModal(true)}
            onSelectAccount={(accId) => {
              setSelectedAccountIdForFilter(accId);
              setCurrentTab('transactions');
            }}
            language={settings.language}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            selectedAccountId={selectedAccountIdForFilter}
            onClearAccountFilter={() => setSelectedAccountIdForFilter(undefined)}
            onOpenQuickExpense={() => {
              setTransactionModalType('expense');
              setShowTransactionModal(true);
            }}
            onOpenQuickIncome={() => {
              setTransactionModalType('income');
              setShowTransactionModal(true);
            }}
            onOpenTransfer={() => setShowTransferModal(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onViewReceipt={(img, title) => setReceiptViewerData({ url: img, title })}
            onExportCSV={handleExportCSV}
            language={settings.language}
          />
        );
      case 'outside':
        return (
          <OutsideJourneysView
            outsideSessions={outsideSessions}
            onGoOutside={() => setShowOutsideModal(true)}
            onReturnHome={() => setShowReturnHomeModal(true)}
            language={settings.language}
          />
        );
      case 'people':
        return (
          <PeopleView
            people={people}
            debts={debts}
            accounts={accounts}
            onAddPerson={handleAddPerson}
            onAddDebt={handleAddDebt}
            onAddRepayment={handleAddRepayment}
            language={settings.language}
          />
        );
      case 'budget':
        return (
          <BudgetView
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            onSaveBudget={handleSaveBudget}
            language={settings.language}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            transactions={transactions}
            dailyClosings={dailyClosings}
            diaries={diaries}
            categories={categories}
            accounts={accounts}
            language={settings.language}
          />
        );
      case 'diary':
        return (
          <DailyDiaryView
            diaries={diaries}
            transactions={transactions}
            onSaveDiary={handleSaveDiary}
            language={settings.language}
          />
        );
      case 'reports':
        return (
          <ReportsView
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            language={settings.language}
          />
        );
      case 'reminders':
        return (
          <RemindersView
            recurring={recurring}
            accounts={accounts}
            categories={categories}
            onAddRecurring={handleAddRecurring}
            onPayRecurring={handlePayRecurring}
            language={settings.language}
          />
        );
      case 'settings':
        return (
          <SettingsView
            profile={profile}
            settings={settings}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSettings={handleUpdateSettings}
            onSeedDemoData={handleSeedDemoData}
            onClearAllData={handleClearAllData}
            onExportJSON={handleExportJSON}
            onImportJSON={(str) => {
              db.importAllDataJSON(str);
              refreshAllState();
            }}
            onExportCSV={handleExportCSV}
            language={settings.language}
            onOpenAdminDashboard={() => setCurrentTab('admin')}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            profile={profile}
            settings={settings}
            categories={categories}
            accounts={accounts}
            transactions={transactions}
            language={settings.language}
            onRefreshAll={refreshAllState}
            onUpdateSettings={handleUpdateSettings}
            onOpenSettings={() => setCurrentTab('settings')}
            onExitAdmin={() => setCurrentTab('home')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white ${settings.theme === 'light' ? 'theme-light' : 'dark'}`}>
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedAccountIdForFilter(undefined);
          setCurrentTab(tab);
        }}
        language={settings.language}
        setLanguage={(lang) => handleUpdateSettings({ ...settings, language: lang })}
        theme={settings.theme}
        setTheme={(th) => handleUpdateSettings({ ...settings, theme: th })}
        profile={profile}
        onLockApp={() => setIsAppLocked(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Maintenance Mode Banner */}
      {settings.maintenanceMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-300 px-4 py-2 text-xs flex items-center justify-center gap-2 font-semibold">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>
            {settings.language === 'bn'
              ? 'সিস্টেম রক্ষণাবেক্ষণ মোড সক্রিয় রয়েছে। ড্যাশবোর্ড অডিট চলছে।'
              : 'System Maintenance Mode is currently active.'}
          </span>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedAccountIdForFilter(undefined);
            setCurrentTab(tab);
          }}
          language={settings.language}
          onOpenQuickExpense={() => {
            setTransactionModalType('expense');
            setShowTransactionModal(true);
          }}
          onOpenQuickIncome={() => {
            setTransactionModalType('income');
            setShowTransactionModal(true);
          }}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 pb-28 md:pb-8 min-w-0 max-w-5xl w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedAccountIdForFilter(undefined);
          setCurrentTab(tab);
        }}
        language={settings.language}
        onOpenQuickExpense={() => {
          setTransactionModalType('expense');
          setShowTransactionModal(true);
        }}
        onOpenQuickIncome={() => {
          setTransactionModalType('income');
          setShowTransactionModal(true);
        }}
        onOpenTransfer={() => setShowTransferModal(true)}
      />

      {/* Floating Offline Connectivity Indicator */}
      <OfflineIndicator language={settings.language} />

      {/* PIN App Lock Modal if locked */}
      {isAppLocked && profile.pinLockEnabled && (
        <PinLockModal
          correctPin={profile.pinCode || '1234'}
          onSuccess={() => setIsAppLocked(false)}
          language={settings.language}
        />
      )}

      {/* Day Start Modal */}
      {showDayStartModal && (
        <DayStartModal
          accounts={accounts}
          onConfirm={handleConfirmDayStart}
          onClose={() => setShowDayStartModal(false)}
          language={settings.language}
        />
      )}

      {/* Outside Mode Modal */}
      {showOutsideModal && (
        <OutsideModeModal
          defaultPocketCash={accounts.find((a) => a.isDefaultPocket || a.subType === 'pocket')?.balance || 0}
          onConfirm={handleConfirmOutside}
          onClose={() => setShowOutsideModal(false)}
          language={settings.language}
        />
      )}

      {/* Return Home Reconciliation Modal */}
      {showReturnHomeModal && currentOutsideSession && (
        <ReturnHomeModal
          session={currentOutsideSession}
          transactions={transactions}
          onConfirmReconciliation={handleConfirmReconciliation}
          onClose={() => setShowReturnHomeModal(false)}
          language={settings.language}
        />
      )}

      {/* Daily Closing Modal */}
      {showDailyClosingModal && (
        <DailyClosingModal
          daySession={currentDaySession}
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          onConfirmClosing={handleConfirmDailyClosing}
          onClose={() => setShowDailyClosingModal(false)}
          language={settings.language}
        />
      )}

      {/* Fast Transaction Modal (Expense / Income) */}
      {showTransactionModal && (
        <TransactionModal
          initialType={transactionModalType}
          accounts={accounts}
          categories={categories}
          activeOutsideSession={currentOutsideSession}
          onSave={handleSaveTransaction}
          onClose={() => setShowTransactionModal(false)}
          language={settings.language}
        />
      )}

      {/* Money Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          accounts={accounts}
          onSave={handleSaveTransaction}
          onClose={() => setShowTransferModal(false)}
          language={settings.language}
        />
      )}

      {/* Receipt Viewer Modal */}
      {receiptViewerData && (
        <ReceiptViewerModal
          imageUrl={receiptViewerData.url}
          title={receiptViewerData.title}
          onClose={() => setReceiptViewerData(null)}
          language={settings.language}
        />
      )}

      {/* Profile & Security Modal */}
      {showProfileModal && (
        <AuthModal
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowProfileModal(false)}
          language={settings.language}
        />
      )}
    </div>
  );
}
