import React from 'react';
import { Play, TrendingUp, TrendingDown, Zap, AlertTriangle, Crosshair, RefreshCw, Sliders } from 'lucide-react';

export default function SimulationControls({ onSimulate }) {
  return (
    <div className="bg-white/85 backdrop-blur-2xl border-t border-slate-200/80 p-3.5 px-8 flex gap-3 overflow-x-auto custom-scrollbar items-center z-30 justify-between shadow-lg">
      <div className="text-slate-500 text-xs font-mono shrink-0 flex items-center gap-2 pr-4 border-r border-slate-200/80">
        <Sliders size={14} className="text-blue-600" />
        <span className="font-heading font-semibold text-slate-800 uppercase tracking-wider">SIMULATION DOCK</span>
        <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
          DEMO ACTIVE
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <ControlButton 
          label="Open Trade" icon={Crosshair} color="hover:border-blue-600/30 hover:text-blue-600 hover:bg-blue-50/50" badge="[T]"
          onClick={() => onSimulate('simulate_trade', { instrument: 'NIFTY50', direction: 'LONG' })} 
        />
        <ControlButton 
          label="Simulate Profit" icon={TrendingUp} color="hover:border-emerald-600/30 hover:text-emerald-600 hover:bg-emerald-50/50" badge="[P]"
          onClick={() => onSimulate('simulate_profit', { amount: 1500 })} 
        />
        <ControlButton 
          label="Simulate Loss" icon={TrendingDown} color="hover:border-rose-600/30 hover:text-rose-600 hover:bg-rose-50/50" badge="[L]"
          onClick={() => onSimulate('simulate_loss', { amount: -1200 })} 
        />
        
        <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />
        
        <ControlButton 
          label="Revenge Trade" icon={Zap} color="hover:border-purple-600/30 hover:text-purple-600 hover:bg-purple-50/50 text-purple-700 font-bold bg-purple-50 border-purple-200" badge="[R]"
          onClick={() => onSimulate('simulate_revenge_trade', { note: 'Rapid reentry after loss' })} 
        />
        <ControlButton 
          label="Increase Position" icon={AlertTriangle} color="hover:border-amber-600/30 hover:text-amber-600 hover:bg-amber-50/50" badge="[S]"
          onClick={() => onSimulate('simulate_position_change', { currentSize: 100, newSize: 250 })} 
        />
        <ControlButton 
          label="Move Stop Loss" icon={AlertTriangle} color="hover:border-amber-600/30 hover:text-amber-600 hover:bg-amber-50/50" badge="[M]"
          onClick={() => onSimulate('simulate_stop_loss_moved', { direction: 'wider' })} 
        />

        <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />
        
        <ControlButton 
          label="Reset Session" icon={RefreshCw} color="hover:border-slate-300 text-slate-500 hover:text-slate-900" badge="[ESC]"
          onClick={() => onSimulate('reset_session', {})} 
        />
      </div>
    </div>
  );
}

function ControlButton({ label, icon: Icon, color, onClick, badge }) {
  return (
    <button 
      onClick={onClick}
      className={`glass-card flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all duration-300 group shrink-0 active:scale-95 border border-slate-200/80 bg-white ${color}`}
    >
      <Icon size={14} className="group-hover:scale-115 transition-transform" />
      <span>{label}</span>
      {badge && <span className="text-[9px] text-slate-400 group-hover:text-slate-600 font-mono ml-0.5">{badge}</span>}
    </button>
  );
}
