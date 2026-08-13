import React from 'react';
import { Minus, Square, X, Cpu, ShieldCheck, Zap } from 'lucide-react';

export default function TitleBar() {
  const isElectron = window.electronAPI?.isElectron;

  const handleMinimize = () => {
    // Logic for electron minimize
  };

  const handleMaximize = () => {
    // Logic for electron maximize
  };

  const handleClose = () => {
    if (isElectron) window.close();
  };

  return (
    <div 
      className="h-10 bg-[#06060a]/90 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-4 select-none z-50 text-xs font-mono"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-jarvis-accent shadow-[0_0_8px_#00d4ff] animate-pulse" />
          <span className="font-heading font-bold tracking-widest text-white text-sm bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-jarvis-accent">
            TRADE<span className="text-jarvis-accent">SAATHI</span>
          </span>
        </div>
        <span className="text-[10px] text-white/30 border-l border-white/10 pl-3 uppercase tracking-widest font-mono hidden sm:inline-block">
          v2.4 Pro Quantum Edition
        </span>
      </div>

      {/* Telemetry Center Pills */}
      <div className="hidden md:flex items-center gap-4 text-[10px] text-jarvis-text-dim uppercase tracking-wider">
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2.5 py-0.5 rounded-full">
          <Cpu size={12} className="text-jarvis-accent" />
          <span>CORE // <span className="text-white">GEMINI 2.0</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2.5 py-0.5 rounded-full">
          <ShieldCheck size={12} className="text-jarvis-success" />
          <span>RISK ENGINE // <span className="text-jarvis-success">ACTIVE</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2.5 py-0.5 rounded-full">
          <Zap size={12} className="text-jarvis-gold" />
          <span>PING // <span className="text-white">12ms</span></span>
        </div>
      </div>

      <div className="flex items-center">
        {isElectron && (
          <div className="flex items-center h-full" style={{ WebkitAppRegion: 'no-drag' }}>
            <button onClick={handleMinimize} className="h-full px-3 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <Minus size={14} />
            </button>
            <button onClick={handleMaximize} className="h-full px-3 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <Square size={12} />
            </button>
            <button onClick={handleClose} className="h-full px-3 hover:bg-jarvis-danger text-white/50 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
