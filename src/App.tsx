import React, { useState, useEffect } from 'react';
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
import {
  loadCollection,
  saveDocument,
  removeDocument,
  loadPreferences,
  savePreferences,
  resetDatabaseToFresh,
  seedDemoData,
  cleanPreferences
} from './lib/database';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Data State (default starts empty / fresh or loaded from Firestore)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(cleanPreferences);
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(true);

  // Cross-device sync status
  const [syncStatus, setSyncStatus] = useState({
    lastSyncTime: 'Connecting to DB...',
    isSyncing: false,
    activeDevices: ['Desktop Web', 'Mobile PWA'],
  });

  // Modals
  const [isPlanDayModalOpen, setIsPlanDayModalOpen] = useState(false);
  const [isVoiceAddModalOpen, setIsVoiceAddModalOpen] = useState(false);

  // Initial load from Firebase Firestore database
  useEffect(() => {
    let isMounted = true;
    async function initDatabase() {
      setIsLoadingFromDb(true);
      try {
        const [
          dbTasks,
          dbAccounts,
          dbCards,
          dbBills,
          dbExpenses,
          dbGoals,
          dbEvents,
          dbLife,
          dbNotes,
          dbNotifications,
          dbPref
        ] = await Promise.all([
          loadCollection<Task>('tasks'),
          loadCollection<BankAccount>('bankAccounts'),
          loadCollection<CreditCard>('creditCards'),
          loadCollection<Bill>('bills'),
          loadCollection<Expense>('expenses'),
          loadCollection<SavingsGoal>('savingsGoals'),
          loadCollection<CalendarEvent>('calendarEvents'),
          loadCollection<LifeEvent>('lifeEvents'),
          loadCollection<Note>('notes'),
          loadCollection<NotificationItem>('notifications'),
          loadPreferences()
        ]);

        if (isMounted) {
          // If Firestore is completely fresh and unseeded, we start with a clean slate!
          // No sample data forced unless user requests it.
          setTasks(dbTasks);
          setBankAccounts(dbAccounts);
          setCreditCards(dbCards);
          setBills(dbBills);
          setExpenses(dbExpenses);
          setSavingsGoals(dbGoals);
          setCalendarEvents(dbEvents);
          setLifeEvents(dbLife);
          setNotes(dbNotes);
          setNotifications(dbNotifications);
          if (dbPref) {
            setPreferences(dbPref);
          } else {
            setPreferences(cleanPreferences);
            await savePreferences(cleanPreferences);
          }

          setSyncStatus({
            lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSyncing: false,
            activeDevices: ['Desktop Web', 'Mobile PWA'],
          });
        }
      } catch (err) {
        console.warn('Error loading from Firestore:', err);
      } finally {
        if (isMounted) {
          setIsLoadingFromDb(false);
        }
      }
    }

    initDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers for Tasks
  const handleToggleTaskStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTask: Task = {
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    try {
      await saveDocument('tasks', updatedTask);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedTask: Task = { ...task, status };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    try {
      await saveDocument('tasks', updatedTask);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (newTask: Task) => {
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

    try {
      await saveDocument('tasks', newTask);
      await saveDocument('lifeEvents', newLifeEvent);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    try {
      await saveDocument('tasks', updatedTask);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await removeDocument('tasks', taskId);
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Finances
  const handleAddExpense = async (newExp: Expense) => {
    setExpenses((prev) => [newExp, ...prev]);

    // Update account balance
    let updatedAccs = bankAccounts.map((acc) => {
      if (newExp.paymentMethod.includes(acc.bank) || newExp.paymentMethod.includes('UPI')) {
        const updated = {
          ...acc,
          currentBalance: Math.max(0, acc.currentBalance - newExp.amount),
          availableBalance: Math.max(0, acc.availableBalance - newExp.amount),
        };
        saveDocument('bankAccounts', updated).catch(console.error);
        return updated;
      }
      return acc;
    });
    setBankAccounts(updatedAccs);

    // If paid by credit card, update card outstanding
    if (newExp.paymentMethod.toLowerCase().includes('regalia') || newExp.paymentMethod.toLowerCase().includes('card')) {
      setCreditCards((prev) =>
        prev.map((c) => {
          const updated = {
            ...c,
            currentOutstanding: c.currentOutstanding + newExp.amount,
            availableLimit: Math.max(0, c.availableLimit - newExp.amount),
          };
          saveDocument('creditCards', updated).catch(console.error);
          return updated;
        })
      );
    }

    // Append life event
    const newLifeEvent: LifeEvent = {
      id: `life-exp-${Date.now()}`,
      title: `Expense Recorded: ${preferences.currencySymbol}${newExp.amount.toLocaleString('en-IN')}`,
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

    try {
      await saveDocument('expenses', newExp);
      await saveDocument('lifeEvents', newLifeEvent);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayBill = async (billId: string, accountId: string, amount: number) => {
    const bill = bills.find((b) => b.id === billId);
    const updatedBill: Bill = bill ? { ...bill, status: 'paid', paidAt: new Date().toISOString() } : {
      id: billId,
      name: 'Paid Bill',
      category: 'Other',
      amount,
      dueDate: new Date().toISOString().split('T')[0],
      frequency: 'monthly',
      status: 'paid',
      autoPay: false,
      reminderDaysBefore: 1
    };

    setBills((prev) => prev.map((b) => (b.id === billId ? updatedBill : b)));
    saveDocument('bills', updatedBill).catch(console.error);

    // Deduct from bank account
    setBankAccounts((prev) =>
      prev.map((a) => {
        if (a.id === accountId) {
          const updated = {
            ...a,
            currentBalance: Math.max(0, a.currentBalance - amount),
            availableBalance: Math.max(0, a.availableBalance - amount),
          };
          saveDocument('bankAccounts', updated).catch(console.error);
          return updated;
        }
        return a;
      })
    );

    // If credit card bill
    if (bill && bill.category === 'Credit Card') {
      setCreditCards((prev) =>
        prev.map((c) => {
          const updated = {
            ...c,
            currentOutstanding: Math.max(0, c.currentOutstanding - amount),
            availableLimit: Math.min(c.creditLimit, c.availableLimit + amount),
          };
          saveDocument('creditCards', updated).catch(console.error);
          return updated;
        })
      );
    }

    // Add expense record
    const billExpense: Expense = {
      id: `exp-bill-${Date.now()}`,
      title: `Paid Bill: ${bill?.name || 'Utility Bill'}`,
      amount,
      category: 'Bills',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'Netbanking / Debit',
      isEssential: true,
    };
    setExpenses((prev) => [billExpense, ...prev]);

    // Timeline event
    const newLifeEvent: LifeEvent = {
      id: `life-bill-${Date.now()}`,
      title: `Bill Paid: ${bill?.name || 'Bill'}`,
      description: `${preferences.currencySymbol}${amount.toLocaleString('en-IN')} paid successfully. Account balance cleared.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'bill',
      amount,
      metadata: {
        category: 'Finance',
        savingsImpact: 'Cleared liabilities',
      },
    };
    setLifeEvents((prev) => [newLifeEvent, ...prev]);

    try {
      await saveDocument('expenses', billExpense);
      await saveDocument('lifeEvents', newLifeEvent);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSavingsFund = async (goalId: string, amount: number) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? updatedGoal : g))
    );
    try {
      await saveDocument('savingsGoals', updatedGoal);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBankAccount = async (acc: BankAccount) => {
    setBankAccounts((prev) => [...prev, acc]);
    try {
      await saveDocument('bankAccounts', acc);
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Calendar Events
  const handleAddCalendarEvent = async (event: CalendarEvent) => {
    setCalendarEvents((prev) => [...prev, event]);
    try {
      await saveDocument('calendarEvents', event);
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Notes
  const handleAddNote = async (note: Note) => {
    setNotes((prev) => [note, ...prev]);
    try {
      await saveDocument('notes', note);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await removeDocument('notes', noteId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePinNote = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const updatedNote = { ...note, pinned: !note.pinned };
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? updatedNote : n))
    );
    try {
      await saveDocument('notes', updatedNote);
    } catch (e) {
      console.error(e);
    }
  };

  // Manual Trigger Sync
  const handleTriggerSync = async () => {
    setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
    try {
      const [
        dbTasks,
        dbAccounts,
        dbCards,
        dbBills,
        dbExpenses,
        dbGoals,
        dbEvents,
        dbLife,
        dbNotes,
        dbPref
      ] = await Promise.all([
        loadCollection<Task>('tasks'),
        loadCollection<BankAccount>('bankAccounts'),
        loadCollection<CreditCard>('creditCards'),
        loadCollection<Bill>('bills'),
        loadCollection<Expense>('expenses'),
        loadCollection<SavingsGoal>('savingsGoals'),
        loadCollection<CalendarEvent>('calendarEvents'),
        loadCollection<LifeEvent>('lifeEvents'),
        loadCollection<Note>('notes'),
        loadPreferences()
      ]);

      setTasks(dbTasks);
      setBankAccounts(dbAccounts);
      setCreditCards(dbCards);
      setBills(dbBills);
      setExpenses(dbExpenses);
      setSavingsGoals(dbGoals);
      setCalendarEvents(dbEvents);
      setLifeEvents(dbLife);
      setNotes(dbNotes);
      if (dbPref) setPreferences(dbPref);

      setSyncStatus({
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSyncing: false,
        activeDevices: ['Desktop Web', 'Mobile PWA'],
      });
    } catch (e) {
      console.error(e);
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  // Fresh Start / Database Reset handler
  const handleResetDatabase = async () => {
    await resetDatabaseToFresh();
    setTasks([]);
    setBankAccounts([]);
    setCreditCards([]);
    setBills([]);
    setExpenses([]);
    setSavingsGoals([]);
    setCalendarEvents([]);
    setLifeEvents([]);
    setNotes([]);
    setNotifications([]);
    setPreferences(cleanPreferences);
    setSyncStatus({
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSyncing: false,
      activeDevices: ['Desktop Web', 'Mobile PWA'],
    });
  };

  // Optional Seed Demo Data handler
  const handleSeedDemoData = async () => {
    await seedDemoData();
    setTasks(initialTasks);
    setBankAccounts(initialBankAccounts);
    setCreditCards(initialCreditCards);
    setBills(initialBills);
    setExpenses(initialExpenses);
    setSavingsGoals(initialSavingsGoals);
    setCalendarEvents(initialCalendarEvents);
    setLifeEvents(initialLifeEvents);
    setNotes(initialNotes);
    setNotifications(initialNotifications);
    setPreferences(initialPreferences);
    setSyncStatus({
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSyncing: false,
      activeDevices: ['Desktop Web', 'Mobile PWA'],
    });
  };

  const handleUpdatePreferences = async (newPref: UserPreferences) => {
    setPreferences(newPref);
    try {
      await savePreferences(newPref);
    } catch (e) {
      console.error(e);
    }
  };

  // Plan Day application
  const handleApplyPlanDay = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    updatedTasks.forEach((t) => saveDocument('tasks', t).catch(console.error));
  };

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
              {isLoadingFromDb && (
                <div className="mb-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center gap-3 text-xs text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span>Syncing with Firestore Cloud Database...</span>
                </div>
              )}

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
                  onAddBankAccount={handleAddBankAccount}
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
                  onUpdatePreferences={handleUpdatePreferences}
                  syncStatus={syncStatus}
                  onTriggerSync={handleTriggerSync}
                  onResetDatabase={handleResetDatabase}
                  onSeedDemoData={handleSeedDemoData}
                  isFirebaseActive={true}
                />
              )}
            </main>
          </div>

          {/* Bottom Navigation for Mobile (shown when in mobile simulated mode OR on actual small screen width) */}
          <div className={deviceMode === 'mobile' ? 'block' : 'lg:hidden'}>
            <MobileBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenVoiceAdd={() => setIsVoiceAddModalOpen(true)}
              onOpenQuickAdd={() => setActiveTab('tasks')}
            />
          </div>
        </div>
      </div>

      {/* Plan Day Modal */}
      {isPlanDayModalOpen && (
        <PlanDayModal
          isOpen={isPlanDayModalOpen}
          onClose={() => setIsPlanDayModalOpen(false)}
          tasks={tasks}
          preferences={preferences}
          bills={bills}
          onApplyPlan={handleApplyPlanDay}
        />
      )}

      {/* Voice Add Modal */}
      {isVoiceAddModalOpen && (
        <VoiceAddModal
          isOpen={isVoiceAddModalOpen}
          onClose={() => setIsVoiceAddModalOpen(false)}
          onAddTask={handleAddTask}
          onAddExpense={handleAddExpense}
          onAddBill={async (newBill) => {
            setBills((prev) => [newBill, ...prev]);
            try {
              await saveDocument('bills', newBill);
            } catch (e) {
              console.error(e);
            }
          }}
          preferences={preferences}
        />
      )}
    </div>
  );
}
