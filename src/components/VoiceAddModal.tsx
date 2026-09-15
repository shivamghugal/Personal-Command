import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  RefreshCw,
  MapPin,
  Clock
} from 'lucide-react';
import { Task } from '../types';
import { aiService } from '../services/aiService';

interface VoiceAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
}

export const VoiceAddModal: React.FC<VoiceAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTask, setExtractedTask] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setIsProcessing(false);
      setExtractedTask(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Simulate or perform speech capture
  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Sample quick preset prompts for seamless mobile experience
      const samples = [
        'Buy groceries while coming back from office at FreshMart around 6:30 PM',
        'Review architecture proposal with Sarah tomorrow at 10 AM in boardroom',
        'Pay electricity bill 2100 rupees before Friday online',
        'Schedule dentist checkup for Saturday 11 AM high priority',
      ];
      const randomSample = samples[Math.floor(Math.random() * samples.length)];
      setTimeout(() => {
        setTranscript(randomSample);
        setIsListening(false);
      }, 1400);
    }
  };

  const handleProcessVoice = async () => {
    if (!transcript.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const parsed = await aiService.parseTask(transcript.trim());
      setExtractedTask(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmTask = () => {
    if (!extractedTask || !extractedTask.title) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: extractedTask.title,
      description: extractedTask.description,
      category: (extractedTask.category as any) || 'Personal',
      priority: (extractedTask.priority as any) || 'medium',
      status: 'pending',
      dueDate: extractedTask.dueDate || '2026-09-15',
      startTime: extractedTask.startTime,
      dueTime: extractedTask.dueTime,
      location: extractedTask.location,
      context: extractedTask.context,
      locationBased: !!extractedTask.location,
      triggerWhen: extractedTask.triggerWhen || (extractedTask.location ? 'On commute route' : undefined),
      tags: extractedTask.tags || ['voice-added'],
      notes: extractedTask.notes,
      aiGenerated: true,
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Voice Task & Natural Language Input
              </h2>
              <p className="text-xs text-neutral-400">
                Speak or type naturally. AI extracts category, time, location & commute context.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mic Visualizer Button */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            id="btn-toggle-mic-recording"
            onClick={handleToggleListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/20 shadow-lg shadow-rose-600/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {isListening ? <Mic className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
          <span className="text-xs text-neutral-400 font-medium">
            {isListening ? 'Listening to your speech...' : 'Tap mic to speak or use sample below'}
          </span>
        </div>

        {/* Transcript Input / Edit */}
        <div>
          <label className="text-xs font-medium text-neutral-300 block mb-1">
            Speech Transcript / Natural Sentence
          </label>
          <textarea
            rows={2}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g. 'Buy groceries while coming back from office at FreshMart around 6:30 PM'"
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            'Buy groceries while coming back from office',
            'Architecture review with team at 11:30 AM',
            'Pay electricity bill 2100 before Friday',
          ].map((sample, i) => (
            <button
              key={i}
              onClick={() => setTranscript(sample)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap border border-neutral-700/60"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Action button to extract with Gemini */}
        {!extractedTask && (
          <button
            id="btn-ai-extract-task"
            onClick={handleProcessVoice}
            disabled={!transcript.trim() || isProcessing}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Parsing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Parse & Extract Task</span>
              </>
            )}
          </button>
        )}

        {/* Extracted Structured Task Preview */}
        {extractedTask && (
          <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/70 space-y-2 text-xs">
            <span className="font-bold text-emerald-400 block flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Parsed Structured Task:</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-neutral-300">
              <div>
                <span className="text-neutral-500 text-[10px] block">Title:</span>
                <span className="font-semibold text-white">{extractedTask.title}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] block">Category:</span>
                <span>{extractedTask.category}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] block">Time & Due:</span>
                <span>
                  {extractedTask.dueDate} {extractedTask.startTime ? `@ ${extractedTask.startTime}` : ''}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] block">Priority:</span>
                <span className="capitalize">{extractedTask.priority}</span>
              </div>
              {extractedTask.location && (
                <div className="col-span-2">
                  <span className="text-neutral-500 text-[10px] block">Location & Route:</span>
                  <span className="text-indigo-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{extractedTask.location} ({extractedTask.context || 'Commute Route'})</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-700">
              <button
                onClick={() => setExtractedTask(null)}
                className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                Re-edit
              </button>
              <button
                onClick={handleConfirmTask}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Confirm & Add to Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
