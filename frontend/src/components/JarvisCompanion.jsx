import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, Bot, User, Sparkles, Activity, ShieldAlert, Compass, Flame, HelpCircle, ArrowRight } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import gsap from 'gsap';

export default function JarvisCompanion({ state = 'idle', message = 'Standing by.', jarvisMessages = [], jarvisThinking = false, onSendMessage }) {
  const { speaking, muted, toggleMute, volume, setVolume } = useVoice();
  const [inputText, setInputText] = useState('');
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const displayState = speaking ? 'speaking' : jarvisThinking ? 'thinking' : state;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [jarvisMessages, jarvisThinking]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputText(transcript);
      };
      recognition.onend = () => setListening(false);
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleSend = (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (text.trim() && onSendMessage) {
      onSendMessage(text);
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleListen = () => {
    if (listening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const getThemeColor = () => {
    switch (displayState) {
      case 'warning': return { stroke: '#dc2626', text: 'text-red-600' };
      case 'speaking': return { stroke: '#16a34a', text: 'text-emerald-600' };
      case 'thinking': return { stroke: '#ff4f00', text: 'text-orange-600' };
      default: return { stroke: '#1a1a1a', text: 'text-slate-800' };
    }
  };

  const theme = getThemeColor();

  const promptChips = [
    { label: "Audit Psychology", icon: Compass },
    { label: "Check Revenge Signs", icon: Flame },
    { label: "Review Sizing Risk", icon: ShieldAlert },
    { label: "Mindset Reset Rule", icon: HelpCircle }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-white text-slate-800">
      
      {/* Left Column: Abstract Art Kinetic Circle Canvas */}
      <div className="lg:w-1/2 p-10 flex flex-col justify-between items-center relative overflow-hidden bg-[#faf9f6] border-b lg:border-b-0 lg:border-r border-slate-200">
        
        {/* Top minimal header info */}
        <div className="w-full flex justify-between items-start z-10 font-mono text-[9px] text-slate-500">
          <div>
            <div>CO-PILOT CONTEXT</div>
            <div className="text-slate-400">ACTIVE SESSION</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[9px] font-bold text-slate-800 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#ff4f00]" />
            <span className="uppercase">{displayState}</span>
          </div>
        </div>

        {/* Minimal Kinetic Circle Array */}
        <div className="my-auto flex flex-col items-center justify-center relative w-full">
          
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Single thin elegant outer layout ring */}
            <div 
              className="absolute inset-0 rounded-full border border-[#ff4f00]/15 transition-all duration-1000"
              style={{ borderWidth: '1px' }}
            />

            {/* Organic, morphing plaster orange sculpture blob */}
            <div 
              className="w-28 h-28 bg-[#ff4f00] flex items-center justify-center transition-all duration-700 shadow-sm animate-morph"
              style={{
                transform: displayState === 'speaking' ? 'scale(1.12)' : 'scale(1)'
              }}
            >
              <Sparkles 
                size={22} 
                className={`transition-all duration-500 text-white ${displayState === 'thinking' ? 'animate-spin' : ''}`} 
              />
            </div>
          </div>

          <div className="mt-10 text-center max-w-sm px-4">
            <h3 className="font-heading font-extrabold text-xs text-slate-900 mb-1 uppercase tracking-widest">
              ASSISTANT LOG
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans italic">
              "{message}"
            </p>
          </div>
        </div>

        {/* Audio Slider bar */}
        <div className="w-full flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm z-10">
          <Volume2 size={13} className="text-slate-400" />
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ff4f00]"
          />
          <button 
            onClick={toggleMute}
            className={`p-2 rounded-xl text-xs font-mono transition-all ${muted ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-50 text-slate-600 hover:text-slate-950'}`}
          >
            {muted ? <MicOff size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </div>

      {/* Right Column: Wide, Ultra-Spacious Minimal Message Hub */}
      <div className="lg:w-1/2 p-10 flex flex-col justify-between overflow-hidden bg-white">
        
        {/* Quick prompt shortcut row */}
        <div className="pb-4 border-b border-slate-200 shrink-0 flex flex-col gap-2">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">PROMPTS</span>
          <div className="flex flex-wrap gap-2">
            {promptChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.label)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-sans flex items-center gap-1.5 transition-all shadow-sm active:scale-95 animate-fade-in"
                >
                  <Icon size={11} className="text-[#ff4f00]" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message timeline viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar my-6 flex flex-col gap-5 pr-2">
          {jarvisMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 font-mono text-xs">
              <Activity size={24} className="mb-2 text-slate-300 animate-pulse" />
              <p className="text-slate-700 font-heading font-semibold mb-0.5">Dialogue Stream Active</p>
              <span>Awaiting vocal trigger or command query.</span>
            </div>
          )}

          {[...jarvisMessages].reverse().map((msg, i) => {
            const isUser = msg.type === 'user' || msg.role === 'user';
            return (
              <div 
                key={i} 
                className={`flex flex-col max-w-[80%] ${isUser ? 'self-end' : 'self-start'} animate-fade-in`}
              >
                <div className="flex items-center gap-2 mb-1.5 px-1 text-[9px] font-mono text-slate-400">
                  {isUser ? (
                    <><span>TRADER</span><User size={10} className="text-slate-400" /></>
                  ) : (
                    <><Bot size={10} className="text-[#ff4f00]" /><span className="text-[#ff4f00] font-bold">JARVIS CO-PILOT</span></>
                  )}
                  <span className="text-slate-200">•</span>
                  <span className="text-[9px] text-slate-400">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                  isUser 
                    ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tr-none shadow-sm' 
                    : msg.severity === 'critical'
                      ? 'bg-rose-50 text-rose-950 border border-rose-200 rounded-tl-none font-medium'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })}

          {jarvisThinking && (
            <div className="flex items-center gap-2 self-start bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs text-[#ff4f00] font-mono animate-pulse shadow-sm">
              <Sparkles size={14} className="animate-spin text-[#ff4f00]" />
              <span>Co-pilot is parsing risk telemetry...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text and speech entry toolbar */}
        <div className="mt-auto shrink-0 flex items-center gap-3 pt-4 border-t border-slate-200">
          <button 
            onClick={toggleListen}
            disabled={!recognitionRef.current}
            className={`p-3.5 rounded-xl transition-all duration-300 flex-shrink-0 border ${
              listening 
                ? 'bg-rose-50 text-rose-600 animate-pulse border-rose-300' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm'
            }`}
            title="Speech Recognition"
          >
            <Mic size={16} />
          </button>
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query companion system..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-900 placeholder:text-slate-400 font-sans transition-all shadow-inner"
            />
            <button 
              onClick={() => handleSend()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all animate-fade-in"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
