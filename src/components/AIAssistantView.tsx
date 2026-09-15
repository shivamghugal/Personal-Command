import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  Mic, 
  Zap, 
  CheckSquare, 
  Wallet, 
  Calendar, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { Task, Bill, BankAccount, Expense, UserPreferences } from '../types';

interface AIAssistantViewProps {
  preferences: UserPreferences;
  tasks: Task[];
  bills: Bill[];
  bankAccounts: BankAccount[];
  expenses: Expense[];
  onApplyPlan?: (tasks: Partial<Task>[]) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: Array<{ label: string; payload: string }>;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  preferences,
  tasks,
  bills,
  bankAccounts,
  expenses,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${preferences.name}! I am your Connected Life Assistant. I have live access to your tasks, work calendar, commute route, bank accounts, and monthly bills.\n\nHow can I help optimize your day or finances right now?`,
      timestamp: '09:00 AM',
      actions: [
        { label: 'Plan My Day', payload: 'Plan my day today with office commute & grocery timing' },
        { label: 'How much can I spend this weekend?', payload: 'How much can I spend this weekend safely?' },
        { label: 'Did I pay my electricity bill?', payload: 'Did I pay my electricity bill?' },
        { label: 'What is my current savings rate?', payload: 'What is my current savings rate?' },
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await aiService.askAssistant(
        textToSend,
        tasks,
        bills,
        bankAccounts,
        expenses,
        preferences
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: `I encountered an issue processing that: ${err.message || 'Unknown error'}. Please try again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Plan my day today',
    'How much can I spend this weekend?',
    'Did I pay my electricity bill?',
    'Remind me to buy milk when I leave office',
    'What is my savings rate?',
    'Organize pending tasks by priority',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Connected Life Assistant
            </h1>
            <p className="text-xs text-neutral-400">
              Autonomous reasoning across your tasks, calendar schedule, travel route, and money
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col h-[640px] overflow-hidden shadow-2xl">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-violet-300" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                    isBot
                      ? 'bg-neutral-800/80 border border-neutral-700/60 text-neutral-200 shadow-xs'
                      : 'bg-indigo-600 text-white shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Optional action suggestion chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-700/50 mt-2">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act.payload)}
                          className="text-xs px-3 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-200 border border-neutral-600 transition-colors"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] text-right font-mono ${
                      isBot ? 'text-neutral-500' : 'text-indigo-200'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-white font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-violet-300 animate-spin" />
              </div>
              <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl px-4 py-3 text-xs text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                <span>Connecting schedule, location, and finances...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap pl-1">
            Try asking:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              id={`quick-ai-prompt-${idx}`}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap border border-neutral-700 transition-all hover:scale-[1.02]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="input-ai-chat"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g., 'Plan my day', 'How much can I spend this weekend?', 'Check my bills')..."
              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-semibold shadow-md transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
