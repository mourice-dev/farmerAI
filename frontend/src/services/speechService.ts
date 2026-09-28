// Web Speech API for voice interactions in AgriMind Rwanda
import { Language } from '../types';

export class VoiceAssistantService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public static speak(text: string, lang: Language = 'rw'): void {
    if (!this.synth) return;
    
    // Stop any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Slightly measured pace for agricultural clarity
    utterance.pitch = 1.0;

    // Pick appropriate voice
    const voices = this.synth.getVoices();
    if (lang === 'fr') {
      utterance.lang = 'fr-FR';
      const frVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frVoice) utterance.voice = frVoice;
    } else if (lang === 'rw') {
      // If native Kinyarwanda (rw) is available or Swahili (sw) fallback, else English with phonetic pacing
      const swVoice = voices.find(v => v.lang.startsWith('sw') || v.lang.startsWith('rw'));
      if (swVoice) {
        utterance.voice = swVoice;
        utterance.lang = swVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    this.synth.speak(utterance);
  }

  public static stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): { stop: () => void } | null {
    if (typeof window === 'undefined') return null;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      if (onError) onError('Speech Recognition is not supported on this browser.');
      return null;
    }

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US'; // Or rw-RW if supported

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        if (onEnd) onEnd();
      };

      this.recognition.start();

      return {
        stop: () => {
          if (this.recognition) {
            this.recognition.stop();
          }
        }
      };
    } catch (err: any) {
      if (onError) onError(err.message || 'Microphone initiation failed.');
      return null;
    }
  }
}
