import { useState, useEffect, useCallback } from 'react';
import { voiceService } from '../services/voice';

export function useVoice() {
  const [speaking, setSpeaking] = useState(voiceService.isSpeaking);
  const [muted, setMuted] = useState(voiceService.muted);
  const [volume, setVolumeState] = useState(voiceService.volume);

  useEffect(() => {
    const handleStateChange = (isSpeaking) => {
      setSpeaking(isSpeaking);
    };

    voiceService.onStateChange(handleStateChange);
    return () => voiceService.offStateChange(handleStateChange);
  }, []);

  const speak = useCallback((text) => {
    voiceService.speak(text);
  }, []);

  const stop = useCallback(() => {
    voiceService.stop();
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !muted;
    voiceService.setMuted(newMuted);
    setMuted(newMuted);
  }, [muted]);

  const setVolume = useCallback((vol) => {
    voiceService.setVolume(vol);
    setVolumeState(vol);
  }, []);

  return { speaking, muted, volume, speak, stop, toggleMute, setVolume };
}
