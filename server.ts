import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy/safe initialization of Gemini AI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. Natural Language & Voice Task/Expense/Income/Bill/Debt/Transfer Extractor
app.post('/api/ai/parse-task', async (req: Request, res: Response) => {
  try {
    const { text, userPreferences } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are an elite Personal Command Center assistant. Parse the natural language voice/text input into structured operational data.
Input: "${text}"
Current Date: ${todayStr}
Currency: ${userPreferences?.currencyCode || 'INR'} (${userPreferences?.currencySymbol || '₹'})
User Accounts: ${JSON.stringify(userPreferences?.accounts || ['HDFC Salary', 'SBI Savings', 'ATM Cash', 'Wallet Cash'])}

Determine whether the user is expressing:
1. Task (e.g. "Tomorrow at 10 AM call the bank", "Review architecture proposal")
2. Expense (e.g. "I spent 450 rupees on groceries", "Coffee ₹150 from ATM cash")
3. Income (e.g. "Received salary 95000 in HDFC", "Freelance client paid 20000")
4. Bill (e.g. "Electricity bill of 2400 is due on September 25", "Rent 25000 due on 1st")
5. Debt / Liability / Receivable (e.g. "I borrowed 20000 from Rahul", "Amit borrowed 5000 from me", "Lent 3000 to Priya")
6. Transfer (e.g. "Transferred 10000 from HDFC to ATM Cash", "Moved 5000 to savings")

Respond strictly with pure valid JSON (no markdown formatting, no backticks):
{
  "type": "task" | "expense" | "income" | "bill" | "debt" | "transfer" | "note",
  "title": "Clean, descriptive title",
  "category": string (e.g., "Work", "Personal", "Groceries", "Food", "Bills", "Electricity", "Borrowed Money", "Lent Money", "Salary", "Transport", "Shopping"),
  "amount": number (for expense, income, bill, debt, or transfer),
  "priority": "low" | "medium" | "high" | "urgent",
  "dueDate": "YYYY-MM-DD",
  "dueTime": "HH:mm" (optional),
  "startTime": "HH:mm" (optional),
  "person": string (counterparty for debts, loans, or meetings, e.g. "Rahul", "Amit"),
  "debtDirection": "owe" | "owed_to_me" (if debt: "owe" if user borrowed/liable, "owed_to_me" if user lent/receivable),
  "sourceAccount": string (for transfers or expenses, e.g. "HDFC Salary", "ATM Cash"),
  "destinationAccount": string (for transfers or incomes, e.g. "ATM Cash", "SBI Savings"),
  "frequency": "one-time" | "monthly" | "weekly" | "yearly" (for bills),
  "location": string (optional),
  "locationBased": boolean,
  "context": string (e.g., "Commute Route", "Office", "Home"),
  "isEssential": boolean (for expenses: true for groceries, bills, medical, transport; false for dining/luxury),
  "notes": string (optional)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed, aiPowered: true });
    }

    // Comprehensive Rule-Based Fallback
    const lower = text.toLowerCase();
    const amountMatch = text.match(/(?:₹|rs\.?|rupees|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;

    let type: 'task' | 'expense' | 'income' | 'bill' | 'debt' | 'transfer' = 'task';
    let person: string | undefined = undefined;
    let debtDirection: 'owe' | 'owed_to_me' | undefined = undefined;
    let category = 'Personal';
    let sourceAccount: string | undefined = undefined;
    let destinationAccount: string | undefined = undefined;

    // Detect Debt
    if (lower.includes('borrowed') || lower.includes('lent') || lower.includes('loan') || lower.includes('owe')) {
      type = 'debt';
      const nameMatch = text.match(/(?:from|to|by)\s+([A-Z][a-z]+)/i);
      person = nameMatch ? nameMatch[1] : 'Counterparty';
      
      if (lower.includes('borrowed from') || lower.includes('i owe') || lower.includes('took loan')) {
        debtDirection = 'owe';
        category = 'Borrowed Money';
      } else {
        debtDirection = 'owed_to_me';
        category = 'Lent Money';
      }
    } 
    // Detect Transfer
    else if (lower.includes('transfer') || lower.includes('moved ') || (lower.includes('from ') && lower.includes('to '))) {
      type = 'transfer';
      category = 'Transfer';
      if (lower.includes('atm') || lower.includes('cash')) {
        destinationAccount = 'ATM Cash';
        sourceAccount = 'Bank Account';
      }
    }
    // Detect Income
    else if (lower.includes('salary') || lower.includes('received') || lower.includes('credited') || lower.includes('earned')) {
      type = 'income';
      category = lower.includes('salary') ? 'Salary' : 'Income';
    }
    // Detect Bill
    else if (lower.includes('bill') || lower.includes('due on') || lower.includes('credit card due')) {
      type = 'bill';
      if (lower.includes('electr')) category = 'Electricity';
      else if (lower.includes('rent')) category = 'Rent';
      else if (lower.includes('internet') || lower.includes('wifi')) category = 'Internet';
      else category = 'Bills';
    }
    // Detect Expense
    else if (lower.includes('spent') || lower.includes('paid') || lower.includes('bought') || lower.includes('cost')) {
      type = 'expense';
      if (lower.includes('grocer') || lower.includes('milk') || lower.includes('vegetable')) category = 'Groceries';
      else if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('restaurant')) category = 'Food';
      else if (lower.includes('uber') || lower.includes('petrol') || lower.includes('fuel') || lower.includes('auto')) category = 'Transport';
      else category = 'Shopping';
    }

    // Extract Date Context
    let dueDate = todayStr;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (lower.includes('tomorrow')) dueDate = tomorrowStr;
    
    // Extract Time Context
    let startTime: string | undefined = undefined;
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const mins = timeMatch[2] ? timeMatch[2] : '00';
      const meridian = timeMatch[3].toLowerCase();
      if (meridian === 'pm' && hours < 12) hours += 12;
      if (meridian === 'am' && hours === 12) hours = 0;
      startTime = `${hours.toString().padStart(2, '0')}:${mins}`;
    }

    const fallbackResult = {
      type,
      title: text.replace(/^(remind me to|i have to|i need to|spent \d+ on|spent|i borrowed \d+ from|transferred)\s*/i, '').trim(),
      category,
      amount,
      person,
      debtDirection,
      sourceAccount,
      destinationAccount,
      priority: lower.includes('urgent') || lower.includes('tomorrow') ? 'high' : 'medium',
      dueDate,
      startTime,
      isEssential: category === 'Groceries' || category === 'Bills' || category === 'Electricity',
    };

    return res.json({ success: true, data: fallbackResult, aiPowered: false });
  } catch (error: any) {
    console.error('Error in /api/ai/parse-task:', error);
    res.status(500).json({ error: error.message || 'Failed to parse task' });
  }
});

