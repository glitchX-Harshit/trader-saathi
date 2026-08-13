import React, { useEffect, useState } from 'react';
import { ShieldAlert, X, AlertOctagon } from 'lucide-react';

export default function InterventionPanel({ intervention, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (intervention) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 500);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [intervention, onDismiss]);

  if (!intervention && !visible) return null;

  return (
    <div className={`fixed bottom-20 right-8 w-[420px] z-50 transition-all duration-700 transform ${visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[120%] opacity-0 scale-95'}`}>
      <div className="bg-[#140609]/95 backdrop-blur-2xl border-2 border-red-500/80 rounded-2xl p-6 shadow-neon-danger relative overflow-hidden">
        {/* Ambient Red Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        <button 
          onClick={() => { setVisible(false); setTimeout(onDismiss, 500); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4 text-red-400">
          <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/40 animate-pulse">
            <AlertOctagon size={22} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest block">EMERGENCY INTERVENTION</span>
            <h2 className="font-heading font-bold uppercase tracking-wider text-base text-white text-glow-danger">
              CRITICAL COGNITIVE RISK
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">DETECTED PATTERN</span>
            <div className="text-white font-semibold text-sm bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
              {intervention?.pattern || 'Elevated Emotional Trading Risk'}
            </div>
          </div>
          
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">JARVIS NEURAL EVALUATION</span>
            <div className="text-amber-200/90 italic bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed font-serif">
              "{intervention?.analysis || 'I am observing signs of frustration. Let us step back.'}"
            </div>
          </div>

          <div className="bg-red-500/15 border border-red-500/40 p-3.5 rounded-xl">
            <div className="text-red-400 text-[10px] font-mono uppercase tracking-widest mb-1 font-bold flex items-center gap-1.5">
              <ShieldAlert size={12} /> PROTOCOL DIRECTIVE
            </div>
            <div className="text-white font-medium">{intervention?.action || 'Step away from the trading terminal immediately and review your risk parameters.'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
