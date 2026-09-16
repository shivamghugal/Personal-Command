// Real, persistent Voice Input Service with Continuous Speech Recognition & Media Stream
export type VoiceState = 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'error';

export interface VoiceServiceCallbacks {
  onStateChange: (state: VoiceState) => void;
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onTimerTick: (elapsedSeconds: number) => void;
  onError: (errorMessage: string) => void;
}

class VoiceInputService {
  private recognition: any = null;
  private mediaStream: MediaStream | null = null;
  private state: VoiceState = 'idle';
  private timerInterval: any = null;
  private elapsedSeconds: number = 0;
  private callbacks: VoiceServiceCallbacks | null = null;
  private transcriptBuffer: string = '';
  private isManuallyStopped: boolean = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN'; // Default to Indian English, versatile for INR and global contexts

      rec.onstart = () => {
        this.setState('listening');
        this.startTimer();
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }

        if (final) {
          this.transcriptBuffer += final;
        }

        const currentFull = (this.transcriptBuffer + ' ' + interim).trim();
        if (this.callbacks) {
          this.callbacks.onTranscriptChange(currentFull, false);
        }
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'no-speech') {
          // Keep listening unless manually stopped
          return;
        }
        if (event.error === 'not-allowed') {
          this.setState('error');
          this.callbacks?.onError(
            'Microphone permission was denied. Please allow microphone access in your browser settings.'
          );
          this.cleanup();
          return;
        }
        if (event.error === 'network') {
          this.callbacks?.onError('Network error during speech recognition. You can still type your input.');
        }
      };

      rec.onend = () => {
        // If not manually stopped and we were listening, keep going or finalize
        if (!this.isManuallyStopped && this.state === 'listening') {
          try {
            rec.start();
            return;
          } catch (e) {
            // Can happen if already running
          }
        }
        this.stopTimer();
        if (this.state === 'listening') {
          this.setState('idle');
          if (this.callbacks) {
            this.callbacks.onTranscriptChange(this.transcriptBuffer.trim(), true);
          }
        }
      };

      this.recognition = rec;
    }
  }

  public async start(callbacks: VoiceServiceCallbacks) {
    this.callbacks = callbacks;
    this.transcriptBuffer = '';
    this.isManuallyStopped = false;
    this.elapsedSeconds = 0;
    this.setState('requesting_permission');

    // 1. Request real media permission to ensure permission is prompt & testable on mobile
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      this.setState('error');
      this.callbacks.onError(
        'Could not access microphone. Please ensure microphone permissions are granted for this site.'
      );
      return;
    }

    // 2. Start Speech Recognition
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (err: any) {
        // If already started, ignore or restart
        try {
          this.recognition.stop();
          setTimeout(() => this.recognition.start(), 100);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      // SpeechRecognition API not supported natively in this browser engine
      this.setState('listening');
      this.startTimer();
      this.callbacks.onError(
        'SpeechRecognition API is not supported in this browser. Please type directly or use Chrome/Edge/Safari on mobile.'
      );
    }
  }

  public stop(): string {
    this.isManuallyStopped = true;
    this.stopTimer();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }

    this.cleanupMediaStream();
    this.setState('idle');
    const finalResult = this.transcriptBuffer.trim();
    if (this.callbacks) {
      this.callbacks.onTranscriptChange(finalResult, true);
    }
    return finalResult;
  }

  public cancel() {
    this.isManuallyStopped = true;
    this.stopTimer();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn(e);
      }
    }
    this.cleanupMediaStream();
    this.transcriptBuffer = '';
    this.setState('idle');
    this.callbacks?.onTranscriptChange('', true);
  }

  private startTimer() {
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.callbacks?.onTimerTick(0);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds += 1;
      this.callbacks?.onTimerTick(this.elapsedSeconds);
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private cleanupMediaStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  private cleanup() {
    this.stopTimer();
    this.cleanupMediaStream();
    this.isManuallyStopped = true;
  }

  private setState(state: VoiceState) {
    this.state = state;
    this.callbacks?.onStateChange(state);
  }

  public getState(): VoiceState {
    return this.state;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }
}

export const voiceInputService = new VoiceInputService();
