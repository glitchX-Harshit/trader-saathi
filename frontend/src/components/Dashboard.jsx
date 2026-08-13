import React, { useRef } from 'react';
import { DollarSign, Activity, AlertTriangle, Crosshair, TrendingUp, TrendingDown, Camera, Eye, Zap, ShieldAlert, Sparkles, AlertOctagon, CheckCircle2, RefreshCw } from 'lucide-react';
import { useScreenCapture } from '../hooks/useScreenCapture';
import gsap from 'gsap';

export default function Dashboard({ sessionPnl, traderState, observation, observationStatus }) {
  const { capturing, startCapture, stopCapture } = useScreenCapture();
  const hasData = traderState?.has_data !== false;
  
  const tradesToday = hasData ? (traderState?.trades_count ?? 0) : '--';
  const riskLevel = hasData ? (traderState?.state === 'tilt' || traderState?.state === 'revenge_risk' ? 'CRITICAL REVENGE THREAT' : traderState?.state === 'elevated' ? 'MODERATE RISK' : 'OPTIMAL DISCIPLINE') : '--';
  const consecutiveLosses = hasData ? (traderState?.consecutive_losses ?? 0) : '--';
  const isDemo = observationStatus === 'simulated' || observation?.platform === 'simulation';

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* Top Section: Expansive 3 Score Gauges with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DiagnosticScoreCard 
          title="Discipline Quotient"
          score={hasData ? (traderState?.discipline_score ?? 100) : 100}
          color="#10b981"
          icon={Activity}
          description="Monitors entry rule obedience and trade limits."
          status={hasData && traderState?.discipline_score < 70 ? 'DEGRADED' : 'EXCELLENT'}
        />

        <DiagnosticScoreCard 
          title="Emotional Stability"
          score={hasData ? (traderState?.emotional_stability_score ?? 100) : 100}
          color="#2563eb"
          icon={Zap}
          description="Detects loss seq agitation and impulsivity limits."
          status={hasData && traderState?.emotional_stability_score < 70 ? 'IMPAIRED' : 'STABLE'}
        />

        <DiagnosticScoreCard 
          title="Risk Compliance Index"
          score={hasData ? (traderState?.risk_control_score ?? 100) : 100}
          color="#d97706"
          icon={ShieldAlert}
          description="Evaluates position size logic and stop boundaries."
          status={hasData && traderState?.risk_control_score < 70 ? 'VIOLATED' : 'COMPLIANT'}
        />
      </div>

      {/* Deep Behavioral Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Tilt & Revenge Sentinel with 3D Tilt */}
        <TiltPanel className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col justify-between relative overflow-hidden group bg-white shadow-sm">
          <div className="reticle-corner" />
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertOctagon size={16} />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">Revenge Sentinel</span>
              </div>
              <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${
                traderState?.state === 'revenge_risk' 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-bold' 
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {traderState?.state === 'revenge_risk' ? 'THREAT ACTIVE' : 'NORMAL'}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              Monitors risk-scaling triggers and loss reaction velocity.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs">
                <span className="text-[9px] text-slate-400 uppercase block mb-1">Loss Sequence</span>
                <span className="text-base font-bold text-slate-900">{consecutiveLosses} <span className="text-[10px] font-normal text-slate-400">Trades</span></span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs">
                <span className="text-[9px] text-slate-400 uppercase block mb-1">Risk Multiplier</span>
                <span className="text-base font-bold text-blue-600">{hasData ? '1.0x - 1.8x' : '1.0x'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>JARVIS Protection: <span className="text-slate-800 font-semibold">ONLINE</span></span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
        </TiltPanel>

        {/* Card 2: Tactical Screen Observation Telemetry with 3D Tilt */}
        <TiltPanel className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col justify-between relative overflow-hidden group bg-white shadow-sm">
          <div className="reticle-corner" />
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Eye size={16} />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">Observation Telemetry</span>
              </div>
              {isDemo && (
                <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-widest font-bold">
                  DEMO STATE
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed mb-4">
              OCR capture parsing chart indicators, symbol tags, and exposure sizes.
            </p>

            {observation ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 font-mono text-[10px]">
                <div>
                  <span className="text-slate-400 block uppercase">App</span>
                  <span className="text-slate-900 font-semibold">{observation.platform || 'System'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Symbol</span>
                  <span className="text-blue-600 font-bold">{observation.instrument || 'NIFTY'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Pos</span>
                  <span className="text-slate-900 font-semibold">{observation.position || 'LONG'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">P&L</span>
                  <span className={`font-bold ${observation.unrealized_pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${(observation.unrealized_pnl || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center font-mono text-xs text-slate-400">
                Awaiting active capture feed input...
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-500">Multimodal Parser: <span className="text-blue-600 font-semibold">Active</span></span>
            <button 
              onClick={capturing ? stopCapture : startCapture}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                capturing ? 'bg-rose-50 text-rose-600 border-rose-200 font-bold' : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              {capturing ? 'Stop Capture' : 'Start Capture'}
            </button>
          </div>
        </TiltPanel>

      </div>

    </div>
  );
}

function DiagnosticScoreCard({ title, score, color, icon: Icon, description, status }) {
  const cardRef = useRef(null);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const displayScore = typeof score === 'number' ? Math.round(score) : 100;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY: x * 12,
      rotateX: -y * 12,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-slate-300 bg-white transition-all shadow-sm"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="reticle-corner" />
      
      <div className="flex justify-between items-start" style={{ transform: 'translateZ(15px)' }}>
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">METRIC COGNITION</span>
          <h4 className="font-heading font-bold text-sm text-slate-900">{title}</h4>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
          <Icon size={15} style={{ color }} />
        </div>
      </div>

      <div className="flex items-center justify-between py-2" style={{ transform: 'translateZ(25px)' }}>
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="transform -rotate-90 w-20 h-20">
            <circle cx="40" cy="40" r="32" stroke="rgba(0,0,0,0.03)" strokeWidth="6" fill="none" />
            <circle 
              cx="40" cy="40" r="32" 
              stroke={color} strokeWidth="6" fill="none"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 - (displayScore / 100) * (2 * Math.PI * 32)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-lg font-bold tracking-tight" style={{ color }}>
              {displayScore}
            </span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">STATUS</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border mt-1" style={{ color, borderColor: `${color}30`, backgroundColor: `${color}08` }}>
            {status}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 font-sans leading-relaxed border-t border-slate-100 pt-3" style={{ transform: 'translateZ(10px)' }}>
        {description}
      </p>
    </div>
  );
}

function TiltPanel({ children, className }) {
  const panelRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(panelRef.current, {
      rotateY: x * 10,
      rotateX: -y * 10,
      transformPerspective: 800,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!panelRef.current) return;
    gsap.to(panelRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}