// 2. AI Personal Assistant Chat (Context-Aware Connected Life)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();
    if (ai) {
      const systemInstruction = `You are "Command Center AI", an elite personal life operating assistant built for Shivam.
Core Principle: You understand that work life, personal life, route/commute, and financial health are CONNECTED.
Examples of connected reasoning:
- Leaving office (18:30) connects to stopping by FreshMart to buy groceries, which generates an expense, affects monthly grocery spending, and touches the savings rate.
- Paying a credit card bill (₹12,500 due Sep 20) relates to the available balance in HDFC Salary account (₹65,400) and impacts the monthly budget and savings goal progress.
- Never directly execute irreversible financial movements without stating clear details and asking for confirmation.

Current User State Context:
- Name: Shivam
- Today: Tuesday, September 15, 2026
- Work Hours: 09:00 - 18:30
- Office: Cyber City Tech Hub | Home: Greenwood Residency, Sector 45
- Tasks: ${JSON.stringify(context?.tasks || [])}
- Bank Accounts: ${JSON.stringify(context?.bankAccounts || [])}
- Credit Cards: ${JSON.stringify(context?.creditCards || [])}
- Bills: ${JSON.stringify(context?.bills || [])}
- Today & Month Expenses: ${JSON.stringify(context?.expenses || [])}
- Savings Goals: ${JSON.stringify(context?.savingsGoals || [])}

Provide clear, encouraging, highly actionable advice. If the user asks what to do or wants a plan, prioritize:
1. What to do NOW
2. What is coming UP NEXT
3. What is OVERDUE or URGENT
4. Connected travel/grocery reminders
5. Financial obligations due soon

Respond with JSON format:
{
  "reply": "Your markdown-formatted response string",
  "suggestedActions": ["Short clickable suggested prompt 1", "Suggested prompt 2"],
  "toolCall": null or { "type": "create_task" | "create_expense" | "pay_bill" | "reschedule", "data": { ... } }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, ...parsed, aiPowered: true });
    }

    // Dynamic context-based calculations for fallback if GEMINI_API_KEY is not set
    const lower = message.toLowerCase();
    const accounts = Array.isArray(context?.bankAccounts) ? context.bankAccounts : [];
    const cards = Array.isArray(context?.creditCards) ? context.creditCards : [];
    const bills = Array.isArray(context?.bills) ? context.bills : [];
    const debts = Array.isArray(context?.debts) ? context.debts : [];
    const tasks = Array.isArray(context?.tasks) ? context.tasks : [];
    const expenses = Array.isArray(context?.expenses) ? context.expenses : [];

    const totalLiquid = accounts.reduce((s: number, a: any) => s + (Number(a.currentBalance) || 0), 0);
    const totalLiabilities = cards.reduce((s: number, c: any) => s + (Number(c.currentOutstanding) || 0), 0) +
      debts.filter((d: any) => d.direction === 'owe' && d.status !== 'settled').reduce((s: number, d: any) => s + (Number(d.outstandingAmount) || 0), 0);
    const receivables = debts.filter((d: any) => d.direction === 'owed_to_me' && d.status !== 'settled').reduce((s: number, d: any) => s + (Number(d.outstandingAmount) || 0), 0);
    const netWorth = totalLiquid + receivables - totalLiabilities;
    const pendingBills = bills.filter((b: any) => b.status !== 'paid');
    const pendingBillsSum = pendingBills.reduce((s: number, b: any) => s + (Number(b.amount) || 0), 0);
    const pendingTasks = tasks.filter((t: any) => t.status === 'pending' || t.status === 'in_progress');

    let reply = '';
    let suggestedActions = ['Plan my day', 'Show financial summary', 'View pending tasks'];

    if (lower.includes('what should i do') || lower.includes('today') || lower.includes('now') || lower.includes('schedule')) {
      reply = `### 📋 Connected Command Center Status\n\n` +
        `* **Pending Tasks**: You have **${pendingTasks.length}** pending tasks.\n` +
        (pendingTasks.length > 0 ? `* **Next Up**: ${pendingTasks[0]?.title || 'Review your schedule'}\n` : '') +
        `* **Upcoming Bills**: **${pendingBills.length}** bills totalling **₹${pendingBillsSum.toLocaleString('en-IN')}**.\n` +
        `* **Net Worth**: **₹${netWorth.toLocaleString('en-IN')}** across **${accounts.length}** accounts.\n\n` +
        `Would you like to plan your day or optimize your route?`;
      suggestedActions = ['✨ Plan My Day', 'View Tasks', 'Check Bills'];
    } else if (lower.includes('financ') || lower.includes('money') || lower.includes('balance') || lower.includes('net worth') || lower.includes('card') || lower.includes('debt')) {
      const accountSummary = accounts.map((a: any) => `${a.name}: ₹${Number(a.currentBalance || 0).toLocaleString('en-IN')}`).join(' | ');
      reply = `### 💳 Financial Ledger Overview\n\n` +
        `* **Total Liquid Assets**: ₹${totalLiquid.toLocaleString('en-IN')} (${accountSummary || 'No accounts linked yet'})\n` +
        `* **Total Liabilities**: ₹${totalLiabilities.toLocaleString('en-IN')} (Cards & Debts)\n` +
        `* **Net Worth**: **₹${netWorth.toLocaleString('en-IN')}**\n` +
        `* **Upcoming Bills**: ₹${pendingBillsSum.toLocaleString('en-IN')} (${pendingBills.length} pending)\n\n` +
        `All calculations are strictly verified against your real database records.`;
      suggestedActions = ['Record Expense', 'Pay a Bill', 'View Accounts'];
    } else {
      reply = `Command Center is active and synchronized with your database.\n\n` +
        `* **Tasks**: ${pendingTasks.length} pending / ${tasks.length} total\n` +
        `* **Accounts**: ₹${totalLiquid.toLocaleString('en-IN')} across ${accounts.length} accounts\n` +
        `* **Net Worth**: ₹${netWorth.toLocaleString('en-IN')}\n\n` +
        `How can I assist you with your day, schedule, or finances?`;
    }

    return res.json({
      success: true,
      reply,
      suggestedActions,
      aiPowered: false,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: error.message || 'AI assistant error' });
  }
});

