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

  // Refs for Three.js Canvas container and mouse move coordinates
  const threeContainerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Real-time turbulence base frequency states for chromatic liquid wave physics
  const [baseFreq, setBaseFreq] = useState('0.015 0.015');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [jarvisMessages, jarvisThinking]);

  // Load Three.js dynamically from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => initWebGL();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [displayState]);

  // Chromatic Liquid ripple wave simulation engine
  useEffect(() => {
    let animFrame;
    let count = 0;
    
    const animate = () => {
      count += displayState === 'speaking' ? 0.14 : displayState === 'thinking' ? 0.09 : 0.038;
      const freqX = 0.012 + Math.sin(count * 0.7) * 0.003;
      const freqY = 0.015 + Math.cos(count * 0.5) * 0.004;
      setBaseFreq(`${freqX} ${freqY}`);
      animFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animFrame);
  }, [displayState]);

  // Initialize Three.js Refractive Swirling glass shader with Polar helical vortex dynamics
  const initWebGL = () => {
    if (!threeContainerRef.current || !window.THREE) return;

    // Clear any previous canvas elements
    threeContainerRef.current.innerHTML = '';

    const THREE = window.THREE;
    const width = 240;
    const height = 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeContainerRef.current.appendChild(renderer.domElement);

    // Custom Vertex Shader - Organically morphs the 3D geometry based on time and speech
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vModelPosition;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_speaking;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;

        // Dynamic vertex displacement to morph the geometry like physical morphing liquid
        float wave = sin(position.x * 2.5 + u_time * 1.5) * cos(position.y * 2.5 + u_time * 1.2);
        float displacement = wave * (0.07 + u_speaking * 0.07);
        vec3 newPosition = position + normal * displacement;

        vModelPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
        vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Custom Fragment Shader generating spectral dispersion, chromatic aberration, and specular highlights
    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vModelPosition;
      varying vec2 vUv;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_speaking;

      // Helical spiral noise mapping for organic glass ridges
      float getSwirlNoise(vec3 dir, float timeOffset) {
        float angle = atan(dir.y, dir.x);
        float r = length(dir.xy);
        
        // Spiral angle rotation formula mimicking glass swirling grooves
        float spiral = angle + r * 6.5 - timeOffset * 0.35;
        
        // Remap to Cartesian coordinates with spiral offset
        vec2 swirlUv = vec2(cos(spiral), sin(spiral)) * r;
        
        // Multi-frequency sine ripples to map deep glass cuts
        return sin(swirlUv.x * 12.0) * cos(swirlUv.y * 12.0 + sin(swirlUv.x * 5.5));
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Custom mouse tilt offsets
        vec3 dir = normalize(vModelPosition) + vec3(u_mouse * 0.1, 0.0);

        // 3D Refraction vectors for RGB channels to simulate true glass spectral dispersion
        vec3 refractR = refract(-viewDir, normal, 0.81);
        vec3 refractG = refract(-viewDir, normal, 0.84);
        vec3 refractB = refract(-viewDir, normal, 0.87);

        // Sample organic swirly texture along refracted rays
        float rNoise = getSwirlNoise(refractR + dir, u_time + 0.05);
        float gNoise = getSwirlNoise(refractG + dir, u_time);
        float bNoise = getSwirlNoise(refractB + dir, u_time - 0.05);

        // Spectral color dispersion base (plaster white base + refractive RGB split)
        vec3 colorR = vec3(0.97, 0.96, 0.94) + rNoise * vec3(0.06, -0.06, -0.06);
        vec3 colorG = vec3(0.97, 0.96, 0.94) + gNoise * vec3(-0.03, 0.04, -0.03);
        vec3 colorB = vec3(0.97, 0.96, 0.94) + bNoise * vec3(-0.06, -0.06, 0.08);

        vec3 finalColor = vec3(colorR.r, colorG.g, colorB.b);

        // Mix in safety orange inside the spiral channels (Hermes luxury brand feel)
        float orangeMask = smoothstep(0.1, 0.65, abs(gNoise));
        finalColor = mix(finalColor, vec3(1.0, 0.31, 0.0) * 0.9, orangeMask * 0.32);

        // Fresnel highlighting for clear refractive glass rim
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
        finalColor += vec3(1.0) * fresnel * 0.45;

        // Specular lens glare highlight
        vec3 lightDir1 = normalize(vec3(2.0, 3.0, 2.0));
        vec3 halfDir1 = normalize(lightDir1 + viewDir);
        float spec1 = pow(max(dot(normal, halfDir1), 0.0), 128.0);
        
        vec3 lightDir2 = normalize(vec3(-2.0, 2.0, -1.0));
        vec3 halfDir2 = normalize(lightDir2 + viewDir);
        float spec2 = pow(max(dot(normal, halfDir2), 0.0), 64.0);

        finalColor += vec3(1.0) * spec1 * 0.75;
        finalColor += vec3(1.0) * spec2 * 0.25;

        // Soft bottom shadows for physical shape anchoring
        float shadow = smoothstep(0.2, 1.0, dot(normal, vec3(0.0, -1.0, 0.0)));
        finalColor -= vec3(0.08) * shadow;

        gl_FragColor = vec4(finalColor, 0.96);
      }
    `;

    // Awwwards Geodesic Crystalline Torus Knot Glass Ribbon Geometry
    const geometry = new THREE.TorusKnotGeometry(0.85, 0.3, 120, 16);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_speaking: { value: 0 }
      },
      transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Dynamic lights
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    let animationFrameId;
    let time = 0;

    const animateScene = () => {
      time += displayState === 'speaking' ? 0.12 : displayState === 'thinking' ? 0.07 : 0.028;
      
      // Update uniforms
      material.uniforms.u_time.value = time;
      material.uniforms.u_speaking.value = displayState === 'speaking' ? 1.0 : 0.0;

      // Mouse coordinate easing/interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      material.uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);

      // Rotate geometry
      mesh.rotation.y = time * 0.22;
      mesh.rotation.x = time * 0.14;
      mesh.rotation.z = time * 0.07;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animateScene);
    };

    animateScene();

    // Clean up animation on destruction
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  };

  // Track mouse coordinates on visualizer panel to feed into WebGL shader
  const handleMouseMove = (e) => {
    if (!leftPanelRef.current) return;
    const rect = leftPanelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = -y; // Invert Y coordinate for WebGL viewport alignment
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

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

  const promptChips = [
    { label: "Audit Psychology", icon: Compass },
    { label: "Check Revenge Signs", icon: Flame },
    { label: "Review Sizing Risk", icon: ShieldAlert },
    { label: "Mindset Reset Rule", icon: HelpCircle }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-white text-slate-800 font-sans">
      
      {/* Left Column: WebGL Interactive Swirling Glass Canvas */}
      <div 
        ref={leftPanelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="lg:w-1/2 p-10 flex flex-col justify-between items-center relative overflow-hidden bg-[#faf9f6] border-b lg:border-b-0 lg:border-r border-slate-200"
      >
        
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

        {/* 3D Three.js Swirling Glass Crystal Orb */}
        <div className="my-auto flex flex-col items-center justify-center relative w-full">
          
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Cardinal Micro-Plus Crosshair Focus Targets */}
            <div className="absolute inset-1 pointer-events-none z-0">
              {/* Top Focus */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[#ff4f00] font-mono text-xs select-none font-black animate-pulse">+</div>
              {/* Bottom Focus */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[#ff4f00] font-mono text-xs select-none font-black animate-pulse">+</div>
              {/* Left Focus */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-800 font-mono text-xs select-none font-black">+</div>
              {/* Right Focus */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-800 font-mono text-xs select-none font-black">+</div>
            </div>

            {/* ThreeJS WebGL Canvas Container */}
            <div 
              ref={threeContainerRef}
              className="w-[240px] h-[240px] relative flex items-center justify-center drop-shadow-[0_25px_40px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform duration-700 ease-out z-10"
            />

          </div>

          {/* Upgraded, highly visible and structured Dialogue Log Panel */}
          <div className="mt-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.01)] text-left max-w-sm w-full z-10">
            <span className="font-mono text-[9px] text-[#ff4f00] font-bold block mb-1 uppercase tracking-widest">
              CO-PILOT LOGFEED
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
              {message}
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
        
        {/* Quick prompts numbered list index */}
        <div className="pb-6 border-b border-slate-200 shrink-0 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-mono uppercase tracking-widest text-[#ff4f00] font-bold">
              CO-PILOT SHORTCUTS
            </span>
            <span className="text-[8px] font-mono text-slate-400">
              SELECT PATTERN
            </span>
          </div>
          
          <div className="flex flex-col">
            {promptChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.label)}
                  className="group w-full flex items-center justify-between py-3 border-b border-slate-100 hover:border-[#ff4f00] transition-colors duration-300 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-heading font-bold text-slate-700 group-hover:text-slate-950 transition-colors uppercase tracking-wide">
                      {chip.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[8px] text-slate-400 group-hover:text-[#ff4f00] group-hover:border-[#ff4f00]/30 transition-all bg-[#faf9f6] border border-slate-200 px-2 py-0.5 rounded font-bold uppercase">
                      {chip.label.split(' ').slice(-1)[0]}
                    </span>
                    <Icon size={12} className="text-slate-300 group-hover:text-[#ff4f00] group-hover:translate-x-0.5 transition-all" />
                  </div>
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
                    ? 'bg-slate-100 text-slate-800 border border-[#e8e6e1] rounded-tr-none shadow-sm' 
                    : msg.severity === 'critical'
                      ? 'bg-rose-50 text-rose-950 border border-rose-200 rounded-tl-none font-medium'
                      : 'bg-white text-slate-700 border border-[#e8e6e1] rounded-tl-none shadow-sm'
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

        {/* Bottom Input Console */}
        <div className="mt-auto shrink-0 flex items-center gap-3 pt-6 border-t border-slate-200">
          <button 
            onClick={toggleListen}
            disabled={!recognitionRef.current}
            className={`p-3.5 rounded-xl transition-all duration-300 border flex-shrink-0 flex items-center justify-center ${
              listening 
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
                : 'bg-[#faf9f6] border-slate-200 text-slate-500 hover:text-[#ff4f00] hover:border-[#ff4f00]/30 shadow-sm'
            }`}
            title="Speech Recognition"
          >
            <Mic size={15} />
          </button>
          
          <div className="flex-1 flex items-center gap-2 bg-[#faf9f6] border border-slate-200 focus-within:border-[#ff4f00] rounded-xl px-4 py-2.5 transition-all shadow-inner">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type query to co-pilot..."
              className="flex-1 bg-transparent py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans"
            />
            <button 
              onClick={() => handleSend()}
              className="px-4 py-2 text-slate-800 hover:text-[#ff4f00] transition-colors font-mono text-[10px] font-extrabold uppercase tracking-widest relative group flex-shrink-0"
              title="Submit message"
            >
              <span>SEND</span>
              <div className="absolute bottom-1 left-4 right-4 h-[1.5px] bg-[#ff4f00] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
