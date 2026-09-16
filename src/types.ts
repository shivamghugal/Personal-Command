export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'deferred' | 'scheduled';

export type TaskCategory = 
  | 'Work'
  | 'Personal'
  | 'Finance'
  | 'Health'
  | 'Shopping'
  | 'Family'
  | 'Learning'
  | 'Travel'
  | 'Other'
  | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  startTime?: string; // HH:mm
  estimatedDuration?: number; // in minutes
  actualDuration?: number;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'custom';
  location?: string;
  context?: string; // e.g. "Office -> Home", "Gym", "Bank"
  locationBased?: boolean;
  triggerWhen?: string; // e.g. "When leaving office"
  relatedPerson?: string;
  relatedProject?: string;
  tags?: string[];
  notes?: string;
  reminder?: string;
  aiGenerated?: boolean;
  createdAt: string;
  completedAt?: string;
}

export type AccountType = 
  | 'Bank Account'
  | 'Salary'
  | 'Savings'
  | 'Checking'
  | 'Cash'
  | 'ATM Cash'
  | 'Wallet'
  | 'Investment'
  | 'Fixed Deposit'
  | 'Other Asset';

export interface BankAccount {
  id: string;
  name: string;
  bank?: string;
  institution?: string;
  type: AccountType;
  currentBalance: number;
  availableBalance: number;
  openingBalance?: number;
  accountNumberMasked?: string;
  currency?: string;
  color?: string;
  isPrimary?: boolean;
  status?: 'active' | 'archived';
  notes?: string;
  updatedAt?: string;
}

export type FinancialAccount = BankAccount;

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  creditLimit: number;
  availableLimit: number;
  currentOutstanding: number;
  statementDate: number; // Day of month, e.g. 15
  paymentDueDate: string; // YYYY-MM-DD
  minDue: number;
  minimumDue?: number;
  totalDue: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  lastFourDigits?: string;
  billingCycleDate?: number;
  apr?: number;
  color?: string;
  notes?: string;
}

// Debt domain model: Supports both "Money I Owe" (Liabilities) and "Money Owed To Me" (Assets)
export type DebtDirection = 'owe' | 'owed_to_me';
export type DebtCategory = 
  | 'Personal Debt' 
  | 'Loan' 
  | 'Credit Card' 
  | 'EMI' 
  | 'Borrowed Money' 
  | 'Lent Money';

export interface Debt {
  id: string;
  personOrEntity: string;
  direction: DebtDirection; // 'owe' (Liability / Money I owe) vs 'owed_to_me' (Asset / Money owed to me)
  category: DebtCategory;
  totalAmount: number;
  outstandingAmount: number;
  dueDate?: string;
  interestRate?: number;
  notes?: string;
  status: 'active' | 'settled';
  createdAt: string;
  settledAt?: string;
  updatedAt?: string;
}

// Unified Ledger Transaction Model
export type TransactionType = 
  | 'income'
  | 'expense'
  | 'transfer'
  | 'debt_borrowed'
  | 'debt_repayment'
  | 'loan_received'
  | 'loan_repayment'
  | 'credit_card_purchase'
  | 'credit_card_payment'
  | 'bill_payment'
  | 'investment'
  | 'withdrawal'
  | 'deposit';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time?: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  paymentMethod?: string;
  relatedDebtId?: string;
  relatedBillId?: string;
  relatedCreditCardId?: string;
  debtId?: string;
  billId?: string;
  cardId?: string;
  isEssential?: boolean;
  notes?: string;
  createdAt?: string;
}

export type BillCategory = 
  | 'Electricity'
  | 'Internet'
  | 'Mobile'
  | 'Rent'
  | 'Insurance'
  | 'Subscription'
  | 'Credit Card'
  | 'Loan'
  | 'Water'
  | 'Utilities'
  | 'Education'
  | 'Other';

