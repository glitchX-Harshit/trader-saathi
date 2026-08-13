import React, { useState, useEffect } from 'react';
import { Settings, X, Sliders, Volume2, Cpu } from 'lucide-react';
import { voiceService } from '../services/voice';

export default function SettingsPanel({ isOpen, onClose }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  useEffect(() => {
    if (isOpen) {
      const availableVoices = voiceService.getVoices();
      setVoices(availableVoices);
      if (voiceService.voice) {
        setSelectedVoice(voiceService.voice.name);
      }
    }
  }, [isOpen]);

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
    voiceService.setVoice(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-[#0b0b14]/95 border border-white/10 rounded-2xl w-[420px] shadow-2xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2 font-heading text-white font-bold uppercase tracking-wider text-sm">
            <Sliders size={16} className="text-jarvis-accent" /> System Preferences
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Volume2 size={13} className="text-jarvis-accent" /> Synthetic Speech Voice Model
            </label>
            <select 
              value={selectedVoice} 
              onChange={handleVoiceChange}
              className="w-full bg-[#12121f] border border-white/10 rounded-xl p-3 text-slate-100 font-sans text-xs focus:outline-none focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent"
            >
              {voices.map((v, i) => (
                <option key={i} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu size={13} className="text-jarvis-accent" /> Neural Core Engine
            </label>
            <select disabled className="w-full bg-[#12121f]/50 border border-white/5 rounded-xl p-3 text-slate-400 font-sans text-xs cursor-not-allowed">
              <option>Gemini 2.0 Flash (Default Engine)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">High throughput low-latency multimodal reasoning active.</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-jarvis-accent/20 border border-jarvis-accent/40 text-jarvis-accent hover:bg-jarvis-accent hover:text-black font-mono text-xs rounded-xl font-semibold transition-all duration-300 shadow-neon-cyan"
          >
            SAVE PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
}
