import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  CreditCard as CreditCardIcon, 
  Receipt, 
  TrendingUp, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart, 
  DollarSign, 
  Sparkles,
  Layers,
  Clock,
  ChevronRight,
  X,
  ArrowLeftRight,
  UserCheck,
  UserX,
  History,
  Tag,
  Calendar,
  Building2,
  Coins
} from 'lucide-react';
import { 
  BankAccount, 
  CreditCard, 
  Bill, 
  Expense, 
  SavingsGoal, 
  Debt,
  Transaction,
  UserPreferences,
  ExpenseCategory,
  AccountType,
  DebtDirection
} from '../types';

interface FinanceViewProps {
  preferences: UserPreferences;
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  bills: Bill[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  debts?: Debt[];
  transactions?: Transaction[];
  initialSubTab?: 'overview' | 'accounts' | 'cards' | 'debts' | 'transactions' | 'bills' | 'expenses' | 'goals';
  onAddExpense: (expense: Expense, sourceAccountId?: string) => void;
  onPayBill: (billId: string, accountId: string, amount: number) => void;
  onAddSavingsFund: (goalId: string, amount: number, sourceAccountId?: string) => void;
  onAddBankAccount: (account: BankAccount) => void;
  onAddCreditCard?: (card: CreditCard) => void;
  onAddBill?: (bill: Bill) => void;
  onAddDebt?: (debt: Debt) => void;
  onSettleDebt?: (debtId: string, accountId: string, amount: number) => void;
  onAddTransaction?: (transaction: Transaction) => void;
  onTransferFunds?: (fromAccountId: string, toAccountId: string, amount: number) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  preferences,
  bankAccounts = [],
  creditCards = [],
  bills = [],
  expenses = [],
  savingsGoals = [],
  debts = [],
  transactions = [],
  initialSubTab = 'overview',
  onAddExpense,
  onPayBill,
  onAddSavingsFund,
  onAddBankAccount,
  onAddCreditCard,
  onAddBill,
  onAddDebt,
  onSettleDebt,
  onAddTransaction,
  onTransferFunds,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'accounts' | 'cards' | 'debts' | 'transactions' | 'bills' | 'expenses' | 'goals'
  >(initialSubTab);

  // Today's ISO date string
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [selectedBillToPay, setSelectedBillToPay] = useState<Bill | null>(null);
  const [payFromAccountId, setPayFromAccountId] = useState<string>(bankAccounts[0]?.id || '');
  
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);
  const [selectedGoalToAddFund, setSelectedGoalToAddFund] = useState<SavingsGoal | null>(null);
  const [fundAmountInput, setFundAmountInput] = useState('5000');
  const [fundFromAccountId, setFundFromAccountId] = useState(bankAccounts[0]?.id || '');

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [isSettleDebtOpen, setIsSettleDebtOpen] = useState(false);
  const [selectedDebtToSettle, setSelectedDebtToSettle] = useState<Debt | null>(null);
  const [settleAmountInput, setSettleAmountInput] = useState('');
  const [settleAccountId, setSettleAccountId] = useState(bankAccounts[0]?.id || '');

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferFromId, setTransferFromId] = useState(bankAccounts[0]?.id || '');
  const [transferToId, setTransferToId] = useState(bankAccounts[1]?.id || bankAccounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');

  // Form States
  // Expense Form
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Food');
  const [expSourceAccount, setExpSourceAccount] = useState(bankAccounts[0]?.id || '');
  const [expIsEssential, setExpIsEssential] = useState(false);

  // Bank Account Form
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('Savings');
  const [accNumberMasked, setAccNumberMasked] = useState('');
  const [accCurrentBalance, setAccCurrentBalance] = useState('');
  const [accColor, setAccColor] = useState('#6366f1');

  // Credit Card Form
  const [cardName, setCardName] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardOutstanding, setCardOutstanding] = useState('0');
  const [cardDueDate, setCardDueDate] = useState('');

  // Debt Form
  const [debtPerson, setDebtPerson] = useState('');
  const [debtDirection, setDebtDirection] = useState<DebtDirection>('owe');
  const [debtCategory, setDebtCategory] = useState('Borrowed Money');
  const [debtTotalAmount, setDebtTotalAmount] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtNotes, setDebtNotes] = useState('');

  // Calculations
  const totalLiquidBalance = useMemo(() => {
    return bankAccounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
  }, [bankAccounts]);

  const totalCardOutstanding = useMemo(() => {
    return creditCards.reduce((sum, c) => sum + (Number(c.currentOutstanding) || 0), 0);
  }, [creditCards]);

  const totalUserOwes = useMemo(() => {
    return debts
      .filter((d) => d.direction === 'owe' && d.status !== 'settled')
      .reduce((sum, d) => sum + (Number(d.outstandingAmount) || 0), 0);
  }, [debts]);

  const totalOwedToUser = useMemo(() => {
    return debts
      .filter((d) => d.direction === 'owed_to_me' && d.status !== 'settled')
      .reduce((sum, d) => sum + (Number(d.outstandingAmount) || 0), 0);
  }, [debts]);

  // Total Liabilities: Credit Cards + Debts user owes
  const totalLiabilities = useMemo(() => {
    return totalCardOutstanding + totalUserOwes;
  }, [totalCardOutstanding, totalUserOwes]);

  // Total Assets: Bank Balances + Receivables (money owed to user)
  const totalAssets = useMemo(() => {
    return totalLiquidBalance + totalOwedToUser;
  }, [totalLiquidBalance, totalOwedToUser]);

  // Net Worth dynamically calculated
  const netWorth = useMemo(() => {
    return totalAssets - totalLiabilities;
  }, [totalAssets, totalLiabilities]);

  // Upcoming bills total
  const upcomingBillsTotal = useMemo(() => {
    return bills
      .filter((b) => b.status !== 'paid')
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  }, [bills]);

  // Monthly Expenses Total
  const monthlySpending = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const monthlyIncome = preferences?.monthlyIncome || 95000;
  const currentSavings = monthlyIncome - monthlySpending;
  const savingsRate = monthlyIncome > 0 ? Math.round((currentSavings / monthlyIncome) * 100) : 0;

  // Handlers
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const sourceAcc = bankAccounts.find((a) => a.id === expSourceAccount);
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      amount: amountNum,
      category: expCategory,
      date: todayDateStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: sourceAcc ? sourceAcc.name : 'UPI',
      isEssential: expIsEssential,
    };

    onAddExpense(newExpense, expSourceAccount);
    setIsAddExpenseOpen(false);
    setExpTitle('');
    setExpAmount('');
  };

  const handleCreateBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(accCurrentBalance) || 0;
    if (!accName.trim()) return;

    const newAcc: BankAccount = {
      id: `acc-${Date.now()}`,
      name: accName.trim(),
      type: accType,
      accountNumberMasked: accNumberMasked.trim() || '•••• 0000',
      currentBalance: balanceNum,
      availableBalance: balanceNum,
      color: accColor,
      isPrimary: bankAccounts.length === 0,
    };

    onAddBankAccount(newAcc);
    setIsAddAccountOpen(false);
    setAccName('');
    setAccCurrentBalance('');
    setAccNumberMasked('');
  };

  const handleCreateCreditCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !onAddCreditCard) return;
    const limitNum = parseFloat(cardLimit) || 100000;
    const outstandingNum = parseFloat(cardOutstanding) || 0;

    const newCard: CreditCard = {
      id: `card-${Date.now()}`,
      name: cardName.trim(),
      bank: cardBank.trim() || 'Bank',
      lastFourDigits: cardLastFour.trim() || '1234',
      creditLimit: limitNum,
      currentOutstanding: outstandingNum,
      availableLimit: Math.max(0, limitNum - outstandingNum),
      billingCycleDate: 15,
      statementDate: 15,
      paymentDueDate: cardDueDate || todayDateStr,
      minDue: Math.round(outstandingNum * 0.05),
      minimumDue: Math.round(outstandingNum * 0.05),
      totalDue: outstandingNum,
      color: '#4f46e5',
    };

    onAddCreditCard(newCard);
    setIsAddCardOpen(false);
    setCardName('');
    setCardBank('');
    setCardLastFour('');
    setCardLimit('');
    setCardOutstanding('0');
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPerson.trim() || !onAddDebt) return;
    const amountNum = parseFloat(debtTotalAmount) || 0;
    if (amountNum <= 0) return;

    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      personOrEntity: debtPerson.trim(),
      direction: debtDirection,
      category: debtCategory,
      totalAmount: amountNum,
      outstandingAmount: amountNum,
      dueDate: debtDueDate || todayDateStr,
      status: 'active',
      notes: debtNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddDebt(newDebt);
    setIsAddDebtOpen(false);
    setDebtPerson('');
    setDebtTotalAmount('');
    setDebtNotes('');
  };

  const handleConfirmSettleDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtToSettle || !onSettleDebt) return;
    const amountNum = parseFloat(settleAmountInput) || 0;
    if (amountNum <= 0) return;

    onSettleDebt(selectedDebtToSettle.id, settleAccountId, amountNum);
    setIsSettleDebtOpen(false);
    setSelectedDebtToSettle(null);
    setSettleAmountInput('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount) || 0;
    if (!transferFromId || !transferToId || transferFromId === transferToId || amountNum <= 0) return;
    if (onTransferFunds) {
      onTransferFunds(transferFromId, transferToId, amountNum);
    }
    setIsTransferOpen(false);
    setTransferAmount('');
  };

  const handleConfirmPayBill = () => {
    if (!selectedBillToPay) return;
    onPayBill(selectedBillToPay.id, payFromAccountId, selectedBillToPay.amount);
    setIsPayBillModalOpen(false);
    setSelectedBillToPay(null);
  };

  const handleConfirmAddFund = () => {
    if (!selectedGoalToAddFund) return;
    const amt = parseFloat(fundAmountInput);
    if (isNaN(amt) || amt <= 0) return;
    onAddSavingsFund(selectedGoalToAddFund.id, amt, fundFromAccountId);
    setIsAddFundModalOpen(false);
    setSelectedGoalToAddFund(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Net Worth Overview */}
      <div className="bg-gradient-to-br from-[#121626] via-[#0e121d] to-[#090c14] p-6 sm:p-8 rounded-3xl border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle decorative glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.07] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.09] backdrop-blur-md text-xs text-indigo-300 font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              <span>EXECUTIVE FINANCIAL BALANCE SHEET</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                {preferences.currencySymbol}{netWorth.toLocaleString('en-IN')}
              </h1>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${netWorth >= 0 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}>
                {netWorth >= 0 ? 'Positive Net Worth' : 'Net Liability Position'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-2.5 flex items-center gap-3.5 flex-wrap">
              <span>Liquid Assets: <strong className="text-emerald-400 font-mono">{preferences.currencySymbol}{totalLiquidBalance.toLocaleString('en-IN')}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>Receivables (Owed to you): <strong className="text-cyan-400 font-mono">{preferences.currencySymbol}{totalOwedToUser.toLocaleString('en-IN')}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>Liabilities (Cards & Debts): <strong className="text-rose-400 font-mono">{preferences.currencySymbol}{totalLiabilities.toLocaleString('en-IN')}</strong></span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-quick-add-expense"
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl flex items-center gap-1.5 shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
            <button
              id="btn-quick-transfer"
              onClick={() => setIsTransferOpen(true)}
              disabled={bankAccounts.length < 2}
              className="px-3.5 py-2.5 text-xs font-semibold bg-[#121624] hover:bg-[#181f33] border border-white/[0.09] hover:border-white/[0.18] text-white rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs"
            >
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
              <span>Transfer Funds</span>
            </button>
            <button
              id="btn-quick-add-debt"
              onClick={() => setIsAddDebtOpen(true)}
              className="px-3.5 py-2.5 text-xs font-semibold bg-[#121624] hover:bg-[#181f33] border border-white/[0.09] hover:border-white/[0.18] text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Add Debt / Loan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="p-1 bg-[#0b0e17] rounded-2xl border border-white/[0.08] flex items-center gap-1 overflow-x-auto custom-scrollbar shadow-inner">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'accounts', label: `Accounts (${bankAccounts.length})`, icon: Wallet },
          { id: 'cards', label: `Cards (${creditCards.length})`, icon: CreditCardIcon },
          { id: 'debts', label: `Debts & Loans (${debts.length})`, icon: Building2 },
          { id: 'transactions', label: `Ledger (${transactions.length})`, icon: History },
          { id: 'bills', label: `Bills (${bills.length})`, icon: Receipt },
          { id: 'expenses', label: `Expenses (${expenses.length})`, icon: DollarSign },
          { id: 'goals', label: `Savings Goals (${savingsGoals.length})`, icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`finance-subtab-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e17] border border-white/[0.08] shadow-md relative overflow-hidden group">
              <span className="text-xs text-neutral-400 block mb-1 font-medium">Total Liquid Cash</span>
              <span className="text-2xl font-extrabold text-white font-mono block">
                {preferences.currencySymbol}{totalLiquidBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Across {bankAccounts.length} savings & cash accounts
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e17] border border-white/[0.08] shadow-md relative overflow-hidden group">
              <span className="text-xs text-neutral-400 block mb-1 font-medium">Total Liabilities</span>
              <span className="text-2xl font-extrabold text-rose-400 font-mono block">
                {preferences.currencySymbol}{totalLiabilities.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Cards ({preferences.currencySymbol}{totalCardOutstanding.toLocaleString('en-IN')}) + Debts ({preferences.currencySymbol}{totalUserOwes.toLocaleString('en-IN')})
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e17] border border-white/[0.08] shadow-md relative overflow-hidden group">
              <span className="text-xs text-neutral-400 block mb-1 font-medium">Upcoming Bills</span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono block">
                {preferences.currencySymbol}{upcomingBillsTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                {bills.filter((b) => b.status !== 'paid').length} pending payments
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 block mb-1">Monthly Savings Rate</span>
              <span className="text-xl font-bold text-indigo-400 font-mono block">
                {savingsRate}%
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Saved {preferences.currencySymbol}{Math.max(0, currentSavings).toLocaleString('en-IN')} of income
              </span>
            </div>
          </div>

          {/* Connected Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Accounts Summary Box */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Bank Accounts & Cash</h3>
                <button
                  onClick={() => setActiveSubTab('accounts')}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {bankAccounts.map((acc) => (
                  <div key={acc.id} className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">{acc.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{acc.type} • {acc.accountNumberMasked}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {preferences.currencySymbol}{acc.currentBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Cards Summary Box */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Credit Cards Due</h3>
                <button
                  onClick={() => setActiveSubTab('cards')}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {creditCards.map((card) => (
                  <div key={card.id} className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">{card.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Due: {card.paymentDueDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-rose-400 block">
                        {preferences.currencySymbol}{card.currentOutstanding.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        Limit: {preferences.currencySymbol}{card.creditLimit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Debts & Receivables Summary Box */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Debts & Receivables</h3>
                <button
                  onClick={() => setActiveSubTab('debts')}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {debts.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 text-xs">No active debts logged.</div>
                ) : (
                  debts.slice(0, 3).map((d) => (
                    <div key={d.id} className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white">{d.personOrEntity}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            d.direction === 'owe' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {d.direction === 'owe' ? 'You Owe' : 'Owed to You'}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">Due: {d.dueDate}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {preferences.currencySymbol}{d.outstandingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BANK ACCOUNTS TAB */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Liquid Bank Accounts & Cash</h2>
              <p className="text-xs text-neutral-400">Track savings, checking, and physical cash balances</p>
            </div>
            <button
              id="btn-add-bank-account"
              onClick={() => setIsAddAccountOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: acc.color || '#6366f1' }}
                    ></div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {acc.type}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {acc.accountNumberMasked}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{acc.name}</h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {preferences.currencySymbol}{acc.currentBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                  <span>Spendable Balance:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {preferences.currencySymbol}{(acc.availableBalance ?? acc.currentBalance).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CREDIT CARDS TAB */}
      {activeSubTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Credit Cards & Billing Cycles</h2>
              <p className="text-xs text-neutral-400">Monitor credit utilization, limits, and due dates</p>
            </div>
            {onAddCreditCard && (
              <button
                id="btn-add-credit-card"
                onClick={() => setIsAddCardOpen(true)}
                className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Credit Card</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditCards.map((card) => {
              const utilPercent = card.creditLimit > 0
                ? Math.round((card.currentOutstanding / card.creditLimit) * 100)
                : 0;

              return (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{card.name}</h3>
                      <span className="text-xs text-neutral-400 font-mono">
                        {card.bank} •••• {card.lastFourDigits}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block">Due Date</span>
                      <span className="text-xs font-mono font-bold text-white">{card.paymentDueDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] text-neutral-400 block">Current Outstanding</span>
                      <span className="text-xl font-extrabold text-rose-400 font-mono">
                        {preferences.currencySymbol}{card.currentOutstanding.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block">Available Credit</span>
                      <span className="text-xl font-extrabold text-emerald-400 font-mono">
                        {preferences.currencySymbol}{card.availableLimit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Utilization</span>
                      <span className={`font-mono font-bold ${utilPercent > 30 ? 'text-amber-400' : 'text-neutral-300'}`}>
                        {utilPercent}% of {preferences.currencySymbol}{card.creditLimit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          utilPercent > 50 ? 'bg-rose-500' : utilPercent > 30 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, utilPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DEBTS & LIABILITIES TAB */}
      {activeSubTab === 'debts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Debts, Loans & Receivables</h2>
              <p className="text-xs text-neutral-400">First-class domain tracking for personal loans, borrowed money, and money lent</p>
            </div>
            <button
              id="btn-add-debt-entity"
              onClick={() => setIsAddDebtOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Debt Record</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Liabilities Column */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <UserX className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Money You Owe (Liabilities)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {preferences.currencySymbol}{totalUserOwes.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-3">
                {debts.filter((d) => d.direction === 'owe').length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">No liabilities logged. Great job!</div>
                ) : (
                  debts.filter((d) => d.direction === 'owe').map((d) => (
                    <div key={d.id} className="p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{d.personOrEntity}</span>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          {preferences.currencySymbol}{d.outstandingAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Category: {d.category}</span>
                        <span>Due: {d.dueDate}</span>
                      </div>
                      {d.notes && <p className="text-[11px] text-neutral-500 italic">{d.notes}</p>}
                      <div className="pt-2 border-t border-neutral-800 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedDebtToSettle(d);
                            setSettleAmountInput(d.outstandingAmount.toString());
                            setIsSettleDebtOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-neutral-700"
                        >
                          Repay / Settle Debt
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Receivables Column */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <UserCheck className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Money Owed To You (Receivables)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {preferences.currencySymbol}{totalOwedToUser.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-3">
                {debts.filter((d) => d.direction === 'owed_to_me').length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">No receivables recorded.</div>
                ) : (
                  debts.filter((d) => d.direction === 'owed_to_me').map((d) => (
                    <div key={d.id} className="p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{d.personOrEntity}</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {preferences.currencySymbol}{d.outstandingAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Category: {d.category}</span>
                        <span>Expected: {d.dueDate}</span>
                      </div>
                      {d.notes && <p className="text-[11px] text-neutral-500 italic">{d.notes}</p>}
                      <div className="pt-2 border-t border-neutral-800 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedDebtToSettle(d);
                            setSettleAmountInput(d.outstandingAmount.toString());
                            setIsSettleDebtOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700"
                        >
                          Mark Received
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TRANSACTIONS / LEDGER TAB */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Unified Ledger & Financial Transactions</h2>
              <p className="text-xs text-neutral-400">Chronological history of expenses, transfers, bill payments, and debt operations</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                No ledger transactions recorded yet. Record an expense, transfer funds, or pay a bill to populate the ledger.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.type === 'transfer' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> :
                         tx.type === 'transfer' ? <ArrowLeftRight className="w-4 h-4" /> :
                         <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{tx.title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {tx.date} • {tx.category} • {tx.paymentMethod || 'Ledger Entry'}
                        </span>
                      </div>
                    </div>

                    <span className={`font-mono font-bold text-xs ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-neutral-200'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{preferences.currencySymbol}{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. BILLS TAB */}
      {activeSubTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Upcoming & Recurring Bills</h2>
              <p className="text-xs text-neutral-400">Manage utilities, rent, and subscription dues</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bills.map((bill) => {
              const isPaid = bill.status === 'paid';
              return (
                <div
                  key={bill.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isPaid
                      ? 'bg-neutral-900/40 border-neutral-800 opacity-60'
                      : 'bg-neutral-900 border-neutral-800 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">{bill.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isPaid ? 'Paid' : `Due: ${bill.dueDate}`}
                    </span>
                  </div>

                  <div className="my-3">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {preferences.currencySymbol}{bill.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-neutral-400 block mt-0.5">{bill.category}</span>
                  </div>

                  {!isPaid && (
                    <button
                      id={`btn-pay-bill-${bill.id}`}
                      onClick={() => {
                        setSelectedBillToPay(bill);
                        setIsPayBillModalOpen(true);
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                    >
                      Pay Bill Online
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. EXPENSES TAB */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Logged Expenses</h2>
              <p className="text-xs text-neutral-400">Categorized expenditures and essential spend analysis</p>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
            {expenses.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-xs">No expenses logged yet.</div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{exp.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {exp.date} {exp.time ? `@ ${exp.time}` : ''} • {exp.category} • {exp.paymentMethod}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-rose-400">
                    -{preferences.currencySymbol}{exp.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. SAVINGS GOALS TAB */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Savings Goals & Emergency Funds</h2>
              <p className="text-xs text-neutral-400">Accumulate funds toward dedicated targets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => {
              const progress = goal.targetAmount > 0
                ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                : 0;

              return (
                <div key={goal.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{goal.title}</h3>
                      <span className="text-xs text-neutral-400">Target: {goal.targetDate}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-400">{progress}%</span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {preferences.currencySymbol}{goal.currentAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        / {preferences.currencySymbol}{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGoalToAddFund(goal);
                      setIsAddFundModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition-colors"
                  >
                    Add Deposit Fund
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Record Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Expense Title</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Groceries at FreshMart"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Amount ({preferences.currencySymbol})</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                  >
                    <option value="Food">Food</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Bills">Bills</option>
                    <option value="Health">Health</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Source Account</label>
                  <select
                    value={expSourceAccount}
                    onChange={(e) => setExpSourceAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                  >
                    {bankAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (₹{a.currentBalance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="exp-is-essential"
                  checked={expIsEssential}
                  onChange={(e) => setExpIsEssential(e.target.checked)}
                  className="rounded border-neutral-700"
                />
                <label htmlFor="exp-is-essential" className="text-neutral-300">
                  Essential expenditure (Groceries, Utilities, Healthcare)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Transfer Funds</h3>
              <button onClick={() => setIsTransferOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-medium">From Account</label>
                <select
                  value={transferFromId}
                  onChange={(e) => setTransferFromId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                >
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Balance: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">To Account</label>
                <select
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                >
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Balance: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Amount ({preferences.currencySymbol})</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Debt Modal */}
      {isAddDebtOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Debt or Loan Record</h3>
              <button onClick={() => setIsAddDebtOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Counterparty / Person Name</label>
                <input
                  type="text"
                  required
                  value={debtPerson}
                  onChange={(e) => setDebtPerson(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Direction</label>
                  <select
                    value={debtDirection}
                    onChange={(e) => setDebtDirection(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                  >
                    <option value="owe">I Owe Person (Liability)</option>
                    <option value="owed_to_me">Person Owes Me (Asset)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Category</label>
                  <select
                    value={debtCategory}
                    onChange={(e) => setDebtCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                  >
                    <option value="Borrowed Money">Borrowed Money</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Friend/Family Loan">Friend/Family Loan</option>
                    <option value="Lent Money">Lent Money</option>
                    <option value="EMI">EMI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Total Amount ({preferences.currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={debtTotalAmount}
                    onChange={(e) => setDebtTotalAmount(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Notes (Optional)</label>
                <input
                  type="text"
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  placeholder="e.g. For laptop purchase, repayment in 2 installments"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddDebtOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Settle Debt Modal */}
      {isSettleDebtOpen && selectedDebtToSettle && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {selectedDebtToSettle.direction === 'owe' ? 'Repay Debt to' : 'Record Received from'}{' '}
                {selectedDebtToSettle.personOrEntity}
              </h3>
              <button onClick={() => setIsSettleDebtOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettleDebt} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700">
                <span className="text-[11px] text-neutral-400 block">Total Remaining Outstanding</span>
                <span className="text-lg font-bold font-mono text-white">
                  {preferences.currencySymbol}{selectedDebtToSettle.outstandingAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Payment Amount</label>
                <input
                  type="number"
                  required
                  value={settleAmountInput}
                  onChange={(e) => setSettleAmountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">
                  {selectedDebtToSettle.direction === 'owe' ? 'Deduct from Account' : 'Deposit into Account'}
                </label>
                <select
                  value={settleAccountId}
                  onChange={(e) => setSettleAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                >
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Balance: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSettleDebtOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Bank Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Bank or Cash Account</h3>
              <button onClick={() => setIsAddAccountOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBankAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Account Name</label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. HDFC Salary Account or Physical Cash"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Account Type</label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Cash">Cash</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Masked Number</label>
                  <input
                    type="text"
                    value={accNumberMasked}
                    onChange={(e) => setAccNumberMasked(e.target.value)}
                    placeholder="•••• 4892"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Initial Balance ({preferences.currencySymbol})</label>
                <input
                  type="number"
                  required
                  value={accCurrentBalance}
                  onChange={(e) => setAccCurrentBalance(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Pay Bill Modal */}
      {isPayBillModalOpen && selectedBillToPay && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Confirm Bill Payment</h3>
              <button onClick={() => setIsPayBillModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2 text-xs">
              <span className="text-neutral-400 block">Bill to Pay:</span>
              <span className="text-sm font-bold text-white block">{selectedBillToPay.name}</span>
              <span className="text-2xl font-mono font-extrabold text-amber-400 block">
                {preferences.currencySymbol}{selectedBillToPay.amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-neutral-300 block font-medium">Pay From Account:</label>
              <select
                value={payFromAccountId}
                onChange={(e) => setPayFromAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-medium"
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Available: ₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsPayBillModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayBill}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Savings Fund Modal */}
      {isAddFundModalOpen && selectedGoalToAddFund && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Deposit to {selectedGoalToAddFund.title}</h3>
              <button onClick={() => setIsAddFundModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Deposit Amount ({preferences.currencySymbol})</label>
                <input
                  type="number"
                  value={fundAmountInput}
                  onChange={(e) => setFundAmountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">From Account</label>
                <select
                  value={fundFromAccountId}
                  onChange={(e) => setFundFromAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                >
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Balance: ₹{a.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddFundModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddFund}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Deposit Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