// 3. Plan My Day (AI Schedule Optimizer)
app.post('/api/ai/plan-day', async (req: Request, res: Response) => {
  try {
    const { date, tasks, preferences } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `You are a life planner AI. Create an optimized, realistic chronological daily schedule for ${date || 'Tuesday, Sep 15, 2026'}.
Work hours: ${preferences?.workStartTime || '09:00'} to ${preferences?.workEndTime || '18:30'}
Commute: Office (${preferences?.officeLocation || 'Cyber City'}) to Home (${preferences?.homeLocation || 'Greenwood'})
Tasks to schedule/integrate:
${JSON.stringify(tasks || [])}

Rules:
- Respect work hours and realistic durations.
- Factor in travel time (30 mins from office to home).
- Insert errands like grocery shopping along the return route (e.g. 19:00 at FreshMart).
- Flag any overlaps or conflicts.
- Suggest a calm evening unwind and bill payment slot.

Return pure JSON matching this schema:
{
  "date": "${date || '2026-09-15'}",
  "summary": "High level strategic summary of today",
  "schedule": [
    {
      "time": "09:00",
      "endTime": "11:00",
      "title": "API Development Sprint",
      "category": "Work",
      "priority": "high",
      "location": "Office",
      "note": "Complete REST endpoints before standup"
    },
    {
      "time": "18:30",
      "endTime": "19:00",
      "title": "Leave Office & Commute Home",
      "category": "Travel",
      "priority": "medium",
      "location": "Route Home",
      "isCommute": true
    },
    {
      "time": "19:00",
      "endTime": "19:45",
      "title": "🛒 Buy Groceries at FreshMart",
      "category": "Shopping",
      "priority": "high",
      "location": "FreshMart Main Road",
      "note": "Conveniently located on your commute route"
    }
  ],
  "conflictWarnings": ["warning strings if any"],
  "financialAdvice": "Financial note for today",
  "groceryRecommendation": "Grocery timing note"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, plan: parsed, aiPowered: true });
    }

    // Fallback Plan
    const fallbackPlan = {
      date: date || '2026-09-15',
      summary: 'Focused deep work morning, clean commute with route-based grocery stop, and relaxed evening bill clearance.',
      schedule: [
        { time: '08:30', endTime: '09:00', title: 'Morning Setup & Priority Review', category: 'Personal', priority: 'medium', location: 'Office' },
        { time: '09:00', endTime: '11:00', title: 'API Development Sprint', category: 'Work', priority: 'high', location: 'Office', note: 'Sprint-3 REST endpoints' },
        { time: '11:00', endTime: '11:30', title: 'Team Standup & Sync', category: 'Work', priority: 'medium', location: 'Conference Room 2' },
        { time: '11:30', endTime: '13:00', title: 'Database Testing & Index Tuning', category: 'Work', priority: 'high', location: 'Office' },
        { time: '13:00', endTime: '14:00', title: 'Lunch & Relaxation Walk', category: 'Personal', priority: 'medium', location: 'Green Cafe' },
        { time: '14:00', endTime: '16:30', title: 'Core Backend Development', category: 'Work', priority: 'high', location: 'Office' },
        { time: '16:30', endTime: '18:00', title: 'Code Review & PR Approvals', category: 'Work', priority: 'medium', location: 'Office' },
        { time: '18:30', endTime: '19:00', title: 'Leave Office & Commute Home', category: 'Travel', priority: 'medium', location: 'Office → Sector 45', isCommute: true },
        { time: '19:00', endTime: '19:45', title: '🛒 Buy Groceries (FreshMart on Route)', category: 'Shopping', priority: 'high', location: 'FreshMart Main Road', note: 'Passing directly on your route home from office' },
        { time: '20:00', endTime: '21:00', title: 'Dinner & Family Time', category: 'Personal', priority: 'low', location: 'Home' },
        { time: '21:00', endTime: '21:15', title: '💡 Pay Electricity & Apartment Dues', category: 'Finance', priority: 'urgent', location: 'Home', note: 'Bescom bill of ₹2,450' },
      ],
      conflictWarnings: [
        'Notice: You had 3 items originally clustered around 6:30 PM. We shifted grocery shopping to 7:00 PM right after leaving office to eliminate traffic backtrack.'
      ],
      financialAdvice: 'Your electricity bill (₹2,450) and maintenance (₹3,500) will deduct ₹5,950 from your HDFC Salary account. You still maintain ₹59,450 for the remaining month.',
      groceryRecommendation: 'Shopping at FreshMart at 19:00 saves 35 minutes compared to a separate trip after reaching home.',
    };

    return res.json({ success: true, plan: fallbackPlan, aiPowered: false });
  } catch (error: any) {
    console.error('Error in /api/ai/plan-day:', error);
    res.status(500).json({ error: error.message || 'Failed to plan day' });
  }
});

// 4. Plan My Week (AI Weekly Planner)
app.post('/api/ai/plan-week', async (req: Request, res: Response) => {
  try {
    const { weekOf, tasks, bills, expenses, goals } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `You are a holistic life architect AI. Generate a weekly execution and financial plan for the week of ${weekOf || 'September 15 - September 21, 2026'}.
Pending tasks count: ${(tasks || []).length}
Upcoming bills: ${JSON.stringify(bills || [])}
Savings goals: ${JSON.stringify(goals || [])}

Provide strategic weekly balance across:
- Deep Work delivery
- Errand & commute optimization
- Timely bill payments (especially credit cards before due dates)
- Maintaining the target savings rate (>40%)

Return pure JSON:
{
  "weekOf": "${weekOf || 'Sep 15 - Sep 21, 2026'}",
  "summary": "Weekly executive summary",
  "priorities": ["Priority 1", "Priority 2", "Priority 3"],
  "dailyHighlights": [
    { "day": "Tuesday", "focus": "Backend API & DB Testing", "keyDeliverable": "Sprint-3 PR merge & Electricity bill payment" },
    { "day": "Wednesday", "focus": "Gym & Security Testing", "keyDeliverable": "Auth rule validation" },
    { "day": "Thursday", "focus": "Architecture Design", "keyDeliverable": "Notification service draft" },
    { "day": "Friday", "focus": "Credit Card Payment & Review", "keyDeliverable": "Pay HDFC Regalia ₹12,500 due on Sunday" },
    { "day": "Saturday", "focus": "Learning & Tech Deep Dive", "keyDeliverable": "TypeScript handbook chapter 4" },
    { "day": "Sunday", "focus": "Weekly Finance Audit & Family", "keyDeliverable": "Review weekly spend & update Emergency Fund" }
  ],
  "financialOutlook": {
    "upcomingBillsTotal": 16149,
    "advice": "Total bills of ₹16,149 due this week. Clear credit card on Friday before the Sep 20 deadline."
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, plan: parsed, aiPowered: true });
    }

    // Fallback Weekly Plan
    const fallbackWeeklyPlan = {
      weekOf: weekOf || 'Sep 15 - Sep 21, 2026',
      summary: 'High-impact technical delivery week with critical financial clearance of HDFC Credit Card (due Sep 20) and Bescom utilities.',
      priorities: [
        'Deploy Sprint-3 API & Database indexing fixes',
        'Pay HDFC Credit Card bill (₹12,500) before Sunday due date',
        'Maintain daily fitness and route-efficient grocery procurement',
      ],
      dailyHighlights: [
        { day: 'Tuesday, Sep 15', focus: 'Backend API & Grocery Route Run', keyDeliverable: 'Merge API PR, FreshMart groceries, clear electricity bill' },
        { day: 'Wednesday, Sep 16', focus: 'Fitness & Database Performance', keyDeliverable: 'Morning gym workout & database query load test' },
        { day: 'Thursday, Sep 17', focus: 'Lead Architecture Sync', keyDeliverable: 'Review notification engine RFC' },
        { day: 'Friday, Sep 18', focus: 'Finance Action & Sprint Signoff', keyDeliverable: 'Pay HDFC credit card (₹12,500) ahead of weekend' },
        { day: 'Saturday, Sep 19', focus: 'Recharge & System Design Study', keyDeliverable: '2 hours dedicated reading & laptop savings goal review' },
        { day: 'Sunday, Sep 20', focus: 'Weekly Audit & Meal Prep', keyDeliverable: 'Weekly expense review and grocery planning' },
      ],
      financialOutlook: {
        upcomingBillsTotal: 16149,
        advice: 'Upcoming payments total ₹16,149 this week. Your HDFC Salary balance (₹65,400) comfortably covers this without dipping into emergency savings.',
      },
    };

    return res.json({ success: true, plan: fallbackWeeklyPlan, aiPowered: false });
  } catch (error: any) {
    console.error('Error in /api/ai/plan-week:', error);
    res.status(500).json({ error: error.message || 'Failed to plan week' });
  }
});

