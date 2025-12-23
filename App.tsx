
import React, { useState, useRef, useEffect } from 'react';
import { AppTab } from './types';
import { ASSETS } from './constants';
import * as ai from './services/geminiService';

// Componentes
import DialecticDisplay from './components/DialecticDisplay';
import StatsView from './components/StatsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('ANALYSIS');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);

  const handleDeepThink = async () => {
    setLoading(true);
    const text = await ai.runDeepThinking(input);
    setResult({ type: 'TEXT', content: text });
    setLoading(false);
  };

  const handleGenerateMedia = async (mode: 'IMAGE' | 'VIDEO') => {
    setLoading(true);
    try {
      if (mode === 'IMAGE') {
        const url = await ai.generateEliteImage(input);
        setResult({ type: 'IMAGE', url });
      } else {
        const url = await ai.generateEliteVideo(input);
        setResult({ type: 'VIDEO', url });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggleLive = async () => {
    if (isLive) {
      liveSessionRef.current?.close();
      setIsLive(false);
      return;
    }

    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    
    const sessionPromise = ai.connectEliteLive({
      onAudio: async (b64) => {
        const ctx = audioCtxRef.current!;
        const buffer = await ai.decodePcm(b64, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      },
      onTranscription: (text, isUser) => {
        setTranscriptions(prev => [...prev.slice(-5), `${isUser ? 'Tú' : 'IA'}: ${text}`]);
      }
    });

    sessionPromise.then(s => {
      liveSessionRef.current = s;
      setIsLive(true);
    });
  };

  return (
    <div className="min-h-screen bg-obsidian-void text-gray-200 font-main">
      <div className="scanner fixed top-0 left-0 w-full z-50 pointer-events-none" />
      
      <header className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-obsidian-void/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          {ASSETS.LOGO}
          <div>
            <h1 className="text-2xl font-syncopate font-bold text-gradient tracking-tighter glitch-text">CHALAMANDRA</h1>
            <p className="text-[9px] text-gray-600 tracking-[0.5em] uppercase">Protocolo V1.5 Multimodal</p>
          </div>
        </div>
        
        <nav className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {['ANALYSIS', 'VISION', 'AUDIO', 'EXPLORE', 'STATS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as AppTab)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-syncopate font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-champagne-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-8 space-y-12">
        {activeTab === 'ANALYSIS' && (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-champagne-gold/20 to-fuchsia-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <textarea
                className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-xl focus:ring-1 focus:ring-champagne-gold outline-none font-display italic placeholder-gray-700 relative z-10"
                placeholder="Inicie el flujo dialéctico o plantee un dilema complejo..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={handleDeepThink} className="py-4 bg-white/5 border border-white/10 rounded-xl font-syncopate text-xs tracking-[0.3em] uppercase hover:bg-champagne-gold hover:text-black transition-all">
                Deep Thinking Mode
              </button>
              <button className="py-4 bg-champagne-gold text-black rounded-xl font-syncopate font-bold text-xs tracking-[0.3em] uppercase hover:bg-white transition-all shadow-xl shadow-champagne-gold/10">
                Hegel-Trinity Core
              </button>
            </div>
          </div>
        )}

        {activeTab === 'VISION' && (
          <div className="space-y-8 text-center">
            <div className="flex justify-center gap-6">
              <button onClick={() => handleGenerateMedia('IMAGE')} className="p-8 border border-white/10 rounded-3xl hover:border-champagne-gold transition-all group">
                <span className="text-4xl block mb-4 group-hover:scale-125 transition-transform">🖼️</span>
                <span className="text-[10px] font-syncopate uppercase tracking-widest text-gray-500">Elite Image 1K</span>
              </button>
              <button onClick={() => handleGenerateMedia('VIDEO')} className="p-8 border border-white/10 rounded-3xl hover:border-fuchsia-500 transition-all group">
                <span className="text-4xl block mb-4 group-hover:scale-125 transition-transform">🎬</span>
                <span className="text-[10px] font-syncopate uppercase tracking-widest text-gray-500">Veo 3.1 Video</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'AUDIO' && (
          <div className="space-y-8 text-center max-w-xl mx-auto">
            <div className={`w-32 h-32 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-700 ${isLive ? 'border-platinum-cyan animate-pulse shadow-[0_0_30px_rgba(0,229,255,0.3)]' : 'border-white/10'}`}>
              <span className="text-5xl">{isLive ? '🎙️' : '🔇'}</span>
            </div>
            <button onClick={toggleLive} className={`w-full py-6 rounded-2xl font-syncopate font-bold uppercase tracking-[0.5em] transition-all ${isLive ? 'bg-red-500 text-white' : 'bg-platinum-cyan text-black'}`}>
              {isLive ? 'Cerrar Protocolo' : 'Iniciar Native Audio'}
            </button>
            <div className="text-left space-y-2 bg-white/5 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-gray-500 uppercase">
              {transcriptions.map((t, i) => <div key={i}>{t}</div>)}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-16 h-16 border-2 border-champagne-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-syncopate text-[9px] tracking-[0.5em] text-champagne-gold uppercase animate-pulse">Sincronizando con el Núcleo Magistral...</p>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in zoom-in duration-500">
            {result.type === 'IMAGE' && <img src={result.url} className="w-full rounded-3xl border border-white/10 shadow-2xl" />}
            {result.type === 'VIDEO' && <video src={result.url} controls autoPlay className="w-full rounded-3xl border border-white/10 shadow-2xl" />}
            {result.type === 'TEXT' && <div className="p-10 bg-white/5 border border-white/10 rounded-3xl font-main leading-relaxed text-lg whitespace-pre-wrap">{result.content}</div>}
          </div>
        )}

        {activeTab === 'STATS' && <StatsView />}
      </main>

      <footer className="p-12 text-center text-[8px] text-gray-700 font-syncopate tracking-[1em] uppercase border-t border-white/5 mt-24">
        Magistral Decox Systems &copy; 2025 // Nominal Status OK
      </footer>
    </div>
  );
};

export default App;
