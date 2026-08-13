class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.volume = 1;
    this.muted = false;
    this.isSpeaking = false;
    this.listeners = new Set();

    if (this.synth) {
      this.synth.onvoiceschanged = () => this.initVoice();
      this.initVoice();
    }
  }

  initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Try to find a good male English voice, like Google UK English Male or similar
    this.voice = voices.find(v => v.name.includes('Google UK English Male')) || 
                 voices.find(v => v.lang === 'en-GB' || v.lang === 'en-US') || 
                 voices[0];
  }

  getVoices() {
    return this.synth ? this.synth.getVoices() : [];
  }

  setVoice(voiceName) {
    const voices = this.getVoices();
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      this.voice = voice;
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) this.stop();
  }

  speak(text) {
    if (!this.synth || this.muted || !text) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = 1.0;
    utterance.pitch = 0.9; // Slightly lower pitch for a calmer voice

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyListeners();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notifyListeners();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.notifyListeners();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.notifyListeners();
    }
  }

  onStateChange(callback) {
    this.listeners.add(callback);
  }

  offStateChange(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.isSpeaking));
  }
}

export const voiceService = new VoiceService();
