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
  initialDebts,
  initialTransactions,
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
  TaskStatus,
  Debt,
  Transaction
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

  // App Data State (loaded from Firestore with persistence)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
          dbDebts,
          dbTransactions,
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
          loadCollection<Debt>('debts'),
          loadCollection<Transaction>('transactions'),
          loadCollection<CalendarEvent>('calendarEvents'),
          loadCollection<LifeEvent>('lifeEvents'),
          loadCollection<Note>('notes'),
          loadCollection<NotificationItem>('notifications'),
          loadPreferences()
        ]);

        if (isMounted) {
          setTasks(dbTasks);
          setBankAccounts(dbAccounts);
          setCreditCards(dbCards);
          setBills(dbBills);
          setExpenses(dbExpenses);
          setSavingsGoals(dbGoals);
          setDebts(dbDebts);
          setTransactions(dbTransactions);
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
  const handleAddExpense = async (newExp: Expense, sourceAccountId?: string) => {
    setExpenses((prev) => [newExp, ...prev]);

    // Update account balance if bank account selected or matched
    let targetAccId = sourceAccountId;
    if (!targetAccId && bankAccounts.length > 0) {
      const matched = bankAccounts.find(
        (a) => newExp.paymentMethod.includes(a.bank) || newExp.paymentMethod.includes(a.name)
      );
      targetAccId = matched?.id || bankAccounts[0]?.id;
    }

    if (targetAccId) {
      setBankAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === targetAccId) {
            const updated = {
              ...acc,
              currentBalance: Math.max(0, acc.currentBalance - newExp.amount),
              availableBalance: Math.max(0, (acc.availableBalance ?? acc.currentBalance) - newExp.amount),
            };
            saveDocument('bankAccounts', updated).catch(console.error);
            return updated;
          }
          return acc;
        })
      );
    }

    // If paid by credit card, update card outstanding
    if (newExp.paymentMethod.toLowerCase().includes('card') || newExp.paymentMethod.toLowerCase().includes('regalia')) {
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

    // Ledger Transaction Record
    const newTx: Transaction = {
      id: `tx-exp-${Date.now()}`,
      title: newExp.title,
      amount: newExp.amount,
      type: 'expense',
      category: newExp.category,
      sourceAccountId: targetAccId,
      date: newExp.date || new Date().toISOString().split('T')[0],
      time: newExp.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: newExp.paymentMethod,
    };
    setTransactions((prev) => [newTx, ...prev]);

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
      await saveDocument('transactions', newTx);
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
            availableBalance: Math.max(0, (a.availableBalance ?? a.currentBalance) - amount),
          };
          saveDocument('bankAccounts', updated).catch(console.error);
          return updated;
        }
        return a;
      })
    );

    // If credit card bill, clear credit card balance
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

    // Ledger Transaction Record
    const billTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      title: `Bill Payment: ${bill?.name || 'Bill'}`,
      amount,
      type: 'bill_payment',
      category: bill?.category || 'Bills',
      sourceAccountId: accountId,
      billId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'Bank Transfer / Netbanking',
    };
    setTransactions((prev) => [billTx, ...prev]);

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
      description: `${preferences.currencySymbol}${amount.toLocaleString('en-IN')} paid successfully. Account balance updated.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'bill',
      amount,
      metadata: {
        category: 'Finance',
        savingsImpact: 'Cleared liability',
      },
    };
    setLifeEvents((prev) => [newLifeEvent, ...prev]);

    try {
      await saveDocument('expenses', billExpense);
      await saveDocument('transactions', billTx);
      await saveDocument('lifeEvents', newLifeEvent);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSavingsFund = async (goalId: string, amount: number, sourceAccountId?: string) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? updatedGoal : g))
    );

    // If source account selected, deduct from bank account
    if (sourceAccountId) {
      setBankAccounts((prev) =>
        prev.map((a) => {
          if (a.id === sourceAccountId) {
            const updated = {
              ...a,
              currentBalance: Math.max(0, a.currentBalance - amount),
              availableBalance: Math.max(0, (a.availableBalance ?? a.currentBalance) - amount),
            };
            saveDocument('bankAccounts', updated).catch(console.error);
            return updated;
          }
          return a;
        })
      );

      // Add transfer transaction
      const tx: Transaction = {
        id: `tx-goal-${Date.now()}`,
        title: `Savings Allocation: ${goal.title}`,
        amount,
        type: 'transfer',
        category: 'Investment',
        sourceAccountId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: `Allocated to ${goal.title}`,
      };
      setTransactions((prev) => [tx, ...prev]);
      saveDocument('transactions', tx).catch(console.error);
    }

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

  const handleAddCreditCard = async (card: CreditCard) => {
    setCreditCards((prev) => [...prev, card]);
    try {
      await saveDocument('creditCards', card);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBill = async (newBill: Bill) => {
    setBills((prev) => [newBill, ...prev]);
    try {
      await saveDocument('bills', newBill);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDebt = async (newDebt: Debt) => {
    setDebts((prev) => [newDebt, ...prev]);
    try {
      await saveDocument('debts', newDebt);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSettleDebt = async (debtId: string, accountId: string, amount: number) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const remaining = Math.max(0, (debt.outstandingAmount || debt.totalAmount) - amount);
    const updatedDebt: Debt = {
      ...debt,
      outstandingAmount: remaining,
      status: remaining === 0 ? 'settled' : 'active',
      settledAt: remaining === 0 ? new Date().toISOString() : undefined,
    };

    setDebts((prev) => prev.map((d) => (d.id === debtId ? updatedDebt : d)));

    // Adjust bank account balance
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const delta = debt.direction === 'owe' ? -amount : amount;
          const newBal = Math.max(0, acc.currentBalance + delta);
          const updated = {
            ...acc,
            currentBalance: newBal,
            availableBalance: newBal,
          };
          saveDocument('bankAccounts', updated).catch(console.error);
          return updated;
        }
        return acc;
      })
    );

    // Record ledger transaction
    const tx: Transaction = {
      id: `tx-debt-${Date.now()}`,
      title: debt.direction === 'owe' ? `Repaid Debt to ${debt.personOrEntity}` : `Collected Debt from ${debt.personOrEntity}`,
      amount,
      type: 'debt_repayment',
      category: 'Transfer',
      sourceAccountId: debt.direction === 'owe' ? accountId : undefined,
      destinationAccountId: debt.direction === 'owed_to_me' ? accountId : undefined,
      debtId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'Direct Bank Settlement',
    };
    setTransactions((prev) => [tx, ...prev]);

    try {
      await saveDocument('debts', updatedDebt);
      await saveDocument('transactions', tx);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTransferFunds = async (fromAccountId: string, toAccountId: string, amount: number) => {
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) {
          const newBal = Math.max(0, acc.currentBalance - amount);
          const updated = { ...acc, currentBalance: newBal, availableBalance: newBal };
          saveDocument('bankAccounts', updated).catch(console.error);
          return updated;
        }
        if (acc.id === toAccountId) {
          const newBal = acc.currentBalance + amount;
          const updated = { ...acc, currentBalance: newBal, availableBalance: newBal };
          saveDocument('bankAccounts', updated).catch(console.error);
          return updated;
        }
        return acc;
      })
    );

    const fromAcc = bankAccounts.find((a) => a.id === fromAccountId);
    const toAcc = bankAccounts.find((a) => a.id === toAccountId);

    const tx: Transaction = {
      id: `tx-trf-${Date.now()}`,
      title: `Transfer: ${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'}`,
      amount,
      type: 'transfer',
      category: 'Transfer',
      sourceAccountId: fromAccountId,
      destinationAccountId: toAccountId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'Account-to-Account Transfer',
    };
    setTransactions((prev) => [tx, ...prev]);

    try {
      await saveDocument('transactions', tx);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTransaction = async (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    try {
      await saveDocument('transactions', tx);
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
        dbDebts,
        dbTransactions,
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
        loadCollection<Debt>('debts'),
        loadCollection<Transaction>('transactions'),
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
      setDebts(dbDebts);
      setTransactions(dbTransactions);
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
    setDebts([]);
    setTransactions([]);
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
    setDebts(initialDebts);
    setTransactions(initialTransactions);
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

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;

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
          else if (type === 'bill') setActiveTab('finance');
        }}
        onOpenSearch={() => setActiveTab('tasks')}
        onOpenNotifications={() => setActiveTab('timeline')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        tasks={tasks}
        bills={bills}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex transition-all ${
          deviceMode === 'mobile'
            ? 'justify-center items-start py-6 px-4 bg-gradient-to-b from-[#080B11] via-[#0A0D15] to-[#07090E]'
            : 'w-full bg-[#07090E] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.08),rgba(255,255,255,0))]'
        }`}
      >
        {/* If Mobile Mode is active, wrap in simulated device frame */}
        <div
          className={`flex-1 flex flex-col transition-all ${
            deviceMode === 'mobile'
              ? 'max-w-[412px] h-[855px] bg-[#0A0D14] border-[7px] border-neutral-700/80 rounded-[52px] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12)] overflow-hidden relative ring-1 ring-white/10'
              : 'w-full'
          }`}
        >
          {/* Simulated Mobile Flagship Status Bar & Dynamic Island */}
          {deviceMode === 'mobile' && (
            <div className="h-10 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/[0.06] px-6 flex items-center justify-between text-[11px] font-mono text-neutral-400 select-none z-30 shrink-0">
              <span className="font-semibold text-white tracking-tight">09:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-28 h-6 bg-black rounded-full border border-white/[0.08] flex items-center justify-between px-2.5 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[9px] text-neutral-400 font-sans font-medium">LIVE</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="text-[10px] font-sans font-bold text-neutral-400">5G</span>
                <div className="w-5 h-2.5 rounded-sm border border-neutral-400/80 p-0.5 flex items-center">
                  <div className="w-3.5 h-full bg-emerald-400 rounded-2xs"></div>
                </div>
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
                  debts={debts}
                  onToggleTaskStatus={handleToggleTaskStatus}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onOpenPlanDay={() => setIsPlanDayModalOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onPayBillModal={(bill) => {
                    handlePayBill(bill.id, bankAccounts[0]?.id || 'acc-1', bill.amount);
                  }}
                  onQuickAdd={(type) => {
                    if (type === 'task') setActiveTab('tasks');
                    else if (type === 'expense') setActiveTab('finance');
                    else setActiveTab('finance');
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
                  debts={debts}
                  transactions={transactions}
                  initialSubTab={
                    activeTab === 'expenses' ? 'expenses' : activeTab === 'bills' ? 'bills' : activeTab === 'goals' ? 'goals' : 'overview'
                  }
                  onAddExpense={handleAddExpense}
                  onPayBill={handlePayBill}
                  onAddSavingsFund={handleAddSavingsFund}
                  onAddBankAccount={handleAddBankAccount}
                  onAddCreditCard={handleAddCreditCard}
                  onAddBill={handleAddBill}
                  onAddDebt={handleAddDebt}
                  onSettleDebt={handleSettleDebt}
                  onAddTransaction={handleAddTransaction}
                  onTransferFunds={handleTransferFunds}
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

          {/* Bottom Navigation for Mobile */}
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenVoiceAdd={() => setIsVoiceAddModalOpen(true)}
            onOpenQuickAdd={() => setActiveTab('tasks')}
            pendingTasksCount={pendingTasksCount}
            isSimulatedMobile={deviceMode === 'mobile'}
          />

          {/* Simulated Mobile Bottom Home Swipe Bar */}
          {deviceMode === 'mobile' && (
            <div className="absolute bottom-1.5 left-0 right-0 pointer-events-none z-50 flex justify-center">
              <div className="w-32 h-1 bg-white/30 rounded-full shadow-xs"></div>
            </div>
          )}
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
          onAddBill={handleAddBill}
          onAddDebt={handleAddDebt}
          onTransferFunds={handleTransferFunds}
          preferences={preferences}
          bankAccounts={bankAccounts}
        />
      )}
    </div>
  );
}
