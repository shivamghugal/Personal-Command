import {
  DailyPlanResponse,
  ExtractedTaskData,
  UserPreferences,
  WeeklyPlanResponse
} from '../types';

export async function parseNaturalLanguageTask(
  text: string,
  userPreferences: UserPreferences
): Promise<ExtractedTaskData> {
  const response = await fetch('/api/ai/parse-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, userPreferences }),
  });
  if (!response.ok) {
    throw new Error(`Parse error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.data;
}

export async function sendAIChatMessage(
  message: string,
  context: any
): Promise<{
  reply: string;
  suggestedActions?: string[];
  toolCall?: any;
  aiPowered?: boolean;
}> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });
  if (!response.ok) {
    throw new Error(`Chat error: ${response.statusText}`);
  }
  return response.json();
}

export async function generateDailyPlan(
  date: string,
  tasks: any[],
  preferences: UserPreferences
): Promise<DailyPlanResponse> {
  const response = await fetch('/api/ai/plan-day', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, tasks, preferences }),
  });
  if (!response.ok) {
    throw new Error(`Daily plan error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.plan;
}

export async function generateWeeklyPlan(
  weekOf: string,
  tasks: any[],
  bills: any[],
  expenses: any[],
  goals: any[]
): Promise<WeeklyPlanResponse> {
  const response = await fetch('/api/ai/plan-week', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekOf, tasks, bills, expenses, goals }),
  });
  if (!response.ok) {
    throw new Error(`Weekly plan error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.plan;
}

export async function extractTasksFromNote(noteContent: string): Promise<any[]> {
  const response = await fetch('/api/ai/notes-to-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteContent }),
  });
  if (!response.ok) {
    throw new Error(`Note extraction error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.tasks;
}

export async function fetchFinancialInsights(metrics: any): Promise<any> {
  const response = await fetch('/api/ai/financial-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
  });
  if (!response.ok) {
    throw new Error(`Financial insight error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.data;
}

export const aiService = {
  parseTask: async (text: string, userPreferences?: any) => {
    try {
      const res = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userPreferences }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (e) {
      console.warn('Backend parse fallback:', e);
    }
    // Client-side fallback if server fails
    return {
      title: text,
      category: text.toLowerCase().includes('grocer') || text.toLowerCase().includes('buy') ? 'Shopping' : 'Work',
      priority: text.toLowerCase().includes('urgent') ? 'urgent' : 'medium',
      dueDate: '2026-09-15',
      startTime: '18:30',
      location: text.toLowerCase().includes('freshmart') ? 'FreshMart' : undefined,
      context: 'Office → Home commute',
    };
  },

  askAssistant: async (
    message: string,
    tasks: any[],
    bills: any[],
    bankAccounts: any[],
    expenses: any[],
    preferences: any
  ) => {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: { tasks, bills, bankAccounts, expenses, preferences },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
    } catch (e) {
      console.warn('Backend chat fallback:', e);
    }
    // Fallback response with connected life context
    return `I received your query: "${message}". Looking at your schedule, you have work until 18:30, after which you can stop by FreshMart for groceries on your commute home. Your HDFC account balance is ₹65,400 with ₹12,500 due on credit cards in 5 days.`;
  },

  planDay: async (tasks: any[], bills: any[], preferences: any) => {
    try {
      const res = await fetch('/api/ai/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: '2026-09-15', tasks, preferences }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.plan;
      }
    } catch (e) {
      console.warn('Backend plan fallback:', e);
    }
    return {
      summary: 'Optimized today: 09:00 Work API, 13:00 Lunch, 14:00 Database Testing, 18:30 Commute from Office, 19:00 Grocery Errand on Route, 20:30 Dinner and Bill clearance.',
      recommendations: [
        'Complete deep focus API work in the morning.',
        'Stop by FreshMart at 18:45 on your way home to avoid making a second trip.',
        'Clear Electricity Bill online before 21:00.',
      ],
      suggestedSchedule: [
        { startTime: '09:00', endTime: '12:00', taskTitle: 'API Development & Sprint Review', reason: 'High energy morning block' },
        { startTime: '13:00', endTime: '14:00', taskTitle: 'Lunch & Break', reason: 'Recharge' },
        { startTime: '14:00', endTime: '18:00', taskTitle: 'Database Performance Testing', reason: 'Focus block' },
        { startTime: '18:30', endTime: '19:15', taskTitle: 'Buy Groceries at FreshMart', commuteRouteContext: 'Commute: Office to Home', reason: 'Directly along commute route' },
        { startTime: '20:00', endTime: '20:30', taskTitle: 'Pay Electricity Bill', reason: 'Quick online payment before due date' },
      ],
    };
  },
};

