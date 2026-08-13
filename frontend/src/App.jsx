import React, { useState, useEffect, useRef } from 'react';
import TitleBar from './components/TitleBar';
import JarvisCompanion from './components/JarvisCompanion';
import Dashboard from './components/Dashboard';
import EventTimeline from './components/EventTimeline';
import BehavioralIndicator from './components/BehavioralIndicator';
import SimulationControls from './components/SimulationControls';
import InterventionPanel from './components/InterventionPanel';
import SettingsPanel from './components/SettingsPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { useVoice } from './hooks/useVoice';
import { useScreenCapture } from './hooks/useScreenCapture';
import { 
  LayoutDashboard, 
  Bot, 
  Activity, 
  Eye, 
  Clock, 
  Settings, 
  Sparkles, 
  Radio, 
  ShieldAlert, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  ArrowUpRight, 
  Camera, 
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import gsap from 'gsap';

function App() {
  const { connected, traderState, jarvisMessages, events, observation, sessionPnl, jarvisThinking, observationStatus, send } = useWebSocket();
  const { speak } = useVoice();
  const { capturing, startCapture, stopCapture } = useScreenCapture();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'jarvis' | 'analytics' | 'vision' | 'timeline'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [intervention, setIntervention] = useState(null);

  // GSAP Refs
  const contentRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);

  // Mouse trail tracker for premium ambient glow spot
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // GSAP Page & Content Reveal Transition
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [activeTab]);

  // GSAP Title Entrance Splitting Animation on load
  useEffect(() => {
    if (activeTab === 'overview' && heroTitleRef.current) {
      gsap.fromTo(heroTitleRef.current,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out', delay: 0.15 }
      );
      if (heroSubRef.current) {
        gsap.fromTo(heroSubRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
        );
      }
    }
  }, [activeTab]);

  // Monitor JARVIS messages for speech and interventions
  useEffect(() => {
    if (jarvisMessages.length > 0) {
      const latestMessage = jarvisMessages[0];
      if (latestMessage.speak) {
        speak(latestMessage.message);
      }
      if (latestMessage.severity === 'critical' && latestMessage.message_type === 'intervention') {
        setIntervention({
          pattern: latestMessage.detected_pattern || 'Critical Risk Detected',
          analysis: latestMessage.message,
          action: 'Review trading rules immediately.'
        });
      }
    }
  }, [jarvisMessages, speak]);

  const handleSimulate = async (type, params) => {
    if (type === 'reset_session') {
      send('reset_session');
      return;
    }
    send(type, params);
  };

  const currentJarvisMessage = jarvisMessages.length > 0 ? jarvisMessages[0].message : 'Standing by for trading session.';
  
  let companionState = 'idle';
  if (!connected) {
    companionState = 'offline';
  } else if (jarvisThinking) {
    companionState = 'thinking';
  } else if (traderState?.state === 'revenge_risk' || traderState?.state === 'tilt') {
    companionState = 'warning';
  }

  const hasData = traderState?.has_data !== false;
  const tradesToday = hasData ? (traderState?.trades_count ?? 0) : '--';
  const riskLevel = hasData ? (traderState?.state === 'tilt' || traderState?.state === 'revenge_risk' ? 'HIGH RISK' : traderState?.state === 'elevated' ? 'MODERATE' : 'OPTIMAL') : '--';
  const consecutiveLosses = hasData ? (traderState?.consecutive_losses ?? 0) : '--';

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="flex flex-col h-screen bg-[#fafafb] text-slate-800 font-sans overflow-hidden relative selection:bg-jarvis-accent selection:text-white"
    >
      {/* Interactive Cursor Spotlight Follow */}
      <div 
        className="absolute w-[600px] h-[600px] bg-[#1e40af]/3 rounded-full blur-[130px] pointer-events-none transition-all duration-300 ease-out z-0"
        style={{
          left: `${mousePos.x - 300}px`,
          top: `${mousePos.y - 300}px`
        }}
      />

      {/* Top Titlebar */}
      <TitleBar />
      
      {/* High-End Awwwards Styled Navigation Header */}
      <header className="h-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl flex items-center justify-between px-10 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-[1.5px] group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Zap size={18} className="text-blue-600 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                TRADE<span className="text-blue-600">SAATHI</span>
              </span>
            </div>
          </div>

          <span className="text-slate-200 text-lg font-thin hidden lg:inline">|</span>

          <div className="hidden lg:flex items-center gap-2.5 bg-slate-100 border border-slate-200/80 px-4 py-1.5 rounded-full text-xs font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>AI ENGINE STATUS // <span className="text-slate-900 font-bold">ACTIVE</span></span>
          </div>
        </div>

        {/* Spacious, Pill-shaped Tab Bar */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
          <NavTab label="Sanctuary" icon={LayoutDashboard} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavTab label="Co-Pilot Studio" icon={Bot} active={activeTab === 'jarvis'} onClick={() => setActiveTab('jarvis')} badge="LIVE" />
          <NavTab label="Behavioral Index" icon={Activity} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavTab label="Vision Telemetry" icon={Eye} active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} />
          <NavTab label="Execution ledger" icon={Clock} active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
        </nav>

        {/* Latency & WS Status Telemetry */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs font-mono text-slate-600">
            <Radio size={14} className={connected ? 'text-emerald-600 animate-pulse' : 'text-rose-500'} />
            <span>{connected ? 'LIVE PAYLOAD' : 'OFFLINE'}</span>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-xl bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-500 hover:text-slate-900 transition-all hover:scale-105 active:scale-95"
            title="System Preferences"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Page Layout Container */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10">
        <div ref={contentRef} className="w-full">
          
          {/* VIEW 1: THE SANCTUARY (Overview landing view) */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto flex flex-col gap-12 pb-16">
              
              {/* Elegant Cinematic Hero Banner */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pt-6 border-b border-slate-200/85 pb-12">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono px-4 py-1.5 rounded-full mb-6">
                    <Sparkles size={14} className="animate-spin-slow text-blue-600" /> SYSTEM STATEMENT // 01
                  </div>
                  <h1 ref={heroTitleRef} className="text-5xl lg:text-7xl font-display font-extrabold tracking-tighter text-slate-950 leading-[1.05] uppercase">
                    Protecting your <br />
                    <span className="font-serif-italic italic font-normal text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 normal-case">
                      cognitive capital.
                    </span>
                  </h1>
                  <p ref={heroSubRef} className="text-slate-600 text-sm md:text-base font-sans mt-4 max-w-xl leading-relaxed">
                    High-speed behavioral analysis, real-time stop-loss protection metrics, and multimodal visual capture engineered for modern institutional traders.
                  </p>
                </div>

                {/* Large CTA Card */}
                <div className="glass-panel p-8 rounded-2xl border border-slate-200 flex flex-col gap-4 min-w-[320px] shadow-sm relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">NET EXPOSURE P&L</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-extrabold text-slate-900">${sessionPnl.toFixed(2)}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${sessionPnl >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {sessionPnl >= 0 ? 'PROFIT' : 'LOSS'}
                    </span>
                  </div>
                  <MagneticButton 
                    onClick={() => setActiveTab('jarvis')}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-500/10"
                  >
                    <span>LAUNCH NEURAL COMPANION</span>
                    <ChevronRight size={14} />
                  </MagneticButton>
                </div>
              </div>

              {/* Spacious KPI Tickers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <OverviewCard 
                  title="Session Realized P&L" 
                  value={`$${sessionPnl.toFixed(2)}`} 
                  tag="NET VALUE"
                  icon={DollarSign}
                  color={sessionPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                />
                <OverviewCard 
                  title="Total Executed Positions" 
                  value={tradesToday} 
                  tag="ORDER INDEX"
                  icon={Activity}
                  color="text-slate-900"
                />
                <OverviewCard 
                  title="Loss Sequence Count" 
                  value={consecutiveLosses} 
                  tag="LIMIT INDEX"
                  icon={TrendingDown}
                  color={consecutiveLosses > 2 ? 'text-amber-600' : 'text-slate-700'}
                />
                <OverviewCard 
                  title="Cognitive Security Level" 
                  value={riskLevel} 
                  tag="HEURISTICS"
                  icon={ShieldAlert}
                  color={riskLevel === 'HIGH RISK' ? 'text-rose-600' : riskLevel === 'MODERATE' ? 'text-amber-600' : 'text-emerald-600'}
                />
              </div>

              {/* Showcase Section: Interactive Feature Highlights with 3D perspective Tilt */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <TiltShowcaseCard 
                  onClick={() => setActiveTab('jarvis')}
                  num="01"
                  category="NEURAL AUDIO CORE"
                  title="JARVIS Speech Center"
                  description="Multimodal conversational voice shield detecting stress and revenge indicators."
                  icon={Bot}
                  colorClass="bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-500/30"
                />
                <TiltShowcaseCard 
                  onClick={() => setActiveTab('analytics')}
                  num="02"
                  category="RISK QUANTIFIERS"
                  title="Cognitive Index Engine"
                  description="Interactive math gauges measuring compliance index, discipline, and stability."
                  icon={Activity}
                  colorClass="bg-purple-50 border-purple-100 text-purple-600 hover:border-purple-500/30"
                />
                <TiltShowcaseCard 
                  onClick={() => setActiveTab('vision')}
                  num="03"
                  category="MULTIMODAL HUD"
                  title="Screen Vision Telemetry"
                  description="Direct visual capture of TradingView charts, extracting position sizes and metrics."
                  icon={Eye}
                  colorClass="bg-emerald-50 border-emerald-100 text-emerald-600 hover:border-emerald-500/30"
                />
              </div>
            </div>
          )}

          {/* VIEW 2: CO-PILOT VOICE STUDIO */}
          {activeTab === 'jarvis' && (
            <div className="max-w-7xl mx-auto h-[calc(100vh-190px)] flex flex-col gap-6 pb-4">
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-4 shrink-0">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                    <Bot className="text-blue-600" size={24} /> Neural Co-Pilot Studio
                  </h2>
                  <p className="text-xs font-mono text-slate-500 mt-1">Multi-modal speech interface evaluating your psychological indicators.</p>
                </div>
                <BehavioralIndicator traderState={traderState} />
              </div>

              <div className="flex-1 glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <JarvisCompanion 
                  state={companionState} 
                  message={currentJarvisMessage}
                  jarvisMessages={jarvisMessages}
                  jarvisThinking={jarvisThinking}
                  onSendMessage={(text) => send('user_message', { text })}
                />
              </div>
            </div>
          )}

          {/* VIEW 3: BEHAVIORAL DIAGNOSTICS */}
          {activeTab === 'analytics' && (
            <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-16">
              <div className="border-b border-slate-200/80 pb-4">
                <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="text-blue-600" size={24} /> Psychological Index & Metrics
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">Algorithmic risk tracking measuring emotional stability, overtrading patterns, and stop loss moves.</p>
              </div>

              <div className="w-full">
                <Dashboard sessionPnl={sessionPnl} traderState={traderState} observation={observation} observationStatus={observationStatus} />
              </div>
            </div>
          )}

          {/* VIEW 4: VISION TERMINAL */}
          {activeTab === 'vision' && (
            <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-16">
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="text-blue-600" size={24} /> Screen Vision Telemetry
                  </h2>
                  <p className="text-xs font-mono text-slate-500 mt-1">multimodal chart recognition, reading instrument symbols, unrealized PnL, and drawdowns.</p>
                </div>

                <MagneticButton 
                  onClick={capturing ? stopCapture : startCapture}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all border shadow-sm ${
                    capturing 
                      ? 'bg-rose-100 border-rose-200 text-rose-700 animate-pulse' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  }`}
                >
                  <Camera size={16} />
                  {capturing ? 'STOP STREAM' : 'ACTIVATE VISION CAPTURE'}
                </MagneticButton>
              </div>

              {/* Capture Viewports */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-slate-200 min-h-[420px] flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="reticle-corner" />
                  {capturing ? (
                    <div className="text-center font-mono space-y-3">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-600 animate-spin mx-auto flex items-center justify-center">
                        <Camera size={24} className="text-blue-600" />
                      </div>
                      <p className="text-sm text-slate-900 font-bold">Observation Stream Active</p>
                      <p className="text-xs text-slate-500">Capturing canvas frames for Gemini Vision parser...</p>
                    </div>
                  ) : (
                    <div className="text-center font-mono space-y-3">
                      <Eye size={48} className="text-slate-400 mx-auto" />
                      <p className="text-sm text-slate-700 font-bold">Screen Capture Standby</p>
                      <p className="text-xs text-slate-500 max-w-sm">Share your TradingView or broker platform tab to parse real-time portfolio metrics.</p>
                    </div>
                  )}
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-4">Parsed Telemetry Matrix</h3>
                  {observation ? (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px] mb-1">PLATFORM</span>
                        <span className="text-slate-900 font-bold text-sm">{observation.platform || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px] mb-1">ACTIVE INSTRUMENT</span>
                        <span className="text-blue-600 font-bold text-sm">{observation.instrument || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px] mb-1">POSITION SIZE</span>
                        <span className="text-slate-900 font-bold text-sm">{observation.position || 'NONE'}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px] mb-1">UNREALIZED PROFIT/LOSS</span>
                        <span className={`font-bold text-sm ${observation.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${observation.unrealized_pnl || 0}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-mono italic">Awaiting vision analysis payload...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: AUDIT TIMELINE LOG */}
          {activeTab === 'timeline' && (
            <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-16">
              <div className="border-b border-slate-200/80 pb-4">
                <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="text-blue-600" size={24} /> Execution Audit Trail
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">Cryptographic behavioral ledger storing emotional events and interventions.</p>
              </div>

              <div className="h-[calc(100vh-230px)]">
                <EventTimeline events={events} />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Floating Simulation Dock */}
      <SimulationControls onSimulate={handleSimulate} />
      
      {/* Popovers */}
      <InterventionPanel intervention={intervention} onDismiss={() => setIntervention(null)} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

// 3D Perspective Tilt Card Component
function TiltShowcaseCard({ onClick, num, category, title, description, icon: Icon, colorClass }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY: x * 15,
      rotateX: -y * 15,
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
      onClick={onClick}
      className={`glass-card p-8 rounded-2xl border border-slate-200/85 flex flex-col justify-between min-h-[300px] cursor-pointer group relative overflow-hidden bg-white transition-all`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="reticle-corner" />
      <div className="flex justify-between items-start" style={{ transform: 'translateZ(15px)' }}>
        <div className={`p-3 rounded-xl border group-hover:scale-110 transition-transform ${colorClass}`}>
          <Icon size={20} />
        </div>
        <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
      </div>
      <div className="mt-6" style={{ transform: 'translateZ(25px)' }}>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">{num} / {category}</span>
        <h4 className="font-heading font-bold text-base text-slate-900 mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// Magnetic Button Wrapper Component using GSAP
function MagneticButton({ children, className, onClick }) {
  const magnetRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!magnetRef.current) return;
    const bounding = magnetRef.current.getBoundingClientRect();
    const x = e.clientX - bounding.left - bounding.width / 2;
    const y = e.clientY - bounding.top - bounding.height / 2;
    gsap.to(magnetRef.current, {
      x: x * 0.4,
      y: y * 0.4,
      duration: 0.35,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!magnetRef.current) return;
    gsap.to(magnetRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1.1, 0.4)'
    });
  };

  return (
    <button
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}

function NavTab({ label, icon: Icon, active, onClick, badge }) {
  const tabRef = useRef(null);

  const handleMouseEnter = () => {
    if (!active && tabRef.current) {
      gsap.to(tabRef.current, { scale: 1.05, y: -1, duration: 0.2 });
    }
  };

  const handleMouseLeave = () => {
    if (!active && tabRef.current) {
      gsap.to(tabRef.current, { scale: 1, y: 0, duration: 0.2 });
    }
  };

  return (
    <button 
      ref={tabRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-xs font-mono transition-all duration-300 flex items-center gap-2.5 relative group ${
        active 
          ? 'bg-blue-600 text-white border border-blue-700 shadow-md font-bold scale-105' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
      }`}
    >
      <Icon size={14} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
      <span>{label}</span>
      {badge && (
        <span className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200 tracking-widest font-mono">
          {badge}
        </span>
      )}
    </button>
  );
}

function OverviewCard({ title, value, tag, icon: Icon, color = 'text-slate-900' }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200 flex flex-col gap-3 relative overflow-hidden group hover:border-blue-500/30 bg-white">
      <div className="reticle-corner" />
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{title}</span>
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          <Icon size={15} className="text-slate-500 group-hover:text-blue-600" />
        </div>
      </div>

      <div className={`text-3xl font-heading font-extrabold ${color} tracking-tight`}>
        {value}
      </div>

      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{tag}</span>
    </div>
  );
}

export default App;
