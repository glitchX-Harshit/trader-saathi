import React from 'react';
import { Clock, Info, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, Bot } from 'lucide-react';

export default function EventTimeline({ events }) {
  return (
    <div className="glass-panel h-full rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
      <div className="p-4 px-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-jarvis-accent" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-white/90">Cognitive & Execution Audit Trail</h3>
        </div>
        <span className="text-[10px] bg-jarvis-accent/10 text-jarvis-accent px-3 py-1 rounded-full font-mono border border-jarvis-accent/30 tracking-widest uppercase shadow-[0_0_10px_rgba(0,212,255,0.2)]">
          REALTIME AUDIT LOG
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 custom-scrollbar">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
            <Info size={24} className="mb-2 text-slate-600 animate-pulse" />
            <span>No telemetry events recorded in current trading session.</span>
          </div>
        ) : (
          events.map((event, idx) => <TimelineItem key={idx} event={event} />)
        )}
      </div>
    </div>
  );
}

function TimelineItem({ event }) {
  const time = new Date(event.timestamp || Date.now()).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  let Icon = Info;
  let iconColor = 'text-jarvis-accent';
  let dotColor = 'bg-jarvis-accent shadow-neon-cyan';
  let borderStyle = 'border-white/10';

  if (event.type === 'trade_win' || event.severity === 'success') {
    Icon = CheckCircle2; iconColor = 'text-jarvis-success'; dotColor = 'bg-jarvis-success shadow-neon-success';
  } else if (event.type === 'trade_loss' || event.severity === 'danger') {
    Icon = XCircle; iconColor = 'text-jarvis-danger'; dotColor = 'bg-jarvis-danger shadow-neon-danger';
  } else if (event.severity === 'warning' || event.severity === 'high') {
    Icon = AlertTriangle; iconColor = 'text-jarvis-warning'; dotColor = 'bg-jarvis-warning shadow-neon-warning';
    borderStyle = 'border-jarvis-warning/30 bg-jarvis-warning/5';
  } else if (event.severity === 'critical' || event.type === 'revenge_trading') {
    Icon = ShieldAlert; iconColor = 'text-red-400'; dotColor = 'bg-red-500 shadow-neon-danger animate-pulse';
    borderStyle = 'border-red-500/40 bg-red-950/20';
  }

  return (
    <div className={`glass-card p-4 rounded-xl border ${borderStyle} flex flex-col gap-2 relative transition-all duration-300 hover:border-jarvis-accent/40`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <Icon size={15} className={iconColor} />
          <span className="text-xs font-heading font-semibold text-white tracking-wide">{event.title || event.type}</span>
        </div>
        
        <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
          {time}
        </span>
      </div>
      
      <p className="text-xs text-slate-300 font-sans pl-6 leading-relaxed opacity-90">
        {event.description || JSON.stringify(event.data)}
      </p>
      
      {event.jarvisResponse && (
        <div className="mt-2 ml-6 p-3 rounded-xl bg-jarvis-accent/10 border border-jarvis-accent/25 text-xs text-jarvis-accent font-sans flex gap-2 items-start shadow-glass">
          <Bot size={14} className="shrink-0 mt-0.5 text-jarvis-accent" />
          <span>"{event.jarvisResponse}"</span>
        </div>
      )}
    </div>
  );
}
