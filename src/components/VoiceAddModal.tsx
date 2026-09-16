import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Sparkles, 
  X, 
  Check, 
  RefreshCw,
  MapPin,
  Clock,
  AlertCircle,
  ArrowRight,
  Receipt,
  Wallet,
  Calendar,
  Layers,
  ArrowLeftRight
} from 'lucide-react';
import { 
  Task, 
  Expense, 
  Bill, 
  Debt, 
  BankAccount, 
  UserPreferences,
  ExtractedTaskData 
} from '../types';
import { voiceInputService, VoiceState } from '../services/voiceService';
import { parseNaturalLanguageTask } from '../services/aiService';

interface VoiceAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  onAddExpense?: (expense: Expense, sourceAccountId?: string) => void;
  onAddBill?: (bill: Bill) => void;
  onAddDebt?: (debt: Debt) => void;
  onTransferFunds?: (fromAccountId: string, toAccountId: string, amount: number) => void;
  preferences: UserPreferences;
  bankAccounts?: BankAccount[];
}

export const VoiceAddModal: React.FC<VoiceAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onAddExpense,
  onAddBill,
  onAddDebt,
  onTransferFunds,
  preferences,
  bankAccounts = [],
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTaskData | null>(null);
  const [selectedSourceAccount, setSelectedSourceAccount] = useState(bankAccounts[0]?.id || '');
  const [selectedDestinationAccount, setSelectedDestinationAccount] = useState(bankAccounts[1]?.id || '');

  useEffect(() => {
    if (!isOpen) {
      voiceInputService.cancel();
      setVoiceState('idle');
      setElapsedSeconds(0);
      setTranscript('');
      setErrorMessage(null);
      setIsProcessing(false);
      setExtractedData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setExtractedData(null);
    await voiceInputService.start({
      onStateChange: (state) => setVoiceState(state),
      onTranscriptChange: (text) => setTranscript(text),
      onTimerTick: (sec) => setElapsedSeconds(sec),
      onError: (err) => setErrorMessage(err),
    });
  };

  const handleStopRecording = () => {
    const finalTranscript = voiceInputService.stop();
    if (finalTranscript) {
      setTranscript(finalTranscript);
      // Auto-trigger parsing if transcript is present
      handleProcessPrompt(finalTranscript);
    }
  };

  const handleCancelRecording = () => {
    voiceInputService.cancel();
    setVoiceState('idle');
    setElapsedSeconds(0);
  };

  const handleProcessPrompt = async (textToParse?: string) => {
    const query = (textToParse || transcript).trim();
    if (!query || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const data = await parseNaturalLanguageTask(query, preferences);
      setExtractedData(data);
    } catch (err: any) {
      console.warn('AI Parsing error:', err);
      setErrorMessage('Could not analyze prompt via AI. Please check your network or edit manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!extractedData) return;
    const type = extractedData.type || 'task';

    if (type === 'expense' && onAddExpense) {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        title: extractedData.title || transcript.slice(0, 40),
        amount: extractedData.amount || 0,
        category: (extractedData.category as any) || 'Food',
        date: extractedData.dueDate || new Date().toISOString().split('T')[0],
        time: extractedData.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: extractedData.sourceAccount || 'UPI / Salary Account',
        isEssential: !!extractedData.isEssential,
      };
      onAddExpense(newExp, selectedSourceAccount);
    } else if (type === 'bill' && onAddBill) {
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        name: extractedData.title || 'Upcoming Bill',
        category: extractedData.category || 'Utilities',
        amount: extractedData.amount || 0,
        dueDate: extractedData.dueDate || new Date().toISOString().split('T')[0],
        frequency: (extractedData.frequency as any) || 'monthly',
        status: 'upcoming',
        autoPay: false,
        reminderDaysBefore: 3,
      };
      onAddBill(newBill);
    } else if (type === 'debt' && onAddDebt) {
      const newDebt: Debt = {
        id: `debt-${Date.now()}`,
        personOrEntity: extractedData.person || 'Counterparty',
        direction: (extractedData.debtDirection as any) || 'owe',
        category: (extractedData.category as any) || 'Borrowed Money',
        totalAmount: extractedData.amount || 0,
        outstandingAmount: extractedData.amount || 0,
        dueDate: extractedData.dueDate || new Date().toISOString().split('T')[0],
        status: 'active',
        notes: extractedData.notes || `Added via voice: "${transcript}"`,
        createdAt: new Date().toISOString(),
      };
      onAddDebt(newDebt);
    } else if (type === 'transfer' && onTransferFunds && selectedSourceAccount && selectedDestinationAccount) {
      onTransferFunds(selectedSourceAccount, selectedDestinationAccount, extractedData.amount || 0);
    } else {
      // Default to Task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: extractedData.title || transcript.slice(0, 50),
        description: extractedData.notes || transcript,
        category: (extractedData.category as any) || 'Personal',
        priority: extractedData.priority || 'medium',
        status: 'pending',
        dueDate: extractedData.dueDate || new Date().toISOString().split('T')[0],
        startTime: extractedData.startTime,
        dueTime: extractedData.dueTime,
        location: extractedData.location,
        context: extractedData.context,
        locationBased: !!extractedData.location,
        tags: ['voice-input'],
        aiGenerated: true,
        createdAt: new Date().toISOString(),
      };
      onAddTask(newTask);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] border border-white/[0.1] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh] relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-indigo-500/10 blur-2xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              voiceState === 'listening' ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Executive Voice Command</h2>
              <p className="text-xs text-neutral-400">Continuous speech recognition for tasks, expenses, bills & debts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4 bg-[#111624] rounded-3xl border border-white/[0.06] p-5 relative overflow-hidden shadow-inner">
          {voiceState === 'listening' ? (
            <div className="flex flex-col items-center space-y-4 relative z-10">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold animate-pulse px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                <span>Recording... {formatTimer(elapsedSeconds)}</span>
              </div>

              {/* Soundwave animation */}
              <div className="flex items-center gap-1.5 h-10 px-4 py-1 bg-black/40 rounded-full border border-white/[0.05]">
                {[40, 75, 100, 60, 90, 45, 80, 50, 70, 95, 60, 85].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-rose-600 to-rose-400 rounded-full transition-all duration-150 animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 65}ms` }}
                  ></div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  id="btn-stop-voice-recording"
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop & Extract</span>
                </button>
                <button
                  onClick={handleCancelRecording}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold border border-white/[0.06] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3.5 relative z-10">
              <button
                id="btn-start-voice-recording"
                onClick={handleStartRecording}
                className="w-18 h-18 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-all relative group"
              >
                <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping opacity-75"></div>
                <Mic className="w-8 h-8 relative z-10" />
              </button>
              <div className="text-center">
                <span className="text-xs font-bold text-white block tracking-tight">Tap to Activate Voice</span>
                <span className="text-[11px] text-neutral-400 mt-0.5 block">Microphone listens continuously until you press stop</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Transcript Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 block">
            Transcript / Natural Command
          </label>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g. 'I borrowed 20000 rupees from Rahul due next month' or 'Buy groceries on my way home from office at FreshMart' or 'Paid 450 for lunch'"
            className="w-full px-4 py-3 bg-[#111624] border border-white/[0.08] focus:border-indigo-500/60 rounded-2xl text-xs sm:text-sm text-white focus:outline-hidden transition-all placeholder:text-neutral-500 shadow-inner"
          />
        </div>

        {/* Sample Voice Prompts */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 block font-medium">Quick Examples:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {[
              'I borrowed 20000 from Rahul',
              'Spent 450 on groceries from ATM cash',
              'Electricity bill of 2400 due on 25th',
              'Call bank tomorrow at 10 AM',
              'Transferred 5000 to ATM Cash',
            ].map((sample, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(sample);
                  handleProcessPrompt(sample);
                }}
                className="text-[11px] px-3 py-1.5 rounded-full bg-[#111624] hover:bg-[#181f33] text-neutral-300 whitespace-nowrap border border-white/[0.07] hover:border-white/[0.15] shrink-0 transition-all shadow-xs"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Process Button */}
        {!extractedData && (
          <button
            id="btn-process-natural-language"
            onClick={() => handleProcessPrompt()}
            disabled={!transcript.trim() || isProcessing}
            className="w-full py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-40 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Structured Record...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Parse Structured Data</span>
              </>
            )}
          </button>
        )}

        {/* Extracted Data Confirmation Box */}
        {extractedData && (
          <div className="p-4 rounded-xl bg-neutral-800/90 border border-neutral-700 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-700/80 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Detected Entity: {extractedData.type?.toUpperCase() || 'TASK'}</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">
                {extractedData.category || 'General'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-neutral-300">
              <div className="col-span-2">
                <span className="text-neutral-500 text-[10px] block">Title / Description:</span>
                <input
                  type="text"
                  value={extractedData.title || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-medium text-xs mt-0.5"
                />
              </div>

              {extractedData.amount !== undefined && (
                <div>
                  <span className="text-neutral-500 text-[10px] block">Amount ({preferences.currencySymbol}):</span>
                  <input
                    type="number"
                    value={extractedData.amount || 0}
                    onChange={(e) => setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono font-bold text-xs mt-0.5"
                  />
                </div>
              )}

              {extractedData.dueDate && (
                <div>
                  <span className="text-neutral-500 text-[10px] block">Date:</span>
                  <input
                    type="date"
                    value={extractedData.dueDate}
                    onChange={(e) => setExtractedData({ ...extractedData, dueDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-xs mt-0.5"
                  />
                </div>
              )}

              {extractedData.person && (
                <div className="col-span-2">
                  <span className="text-neutral-500 text-[10px] block">Counterparty / Person:</span>
                  <input
                    type="text"
                    value={extractedData.person}
                    onChange={(e) => setExtractedData({ ...extractedData, person: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs mt-0.5"
                  />
                </div>
              )}

              {extractedData.location && (
                <div className="col-span-2">
                  <span className="text-neutral-500 text-[10px] block">Location / Route:</span>
                  <span className="text-indigo-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{extractedData.location}</span>
                  </span>
                </div>
              )}

              {/* Source Account Selection for Expenses or Transfers */}
              {(extractedData.type === 'expense' || extractedData.type === 'transfer') && bankAccounts.length > 0 && (
                <div className="col-span-2">
                  <span className="text-neutral-500 text-[10px] block">Deduct From Account:</span>
                  <select
                    value={selectedSourceAccount}
                    onChange={(e) => setSelectedSourceAccount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs mt-0.5"
                  >
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Balance: {preferences.currencySymbol}{acc.currentBalance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {extractedData.type === 'transfer' && bankAccounts.length > 1 && (
                <div className="col-span-2">
                  <span className="text-neutral-500 text-[10px] block">Transfer To Account:</span>
                  <select
                    value={selectedDestinationAccount}
                    onChange={(e) => setSelectedDestinationAccount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs mt-0.5"
                  >
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Balance: {preferences.currencySymbol}{acc.currentBalance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-700/80">
              <button
                onClick={() => setExtractedData(null)}
                className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
              >
                Re-parse
              </button>
              <button
                id="btn-confirm-save-voice-record"
                onClick={handleConfirmSave}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Database</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
