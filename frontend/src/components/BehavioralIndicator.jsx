import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

export default function BehavioralIndicator({ traderState }) {
  const stateStr = traderState?.state || 'stable';
  const confidence = traderState?.confidence || 1.0;
  const confidencePercent = Math.round(confidence * 100);
  const tradesCount = traderState?.trades_count || 0;
  
  let color = '#00ff88';
  let label = 'STABLE STATE';
  let glow = 'rgba(0, 255, 136, 0.5)';
  let Icon = ShieldCheck;
  
  if (stateStr === 'stable' && confidence === 1.0 && tradesCount === 0) {
    color = '#94a3b8'; label = 'WAITING FOR DATA'; glow = 'transparent'; Icon = Activity;
  } else if (stateStr === 'elevated') {
    color = '#ffd700'; label = 'ELEVATED RISK'; glow = 'rgba(255, 215, 0, 0.5)'; Icon = Zap;
  } else if (stateStr === 'impulsive') {
    color = '#ff6b35'; label = 'IMPULSIVE STATE'; glow = 'rgba(255, 107, 53, 0.5)'; Icon = ShieldAlert;
  } else if (stateStr === 'revenge_risk' || stateStr === 'tilt') {
    color = '#ff3366'; label = 'REVENGE RISK'; glow = 'rgba(255, 51, 102, 0.6)'; Icon = ShieldAlert;
  }

  return (
    <div className="glass-card p-3 px-4 rounded-xl border border-white/10 flex items-center justify-between shadow-glass">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div 
            className={`absolute inset-0 rounded-full border border-dashed ${stateStr !== 'stable' || tradesCount > 0 ? 'animate-spin-slow' : ''}`}
            style={{ borderColor: color, opacity: 0.6 }}
          />
          <Icon size={20} style={{ color, filter: `drop-shadow(0 0 6px ${glow})` }} />
        </div>
        
        <div>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">COGNITIVE STATUS</span>
          <div className="text-sm font-heading font-bold tracking-wide" style={{ color, textShadow: `0 0 10px ${glow}` }}>
            {label}
          </div>
        </div>
      </div>
      
      <div className="text-right border-l border-white/10 pl-4">
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">AI CONFIDENCE</span>
        <div className="text-sm font-mono font-bold text-slate-200">{confidencePercent}%</div>
      </div>
    </div>
  );
}
