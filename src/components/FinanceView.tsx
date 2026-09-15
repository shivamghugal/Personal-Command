import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { 
  BankAccount, 
  CreditCard, 
  Bill, 
  Expense, 
  SavingsGoal, 
  UserPreferences,
  ExpenseCategory 
} from '../types';

interface FinanceViewProps {
  preferences: UserPreferences;
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  bills: Bill[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  onAddExpense: (expense: Expense) => void;
  onPayBill: (billId: string, accountId: string, amount: number) => void;
  onAddSavingsFund: (goalId: string, amount: number) => void;
  onAddBankAccount: (account: BankAccount) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  preferences,
  bankAccounts = [],
  creditCards = [],
  bills = [],
  expenses = [],
  savingsGoals = [],
  onAddExpense,
  onPayBill,
  onAddSavingsFund,
  onAddBankAccount,
}) => {
  const safeAccounts = bankAccounts || [];
  const safeCards = creditCards || [];
  const safeBills = bills || [];
  const safeExpenses = expenses || [];
  const safeGoals = savingsGoals || [];

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'accounts' | 'cards' | 'bills' | 'expenses' | 'goals'>('overview');
  
  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [selectedBillToPay, setSelectedBillToPay] = useState<Bill | null>(null);
  const [payFromAccountId, setPayFromAccountId] = useState<string>(safeAccounts[0]?.id || '');
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);
  const [selectedGoalToAddFund, setSelectedGoalToAddFund] = useState<SavingsGoal | null>(null);
  const [fundAmountInput, setFundAmountInput] = useState('5000');

  // New Expense form state
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Food');
  const [expMethod, setExpMethod] = useState('HDFC Salary');
  const [expIsEssential, setExpIsEssential] = useState(false);

  // Financial aggregates
  const totalBalance = safeAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const availableBalance = safeAccounts.reduce((sum, a) => sum + (a.availableBalance || 0), 0);
  const totalOutstanding = safeCards.reduce((sum, c) => sum + (c.currentOutstanding || 0), 0);
  const upcomingBillsTotal = safeBills
    .filter((b) => b.status !== 'paid')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const monthlySpending = safeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const essentialSpending = safeExpenses.filter((e) => e.isEssential).reduce((sum, e) => sum + (e.amount || 0), 0);
  const nonEssentialSpending = safeExpenses.filter((e) => !e.isEssential).reduce((sum, e) => sum + (e.amount || 0), 0);

  const monthlyIncome = preferences?.monthlyIncome || 95000;
  const currentSavings = monthlyIncome - monthlySpending;
  const savingsRate = monthlyIncome > 0 ? Math.round((currentSavings / monthlyIncome) * 100) : 0;

  // Category breakdown for expenses
  const categoryTotals: Record<string, number> = {};
  safeExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (e.amount || 0);
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      amount: amountNum,
      category: expCategory,
      date: '2026-09-15',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: expMethod,
      isEssential: expIsEssential,
    };

    onAddExpense(newExpense);
    setIsAddExpenseOpen(false);
    setExpTitle('');
    setExpAmount('');
  };

  const handleConfirmPayBill = () => {
    if (!selectedBillToPay) return;
    onPayBill(selectedBillToPay.id, payFromAccountId, selectedBillToPay.amount);
    setIsPayBillModalOpen(false);
    setSelectedBillToPay(null);
  };

  const handleConfirmAddFund = () => {
    if (!selectedGoalToAddFund) return;
    const amount = parseFloat(fundAmountInput);
    if (isNaN(amount) || amount <= 0) return;
    onAddSavingsFund(selectedGoalToAddFund.id, amount);
    setIsAddFundModalOpen(false);
    setSelectedGoalToAddFund(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Financial Command & Intelligence</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Holistic bank balances, credit card liabilities, expense tracking, and savings velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-expense-modal-trigger"
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-900 border border-neutral-800 rounded-2xl scrollbar-none">
        {[
          { id: 'overview', label: 'Financial Overview', icon: Layers },
          { id: 'accounts', label: 'Bank Accounts', icon: ShieldCheck },
          { id: 'cards', label: 'Credit Cards', icon: CreditCardIcon },
          { id: 'bills', label: 'Bills & Dues', icon: Receipt },
          { id: 'expenses', label: 'Expenses & Analytics', icon: PieChart },
          { id: 'goals', label: 'Savings Goals', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`subtab-finance-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. FINANCIAL OVERVIEW METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block font-medium">Total Balance</span>
          <span className="text-lg font-bold text-white font-mono block mt-1">
            ₹{totalBalance.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">3 Accounts linked</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block font-medium">Available Cash</span>
          <span className="text-lg font-bold text-emerald-400 font-mono block mt-1">
            ₹{availableBalance.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">Ready to spend</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block font-medium">Credit Card Due</span>
          <span className="text-lg font-bold text-rose-400 font-mono block mt-1">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-rose-300 block mt-0.5">Due in 5 days (Sep 20)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block font-medium">Upcoming Bills</span>
          <span className="text-lg font-bold text-amber-400 font-mono block mt-1">
            ₹{upcomingBillsTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-amber-300 block mt-0.5">Within 7 days</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block font-medium">Monthly Spend</span>
          <span className="text-lg font-bold text-neutral-200 font-mono block mt-1">
            ₹{monthlySpending.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">Sep 1 – Sep 15</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 block font-medium">Monthly Savings</span>
          <span className="text-lg font-bold text-indigo-400 font-mono block mt-1">
            ₹{currentSavings.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
            {savingsRate}% Savings Rate
          </span>
        </div>
      </div>

      {/* AI Financial Insights Proactive Banner */}
      <div className="p-4 rounded-2xl bg-violet-950/25 border border-violet-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-300">
              AI Connected Financial Insights
            </h2>
          </div>
          <span className="text-[11px] text-violet-300/80">
            Automated intelligence on spending & bills
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="font-semibold text-rose-300 block mb-1">
              ⚠ Regalia CC Payment Warning
            </span>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              ₹12,500 due on Sep 20. Your HDFC Salary balance (₹65,400) covers this easily. Clear it by Friday to maintain 0% interest.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="font-semibold text-emerald-300 block mb-1">
              📈 Grocery Route Savings
            </span>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Buying groceries on your commute home has cut unplanned takeout orders by 18% compared to last month.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="font-semibold text-amber-300 block mb-1">
              💡 Essential vs Non-Essential
            </span>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Essential spending: ₹{essentialSpending.toLocaleString('en-IN')} (74%). Discretionary leisure: ₹{nonEssentialSpending.toLocaleString('en-IN')} (26%).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="font-semibold text-indigo-300 block mb-1">
              🎯 Emergency Fund Progress
            </span>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Target: ₹1,00,000. Current: ₹65,000 (65%). At current pace, goal will be reached 2 weeks ahead of December deadline.
            </p>
          </div>
        </div>
      </div>

      {/* 2. BANK ACCOUNTS & CREDIT CARDS SECTION */}
      {(activeSubTab === 'overview' || activeSubTab === 'accounts' || activeSubTab === 'cards') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bank Accounts */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bank Accounts ({bankAccounts.length})</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Manual entry with future bank API sync capability
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{account.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-300 font-mono">
                        {account.accountNumberMasked}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{account.bank} • {account.type}</p>
                    {account.notes && (
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{account.notes}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-white font-mono block">
                      ₹{account.currentBalance.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Avail: ₹{account.availableBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Cards */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCardIcon className="w-4 h-4 text-rose-400" />
                  <span>Credit Cards ({creditCards.length})</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Limit tracking, due dates, and minimum payments
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {creditCards.map((card) => {
                const utilPercent = Math.round((card.currentOutstanding / card.creditLimit) * 100);
                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{card.name}</span>
                          <span className="text-[10px] text-rose-300 bg-rose-950/60 border border-rose-800/50 px-1.5 py-0.5 rounded font-semibold">
                            Due {card.paymentDueDate}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-400 block mt-0.5">{card.bank}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-rose-400 font-mono block">
                          ₹{card.currentOutstanding.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-neutral-400">Total Outstanding</span>
                      </div>
                    </div>

                    {/* Progress bar for credit limit utilization */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Utilization: {utilPercent}% (Limit ₹{card.creditLimit.toLocaleString('en-IN')})</span>
                        <span>Available: ₹{card.availableLimit.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-neutral-700/50 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${utilPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-700/40 text-xs">
                      <div>
                        <span className="text-[11px] text-neutral-400">Statement Due: </span>
                        <strong className="text-white font-mono">₹{card.totalDue.toLocaleString('en-IN')}</strong>
                      </div>
                      <button
                        onClick={() => {
                          // Find corresponding bill or trigger payment modal
                          const matchBill = bills.find((b) => b.category === 'Credit Card');
                          if (matchBill) {
                            setSelectedBillToPay(matchBill);
                            setIsPayBillModalOpen(true);
                          }
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Pay Card Bill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. BILLS MANAGEMENT */}
      {(activeSubTab === 'overview' || activeSubTab === 'bills') && (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Recurring Bills & Utilities ({bills.length})</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Electricity, broadband, rent, credit card statements, and auto-pay tracking
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              ₹{upcomingBillsTotal.toLocaleString('en-IN')} Pending Clearance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bills.map((bill) => {
              const isPaid = bill.status === 'paid';
              return (
                <div
                  key={bill.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    isPaid
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-70'
                      : 'bg-neutral-800/50 border-neutral-700/60 hover:border-neutral-600'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-neutral-700 text-neutral-300">
                        {bill.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : bill.status === 'due_today'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {bill.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold ${isPaid ? 'line-through text-neutral-400' : 'text-white'}`}>
                      {bill.name}
                    </h4>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-base font-bold text-white font-mono">
                        ₹{bill.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-neutral-400">
                        Due: <strong className="text-neutral-200">{bill.dueDate}</strong>
                      </span>
                    </div>

                    {bill.notes && (
                      <p className="text-[11px] text-neutral-400">{bill.notes}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-700/40 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      {bill.autoPay ? 'Autopay Enabled' : 'Manual Pay'}
                    </span>

                    {!isPaid ? (
                      <button
                        onClick={() => {
                          setSelectedBillToPay(bill);
                          setIsPayBillModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. EXPENSES & ESSENTIAL VS NON-ESSENTIAL ANALYTICS */}
      {(activeSubTab === 'overview' || activeSubTab === 'expenses') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Expense List */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" />
                  <span>Recent Expenses Log</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Manual, voice, and commute errand transactions
                </p>
              </div>

              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                + Add Expense
              </button>
            </div>

            <div className="space-y-2.5">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{expense.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          expense.isEssential
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-neutral-700 text-neutral-400'
                        }`}
                      >
                        {expense.isEssential ? 'Essential' : 'Non-Essential'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-700/50 text-neutral-300">
                        {expense.category}
                      </span>
                      <span>•</span>
                      <span>{expense.paymentMethod}</span>
                      <span>•</span>
                      <span>{expense.date} {expense.time ? `(${expense.time})` : ''}</span>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white font-mono">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Essential vs Non-Essential & Category Breakdown */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-violet-400" />
              <span>Spending Breakdown</span>
            </h3>

            {/* Essential vs Non-essential cards */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-semibold">Essential (Rent, Groceries, Fuel)</span>
                  <span className="font-bold text-white font-mono">₹{essentialSpending.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${monthlySpending > 0 ? (essentialSpending / monthlySpending) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-400 font-semibold">Non-Essential (Dining, Leisure)</span>
                  <span className="font-bold text-white font-mono">₹{nonEssentialSpending.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${monthlySpending > 0 ? (nonEssentialSpending / monthlySpending) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Category Bars */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-xs font-semibold text-neutral-400 block mb-2">
                Top Expense Categories
              </span>
              {Object.entries(categoryTotals).map(([cat, total]) => {
                const percent = Math.round((total / monthlySpending) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-300">{cat}</span>
                      <span className="text-neutral-400 font-mono">
                        ₹{total.toLocaleString('en-IN')} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. SAVINGS DASHBOARD & GOALS */}
      {(activeSubTab === 'overview' || activeSubTab === 'goals') && (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Savings Velocity & Milestone Goals</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Monthly income ₹{monthlyIncome.toLocaleString('en-IN')} • Target savings rate 40%+
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/50 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{goal.name}</h4>
                        <span className="text-[10px] text-neutral-400">{goal.category}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {percent}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-neutral-400">Saved:</span>
                      <span className="font-mono font-bold text-white">
                        ₹{goal.currentAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="w-full bg-neutral-700/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color || '#10b981',
                        }}
                      ></div>
                    </div>

                    {goal.aiRecommendation && (
                      <p className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2 rounded-lg leading-relaxed">
                        💡 {goal.aiRecommendation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-700/40 text-xs">
                    <span className="text-[10px] text-neutral-400">Target: {goal.targetDate}</span>
                    <button
                      onClick={() => {
                        setSelectedGoalToAddFund(goal);
                        setIsAddFundModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                    >
                      + Add Funds
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>Record New Expense</span>
              </h2>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Groceries at FreshMart"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="450"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Food">Food / Dining</option>
                    <option value="Transport">Transport / Metro</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Health">Health</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Payment Account
                </label>
                <select
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value)}
                  className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                >
                  <option value="UPI (HDFC Salary)">UPI (HDFC Salary)</option>
                  <option value="HDFC Regalia Gold">HDFC Regalia Gold (Credit Card)</option>
                  <option value="ICICI Amazon Pay">ICICI Amazon Pay (Credit Card)</option>
                  <option value="Cash">Cash in Wallet</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-essential"
                  checked={expIsEssential}
                  onChange={(e) => setExpIsEssential(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <label htmlFor="chk-essential" className="text-xs text-neutral-300">
                  Essential Spending (e.g. food, grocery, utility)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Bill Confirmation Modal */}
      {isPayBillModalOpen && selectedBillToPay && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Confirm Bill Payment</span>
              </h2>
              <button
                onClick={() => setIsPayBillModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Bill Name:</span>
                <span className="text-sm font-bold text-white">{selectedBillToPay.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Amount Due:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  ₹{selectedBillToPay.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Due Date:</span>
                <span className="text-xs font-mono text-neutral-300">{selectedBillToPay.dueDate}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Deduct from Bank Account:
              </label>
              <select
                value={payFromAccountId}
                onChange={(e) => setPayFromAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Balance: ₹{acc.availableBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              This action will mark the bill as paid, subtract ₹{selectedBillToPay.amount.toLocaleString('en-IN')} from your chosen account, and record the transaction in your expense log.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsPayBillModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayBill}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds to Savings Goal Modal */}
      {isAddFundModalOpen && selectedGoalToAddFund && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Add Funds: {selectedGoalToAddFund.name}</span>
              </h2>
              <button
                onClick={() => setIsAddFundModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Contribution Amount (₹)
              </label>
              <input
                type="number"
                value={fundAmountInput}
                onChange={(e) => setFundAmountInput(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddFundModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddFund}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Add to Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
