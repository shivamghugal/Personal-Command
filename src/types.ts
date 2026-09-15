export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'deferred';

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

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  type: 'Salary' | 'Savings' | 'Checking' | 'Cash' | 'Investment';
  currentBalance: number;
  availableBalance: number;
  accountNumberMasked: string;
  notes?: string;
}

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
  totalDue: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  apr?: number;
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
  | 'Other';

export type BillStatus = 'upcoming' | 'due_today' | 'overdue' | 'paid';

export interface Bill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  frequency: 'monthly' | 'weekly' | 'quarterly' | 'yearly' | 'one-time';
  status: BillStatus;
  autoPay: boolean;
  reminderDaysBefore: number;
  accountId?: string;
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
  paymentMethod: string; // "HDFC Salary", "Credit Card", "Cash"
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

export interface ExtractedTaskData {
  type: 'task' | 'expense' | 'bill';
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
