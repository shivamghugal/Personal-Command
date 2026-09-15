import React, { useState } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  Sidebar, 
  TabType 
} from './components/Sidebar';
import { 
  MobileBottomNav 
} from './components/MobileBottomNav';
import { 
  DashboardView 
} from './components/DashboardView';
import { 
  TasksView 
} from './components/TasksView';
import { 
  CalendarView 
} from './components/CalendarView';
import { 
  FinanceView 
} from './components/FinanceView';
import { 
  AIAssistantView 
} from './components/AIAssistantView';
import { 
  TimelineFeedView 
} from './components/TimelineFeedView';
import { 
  NotesView 
} from './components/NotesView';
import { 
  SettingsView 
} from './components/SettingsView';
import { 
  PlanDayModal 
} from './components/PlanDayModal';
import { 
  VoiceAddModal 
} from './components/VoiceAddModal';

import {
  initialTasks,
  initialBankAccounts,
  initialCreditCards,
  initialBills,
  initialExpenses,
  initialSavingsGoals,
  initialCalendarEvents,
  initialLifeEvents,
  initialNotes,
  initialNotifications,
  initialPreferences,
} from './data/initialData';
import { 
  Task, 
  Bill, 
  BankAccount, 
  CreditCard, 
  Expense, 
  SavingsGoal, 
  CalendarEvent, 
  LifeEvent, 
  Note, 
  NotificationItem,
  UserPreferences, 
  TaskStatus 
} from './types';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Data State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(initialCreditCards);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(initialLifeEvents);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications || []);
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);

  // Cross-device sync status
  const [syncStatus, setSyncStatus] = useState({
    lastSyncTime: 'Just now',
    isSyncing: false,
    activeDevices: ['Desktop Chrome', 'Mobile PWA'],
  });

  // Modals
  const [isPlanDayModalOpen, setIsPlanDayModalOpen] = useState(false);
  const [isVoiceAddModalOpen, setIsVoiceAddModalOpen] = useState(false);

  // Handlers for Tasks
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus: TaskStatus = t.status === 'completed' ? 'pending' : 'completed';
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);

    // Append a connected life event to timeline
    const newLifeEvent: LifeEvent = {
      id: `life-${Date.now()}`,
      title: `Task Scheduled: ${newTask.title}`,
      description: `Added to ${newTask.category} schedule with priority ${newTask.priority}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'task',
      metadata: {
        location: newTask.location,
        category: newTask.category,
      },
    };
    setLifeEvents((prev) => [newLifeEvent, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Handlers for Finances
  const handleAddExpense = (newExp: Expense) => {
    setExpenses((prev) => [newExp, ...prev]);

    // Update account balance
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (newExp.paymentMethod.includes(acc.bank) || newExp.paymentMethod.includes('UPI')) {
          return {
            ...acc,
            currentBalance: Math.max(0, acc.currentBalance - newExp.amount),
            availableBalance: Math.max(0, acc.availableBalance - newExp.amount),
          };
        }
        return acc;
      })
    );

    // If paid by credit card, update card outstanding
    if (newExp.paymentMethod.toLowerCase().includes('regalia')) {
      setCreditCards((prev) =>
        prev.map((c) =>
          c.id === 'card-1'
            ? {
                ...c,
                currentOutstanding: c.currentOutstanding + newExp.amount,
                availableLimit: Math.max(0, c.availableLimit - newExp.amount),
              }
            : c
        )
      );
    }

    // Append life event
    const newLifeEvent: LifeEvent = {
      id: `life-exp-${Date.now()}`,
      title: `Expense Recorded: ₹${newExp.amount.toLocaleString('en-IN')}`,
      description: `${newExp.title} recorded via ${newExp.paymentMethod}. Monthly spend updated.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'expense',
      amount: newExp.amount,
      metadata: {
        category: newExp.category,
        savingsImpact: 'Updated monthly budget and savings rate',
      },
    };
    setLifeEvents((prev) => [newLifeEvent, ...prev]);
  };

  const handlePayBill = (billId: string, accountId: string, amount: number) => {
    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: 'paid' } : b))
    );

    // Deduct from bank account
    setBankAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              currentBalance: Math.max(0, a.currentBalance - amount),
              availableBalance: Math.max(0, a.availableBalance - amount),
            }
          : a
      )
    );

    // If the bill was a credit card bill, reset or reduce credit card outstanding
    const bill = bills.find((b) => b.id === billId);
    if (bill && bill.category === 'Credit Card') {
      setCreditCards((prev) =>
        prev.map((c) => ({
          ...c,
          currentOutstanding: Math.max(0, c.currentOutstanding - amount),
          availableLimit: Math.min(c.creditLimit, c.availableLimit + amount),
        }))
      );
    }

    // Add expense record
    const billExpense: Expense = {
      id: `exp-bill-${Date.now()}`,
      title: `Paid Bill: ${bill?.name || 'Utility Bill'}`,
      amount,
      category: 'Bills',
      date: '2026-09-15',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'Netbanking / Debit',
      isEssential: true,
    };
    setExpenses((prev) => [billExpense, ...prev]);

    // Timeline event
    const newLifeEvent: LifeEvent = {
      id: `life-bill-${Date.now()}`,
      title: `Bill Paid: ${bill?.name || 'Bill'}`,
      description: `₹${amount.toLocaleString('en-IN')} paid successfully. Account balance cleared.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'bill',
      amount,
      metadata: {
        category: 'Finance',
        savingsImpact: 'Cleared liabilities',
      },
    };
    setLifeEvents((prev) => [newLifeEvent, ...prev]);
  };

  const handleAddSavingsFund = (goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
  };

  // Handlers for Calendar Events
  const handleAddCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents((prev) => [...prev, event]);
  };

  // Handlers for Notes
  const handleAddNote = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleTogglePinNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Manual Trigger Sync
  const handleTriggerSync = () => {
    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
    setTimeout(() => {
      setSyncStatus({
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSyncing: false,
        activeDevices: ['Desktop Chrome', 'Mobile PWA', 'Tablet'],
      });
    }, 1000);
  };

  // Plan Day application
  const handleApplyPlanDay = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  // Count pending tasks for badges
  const pendingTasksCount = (tasks || []).filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Primary Global Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        preferences={preferences}
        notifications={notifications}
        onOpenVoiceAdd={() => setIsVoiceAddModalOpen(true)}
        onOpenPlanDay={() => setIsPlanDayModalOpen(true)}
        onOpenAI={() => setActiveTab('ai')}
        onOpenQuickAdd={(type) => {
          if (type === 'task') setActiveTab('tasks');
          else if (type === 'expense') setActiveTab('finance');
          else if (type === 'bill') setActiveTab('bills');
        }}
        onOpenSearch={() => setActiveTab('tasks')}
        onOpenNotifications={() => setActiveTab('timeline')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        tasks={tasks}
        bills={bills}
      />

      {/* Main Container: Supports standard desktop full-width OR interactive mobile frame simulation */}
      <div
        className={`flex-1 flex transition-all ${
          deviceMode === 'mobile'
            ? 'justify-center items-start py-6 px-4 bg-neutral-900/50'
            : 'w-full'
        }`}
      >
        {/* If Mobile Mode is active, wrap in a simulated mobile device frame */}
        <div
          className={`flex-1 flex flex-col transition-all ${
            deviceMode === 'mobile'
              ? 'max-w-[420px] h-[850px] bg-neutral-950 border-4 border-neutral-700/80 rounded-[44px] shadow-2xl overflow-hidden relative ring-8 ring-neutral-900/80'
              : 'w-full'
          }`}
        >
          {/* Simulated Mobile Status Bar (Visible only when in Mobile View Mode) */}
          {deviceMode === 'mobile' && (
            <div className="h-9 bg-neutral-900/90 border-b border-neutral-800 px-6 flex items-center justify-between text-[11px] font-mono text-neutral-400 select-none z-30 shrink-0">
              <span className="font-semibold text-white">09:41</span>
              {/* Dynamic Island / Notch indicator */}
              <div className="w-20 h-4 bg-neutral-950 rounded-full border border-neutral-800 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500/80"></span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Core App Shell: Sidebar + Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar (Desktop view) */}
            {deviceMode === 'desktop' && (
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tasks={tasks}
                bills={bills}
                bankAccounts={bankAccounts}
                isOpenMobile={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Scrollable View Content Canvas */}
            <main
              id="main-app-content"
              className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${
                deviceMode === 'mobile' ? 'pb-24 pt-4 px-4' : 'pb-16'
              }`}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  preferences={preferences}
                  tasks={tasks}
                  bills={bills}
                  bankAccounts={bankAccounts}
                  creditCards={creditCards}
                  expenses={expenses}
                  savingsGoals={savingsGoals}
                  onToggleTaskStatus={handleToggleTaskStatus}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onOpenPlanDay={() => setIsPlanDayModalOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onPayBillModal={(bill) => {
                    handlePayBill(bill.id, bankAccounts[0]?.id || 'acc-1', bill.amount);
                  }}
                  onQuickAdd={(type) => {
                    if (type === 'task') setActiveTab('tasks');
                    else if (type === 'expense') setActiveTab('expenses');
                    else setActiveTab('bills');
                  }}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleTaskStatus={handleToggleTaskStatus}
                  onOpenVoiceAdd={() => setIsVoiceAddModalOpen(true)}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarView
                  events={calendarEvents}
                  tasks={tasks}
                  bills={bills}
                  onAddEvent={handleAddCalendarEvent}
                  onOpenPlanDay={() => setIsPlanDayModalOpen(true)}
                  onUpdateTask={handleUpdateTask}
                />
              )}

              {(activeTab === 'finance' || activeTab === 'expenses' || activeTab === 'bills' || activeTab === 'goals') && (
                <FinanceView
                  preferences={preferences}
                  bankAccounts={bankAccounts}
                  creditCards={creditCards}
                  bills={bills}
                  expenses={expenses}
                  savingsGoals={savingsGoals}
                  onAddExpense={handleAddExpense}
                  onPayBill={handlePayBill}
                  onAddSavingsFund={handleAddSavingsFund}
                  onAddBankAccount={(acc) => setBankAccounts((prev) => [...prev, acc])}
                />
              )}

              {activeTab === 'ai' && (
                <AIAssistantView
                  preferences={preferences}
                  tasks={tasks}
                  bills={bills}
                  bankAccounts={bankAccounts}
                  expenses={expenses}
                  onApplyPlan={handleApplyPlanDay}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineFeedView
                  lifeEvents={lifeEvents}
                  tasks={tasks}
                  expenses={expenses}
                />
              )}

              {activeTab === 'notes' && (
                <NotesView
                  notes={notes}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                  onTogglePin={handleTogglePinNote}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  preferences={preferences}
                  onUpdatePreferences={(newPref) => setPreferences(newPref)}
                  syncStatus={syncStatus}
                  onTriggerSync={handleTriggerSync}
                />
              )}
            </main>
          </div>

          {/* Bottom Navigation for Mobile (shown when in mobile simulated mode OR on actual small screen width) */}
          <div className={deviceMode === 'mobile' ? 'block' : 'lg:hidden'}>
            <MobileBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenQuickAdd={() => setIsVoiceAddModalOpen(true)}
              pendingTasksCount={pendingTasksCount}
            />
          </div>
        </div>
      </div>

      {/* Plan Day AI Modal */}
      <PlanDayModal
        isOpen={isPlanDayModalOpen}
        onClose={() => setIsPlanDayModalOpen(false)}
        tasks={tasks}
        bills={bills}
        preferences={preferences}
        onApplyPlan={handleApplyPlanDay}
      />

      {/* Voice Add Task Modal */}
      <VoiceAddModal
        isOpen={isVoiceAddModalOpen}
        onClose={() => setIsVoiceAddModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