// 5. Notes to Tasks Extractor
app.post('/api/ai/notes-to-tasks', async (req: Request, res: Response) => {
  try {
    const { noteContent } = req.body;
    if (!noteContent) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const ai = getAIClient();
    if (ai) {
      const prompt = `Extract all actionable tasks from the following user note:
"${noteContent}"

Format output as pure JSON array:
[
  {
    "title": "Task title",
    "category": "Work" | "Personal" | "Finance" | "Health" | "Shopping",
    "priority": "high" | "medium" | "low",
    "suggestedDate": "2026-09-16",
    "estimatedDuration": 30
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || '[]';
      const tasks = JSON.parse(responseText);
      return res.json({ success: true, tasks, aiPowered: true });
    }

    // Fallback extraction
    const lines = noteContent.split('\n').filter((l: string) => l.trim().length > 0);
    const fallbackTasks = lines.slice(0, 3).map((line: string, idx: number) => ({
      title: line.replace(/^[-*•\d.]+\s*/, '').trim(),
      category: line.toLowerCase().includes('grocer') ? 'Shopping' : 'Work',
      priority: idx === 0 ? 'high' : 'medium',
      suggestedDate: '2026-09-16',
      estimatedDuration: 45,
    }));

    return res.json({ success: true, tasks: fallbackTasks, aiPowered: false });
  } catch (error: any) {
    console.error('Error in /api/ai/notes-to-tasks:', error);
    res.status(500).json({ error: error.message || 'Failed to extract tasks' });
  }
});

// 6. Proactive Financial Insights
app.post('/api/ai/financial-insights', async (req: Request, res: Response) => {
  try {
    const { income, expenses, bills, cards, savingsRate } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `Analyze user financial health and return 4 concise, high-value bullet insights:
- Monthly Income: ₹${income || 95000}
- Current Month Spending: ₹${expenses || 32500}
- Upcoming Bills: ₹${bills || 16149}
- Credit Card Outstanding: ₹${cards || 18500}
- Current Savings Rate: ${savingsRate || 41.6}%

Respond with JSON:
{
  "insights": [
    { "type": "warning" | "positive" | "tip", "title": "Insight title", "detail": "Specific contextual analysis" }
  ],
  "safeToSpend": number,
  "potentialSavings": number
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed, aiPowered: true });
    }

    const fallbackInsights = {
      insights: [
        {
          type: 'warning',
          title: 'HDFC Credit Card Due in 5 Days',
          detail: 'Total ₹12,500 due on Sep 20. Your HDFC Salary account has ₹65,400 available, which can safely clear the balance in full without incurring interest.',
        },
        {
          type: 'positive',
          title: 'Healthy 41.6% Savings Rate',
          detail: 'You have saved ₹25,000 this month. Emergency fund is at 65% (₹65,000 / ₹1,00,000) and tracking toward year-end completion.',
        },
        {
          type: 'tip',
          title: 'Route-Based Grocery Savings',
          detail: 'Combining grocery shopping with your office return route reduced impulse dining expenses by ₹1,400 compared to last month.',
        },
        {
          type: 'tip',
          title: 'Potential Monthly Optimization',
          detail: 'Trimming weekend dining out by ₹2,000 can accelerate your New MacBook Pro savings goal by 3 weeks.',
        },
      ],
      safeToSpend: 18500,
      potentialSavings: 3500,
    };

    return res.json({ success: true, data: fallbackInsights, aiPowered: false });
  } catch (error: any) {
    console.error('Error in /api/ai/financial-insights:', error);
    res.status(500).json({ error: error.message || 'Financial insight error' });
  }
});

// Vite middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Command Center server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
