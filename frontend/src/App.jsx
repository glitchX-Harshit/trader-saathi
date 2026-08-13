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

  // Preloader state
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // GSAP Refs
  const contentRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const cursorDotRef = useRef(null);
  const spotlightRef = useRef(null);
  const preloaderRef = useRef(null);

  // Custom Cursor state tracking
  const [isHoveredInteractive, setIsHoveredInteractive] = useState(false);

  useEffect(() => {
    // 1. Cinematic Preloader Counter Logic
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        
        // Slide preloader up and reveal main interface
        gsap.to(preloaderRef.current, {
          yPercent: -100,
          duration: 1.1,
          ease: 'power4.inOut',
          onComplete: () => {
            setIsLoaded(true);
            // Trigger entrance animations
            gsap.fromTo(contentRef.current,
              { opacity: 0, scale: 0.98, y: 30 },
              { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power4.out' }
            );
          }
        });
      }
      setLoadingPercent(current);
    }, 70);

    // 2. High-Performance Instant Cursor & Cinematic Spotlight Follower (GPU Accelerated)
    const moveCursor = (e) => {
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
      }
    };

    window.addEventListener('mousemove', moveCursor);

    // Listen for hover on interactive elements to scale cursor ring
    const handleMouseOver = (e) => {
      const target = e.target.closest('button, a, input, [role="button"], .glass-card');
      setIsHoveredInteractive(!!target);
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // GSAP Tab change view transition
  useEffect(() => {
    if (isLoaded && contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [activeTab, isLoaded]);

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
    <div className="flex flex-col h-screen bg-[#faf9f6] text-slate-800 font-sans overflow-hidden relative select-none">
      
      {/* High-performance GPU Spotlight follow background */}
      <div 
        ref={spotlightRef}
        className="fixed w-[600px] h-[600px] bg-[#ff4f00]/3 rounded-full blur-[130px] pointer-events-none z-0 left-0 top-0 will-change-transform hidden md:block"
        style={{ transform: 'translate3d(-300px, -300px, 0)' }}
      />

      {/* 1. Preloader Overlay */}
      <div 
        ref={preloaderRef}
        className="absolute inset-0 bg-[#faf9f6] z-50 flex flex-col justify-between p-12 text-[#1a1a1a]"
      >
        <div className="flex justify-between items-center font-mono text-xs text-slate-400">
          <span>SYSTEM LOADING</span>
          <span>© 2026 COGNITIVE SAFETY</span>
        </div>
        
        <div className="my-auto flex flex-col items-start gap-4">
          <span className="text-[12vw] font-display font-black leading-none tracking-tighter text-[#ff4f00] flex items-baseline">
            {loadingPercent}<span className="text-xl font-mono text-slate-400 ml-4">%</span>
          </span>
          <div className="w-48 h-[1px] bg-slate-200 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-[#ff4f00] transition-all duration-300"
              style={{ width: `${loadingPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-end font-mono text-xs text-slate-400">
          <span>COGNITIVE PROTECTOR INDEX</span>
          <span>SECURE CORE ACCESS</span>
        </div>
      </div>

      {/* 2. Custom Awwwards Minimalist Dot Pointer */}
      <div 
        ref={cursorDotRef}
        className="fixed left-0 top-0 w-1.5 h-1.5 bg-[#ff4f00] rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 will-change-transform hidden md:block"
      />

      {/* Top Titlebar */}
      <TitleBar />
      
      {/* High-End Awwwards Styled Navigation Header */}
      {/* Top Header - High-End Awwwards Editorial Style */}
      <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-12 z-30 shrink-0 select-none">
        
        {/* Brand identity logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
          <div className="w-8 h-8 rounded-lg bg-[#ff4f00] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-display font-black text-lg tracking-tighter text-slate-900 uppercase">
            TRADE<span className="text-[#ff4f00]">SAATHI</span>
          </span>
        </div>

        {/* Clean, typographic line-separated Tab Bar */}
        <nav className="flex items-center h-full border-x border-slate-200">
          <NavTab label="Sanctuary" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavTab label="Studio" active={activeTab === 'jarvis'} onClick={() => setActiveTab('jarvis')} />
          <NavTab label="Diagnostics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavTab label="Vision HUD" active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} />
          <NavTab label="Ledger" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
        </nav>

        {/* Connection status and settings */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#ff4f00] animate-pulse' : 'bg-rose-500'}`} />
            <span className="tracking-widest uppercase">{connected ? 'NODE // ACTIVE' : 'NODE // STANDBY'}</span>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-lg border border-slate-200 hover:border-[#ff4f00] text-slate-500 hover:text-slate-900 transition-colors"
            title="Preferences"
          >
            <Settings size={15} />
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
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pt-6 border-b border-slate-200 pb-12">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-[#ff4f00] text-xs font-mono px-4 py-1.5 rounded-full mb-6">
                    <Sparkles size={14} className="animate-spin-slow text-[#ff4f00]" /> SYSTEM STATUS
                  </div>
                  <h1 ref={heroTitleRef} className="text-5xl lg:text-7xl font-display font-extrabold tracking-tighter text-slate-950 leading-[1.05] uppercase">
                    Protecting your <br />
                    <span className="font-serif-italic italic font-normal text-[#ff4f00] normal-case">
                      cognitive capital.
                    </span>
                  </h1>
                  <p ref={heroSubRef} className="text-slate-600 text-sm md:text-base font-sans mt-4 max-w-xl leading-relaxed">
                    High-speed behavioral analysis, real-time stop-loss protection metrics, and multimodal visual capture engineered for modern institutional traders.
                  </p>
                </div>

                {/* Large CTA Card */}
                <div className="glass-panel p-8 rounded-2xl border border-slate-200 flex flex-col gap-4 min-w-[320px] shadow-sm relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">NET EXPOSURE P&L</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-extrabold text-slate-900">${sessionPnl.toFixed(2)}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${sessionPnl >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {sessionPnl >= 0 ? 'PROFIT' : 'LOSS'}
                    </span>
                  </div>
                  <MagneticButton 
                    onClick={() => setActiveTab('jarvis')}
                    className="w-full py-3.5 bg-[#ff4f00] hover:bg-[#cc3f00] text-white font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-orange-500/10"
                  >
                    <span>LAUNCH CO-PILOT TERMINAL</span>
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
                  color={sessionPnl >= 0 ? 'text-[#ff4f00]' : 'text-rose-600'}
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
                  color={consecutiveLosses > 2 ? 'text-[#ff4f00]' : 'text-slate-700'}
                />
                <OverviewCard 
                  title="Cognitive Security Level" 
                  value={riskLevel} 
                  tag="HEURISTICS"
                  icon={ShieldAlert}
                  color={riskLevel === 'HIGH RISK' ? 'text-rose-600' : riskLevel === 'MODERATE' ? 'text-amber-600' : 'text-emerald-600'}
                />
              </div>

              {/* Dynamic scrolling text ticker (marquee) */}
              <div className="w-full overflow-hidden border-y border-slate-200 py-3.5 bg-white whitespace-nowrap select-none font-semibold">
                <div className="animate-marquee inline-block font-mono text-[9px] text-[#1a1a1a] tracking-[0.2em] uppercase">
                  <span>COGNITIVE SECURITY SECURED // BEHAVIOR ENGINE STEADY // EXPOSURE LIMIT SECURE // CO-PILOT ONLINE // REVENGE THREAT RESOLVED // CONTEXT DECAY STABLE //&nbsp;&nbsp;</span>
                  <span>COGNITIVE SECURITY SECURED // BEHAVIOR ENGINE STEADY // EXPOSURE LIMIT SECURE // CO-PILOT ONLINE // REVENGE THREAT RESOLVED // CONTEXT DECAY STABLE //&nbsp;&nbsp;</span>
                </div>
              </div>

              {/* Showcase Section: Interactive Feature Highlights with 3D perspective Tilt */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <TiltShowcaseCard 
                  onClick={() => setActiveTab('jarvis')}
                  num="01"
                  category="CO-PILOT VOICE CORE"
                  title="JARVIS Speech Center"
                  description="Multimodal conversational voice shield detecting stress and revenge indicators."
                  icon={Bot}
                  colorClass="bg-orange-50 border-orange-100 text-[#ff4f00] hover:border-orange-500/30"
                />
                <TiltShowcaseCard 
                  onClick={() => setActiveTab('analytics')}
                  num="02"
                  category="RISK INDEX GAUGE"
                  title="Cognitive Index Engine"
                  description="Interactive math gauges measuring compliance index, discipline, and stability."
                  icon={Activity}
                  colorClass="bg-orange-50 border-orange-100 text-[#ff4f00] hover:border-orange-500/30"
                />
                <TiltShowcaseCard 
                  onClick={() => setActiveTab('vision')}
                  num="03"
                  category="PORTFOLIO HUD"
                  title="Screen Vision Telemetry"
                  description="Direct visual capture of TradingView charts, extracting position sizes and metrics."
                  icon={Eye}
                  colorClass="bg-orange-50 border-orange-100 text-[#ff4f00] hover:border-orange-500/30"
                />
              </div>
            </div>
          )}

          {/* VIEW 2: CO-PILOT VOICE STUDIO */}
          {activeTab === 'jarvis' && (
            <div className="max-w-7xl mx-auto h-[calc(100vh-190px)] flex flex-col gap-6 pb-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 shrink-0">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                    <Bot className="text-[#ff4f00]" size={24} /> Neural Co-Pilot Studio
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
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="text-[#ff4f00]" size={24} /> Psychological Index & Metrics
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
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="text-[#ff4f00]" size={24} /> Screen Vision Telemetry
                  </h2>
                  <p className="text-xs font-mono text-slate-500 mt-1">multimodal chart recognition, reading instrument symbols, unrealized PnL, and drawdowns.</p>
                </div>

                <MagneticButton 
                  onClick={capturing ? stopCapture : startCapture}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all border shadow-sm ${
                    capturing 
                      ? 'bg-rose-100 border-rose-200 text-rose-700 animate-pulse' 
                      : 'bg-[#ff4f00] hover:bg-[#cc3f00] text-white active:scale-95'
                  }`}
                >
                  <Camera size={16} />
                  {capturing ? 'STOP STREAM' : 'ACTIVATE VISION CAPTURE'}
                </MagneticButton>
              </div>

              {/* Capture Viewports */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-slate-200 min-h-[420px] flex flex-col justify-center items-center relative overflow-hidden">
                  {capturing ? (
                    <div className="text-center font-mono space-y-3">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#ff4f00] animate-spin mx-auto flex items-center justify-center">
                        <Camera size={24} className="text-[#ff4f00]" />
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
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px] mb-1">PLATFORM</span>
                        <span className="text-slate-900 font-bold text-sm">{observation.platform || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px] mb-1">ACTIVE INSTRUMENT</span>
                        <span className="text-[#ff4f00] font-bold text-sm">{observation.instrument || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px] mb-1">POSITION SIZE</span>
                        <span className="text-slate-900 font-bold text-sm">{observation.position || 'NONE'}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px] mb-1">UNREALIZED PROFIT/LOSS</span>
                        <span className={`font-bold text-sm ${observation.unrealized_pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="text-[#ff4f00]" size={24} /> Execution Audit Trail
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
      className={`glass-card p-8 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[300px] cursor-pointer group relative overflow-hidden bg-white transition-all`}
      style={{ transformStyle: 'preserve-3d' }}
    >
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

// Magnetic Button Wrapper Component (Disabled magnetic offset for Awwwards layout)
function MagneticButton({ children, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}

function NavTab({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 h-full text-xs font-mono transition-all duration-300 flex items-center gap-3 border-r border-slate-200 relative overflow-hidden group ${
        active 
          ? 'text-[#ff4f00] font-bold bg-[#faf9f6]' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-[#faf9f6]/30'
      }`}
    >
      {/* Typographic Text Roll Flip Animation */}
      <span className="relative overflow-hidden block h-4">
        <span className="block transition-transform duration-300 group-hover:-translate-y-full">
          {label}
        </span>
        <span className="block absolute top-0 left-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-[#ff4f00]">
          {label}
        </span>
      </span>
      
      {/* Bottom sliding orange active line indicator */}
      <div 
        className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-[#ff4f00] transition-transform duration-300 ${
          active ? 'translate-y-0' : 'translate-y-[3px]'
        }`}
      />
    </button>
  );
}

function OverviewCard({ title, value, tag, icon: Icon, color = 'text-slate-900' }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200 flex flex-col gap-3 relative overflow-hidden group hover:border-[#ff4f00]/30 bg-white">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{title}</span>
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-orange-50 group-hover:text-[#ff4f00] transition-colors">
          <Icon size={15} className="text-slate-500 group-hover:text-[#ff4f00]" />
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