export type BillStatus = 'upcoming' | 'due_soon' | 'due_today' | 'overdue' | 'paid' | 'skipped' | 'cancelled';
export type BillFrequency = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export interface Bill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  frequency: BillFrequency;
  status: BillStatus;
  autoPay: boolean;
  reminderDaysBefore: number;
  accountId?: string;
  paymentAccountId?: string;
  notes?: string;
  paidAt?: string;
  paymentTransactionId?: string;
}

export type ExpenseCategory = 
  | 'Food'
  | 'Groceries'
  | 'Transport'
  | 'Fuel'
  | 'Shopping'
  | 'Bills'
  | 'Utilities'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Travel'
  | 'Subscriptions'
  | 'Family'
  | 'Personal'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  time?: string;
  paymentMethod: string; // Dynamic account name or ID
  accountId?: string;
  isEssential: boolean;
  notes?: string;
  relatedTaskId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  category: string;
  color: string;
  aiRecommendation?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'task' | 'meeting' | 'appointment' | 'bill' | 'grocery' | 'travel';
  location?: string;
  status?: TaskStatus;
  relatedTaskId?: string;
  isAllDay?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  category?: 'Work' | 'Personal' | 'Ideas' | 'Shopping' | 'Finance' | string;
  pinned?: boolean;
  updatedAt: string;
  createdAt?: string;
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'task' | 'location' | 'expense' | 'bill';
  amount?: number;
  metadata?: {
    location?: string;
    category?: string;
    savingsImpact?: string;
  };
}


export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'bill' | 'credit_card' | 'location' | 'ai' | 'milestone';
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'urgent';
  actionLabel?: string;
  relatedId?: string;
}

export interface UserPreferences {
  name: string;
  greetingTitle: string;
  timezone: string;
  currencySymbol: string;
  currencyCode: string;
  workStartTime: string;
  workEndTime: string;
  officeLocation: string;
  homeLocation: string;
  monthlyBudget: number;
  monthlyIncome: number;
  notificationsEnabled: boolean;
  locationRemindersEnabled: boolean;
  soundEnabled: boolean;
}

export interface TimelineActivity {
  id: string;
  time: string;
  type: 'task_completed' | 'task_scheduled' | 'expense' | 'bill_due' | 'bill_paid' | 'reminder' | 'location_alert';
  title: string;
  subtitle?: string;
  amount?: number;
  category?: string;
  status?: string;
}

export interface AIPlanItem {
  time: string;
  endTime?: string;
  title: string;
  category: string;
  priority: Priority;
  location?: string;
  note?: string;
  isCommute?: boolean;
}

export interface DailyPlanResponse {
  date: string;
  summary: string;
  schedule: AIPlanItem[];
  conflictWarnings?: string[];
  financialAdvice?: string;
  groceryRecommendation?: string;
}

export interface WeeklyPlanResponse {
  weekOf: string;
  summary: string;
  priorities: string[];
  dailyHighlights: { day: string; focus: string; keyDeliverable: string }[];
  financialOutlook: { upcomingBillsTotal: number; advice: string };
}

export type ExtractedItemType = 'task' | 'expense' | 'income' | 'bill' | 'debt' | 'transfer' | 'note';

export interface ExtractedTaskData {
  type: ExtractedItemType;
  title: string;
  category: string;
  amount?: number;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
  startTime?: string;
  location?: string;
  context?: string;
  locationBased?: boolean;
  suggestedTime?: string;
  recurring?: boolean;
  recurrencePattern?: string;
  isEssential?: boolean;
  // Financial & Debt specific fields
  person?: string; // For debts or meetings
  debtDirection?: DebtDirection; // 'owe' or 'owed_to_me'
  sourceAccount?: string; // For transfers / expenses
  destinationAccount?: string; // For transfers / incomes
  frequency?: BillFrequency; // For recurring bills
  notes?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: any }[];
  toolCall?: {
    type: 'create_task' | 'create_expense' | 'pay_bill' | 'reschedule';
    data: any;
    confirmed?: boolean;
  };
}
