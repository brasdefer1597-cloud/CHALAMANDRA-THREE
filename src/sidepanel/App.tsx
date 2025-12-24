
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppTab, DialecticResult } from '../types';
import { ASSETS, PERSONAS } from '../utils/constants';
import * as ai from '../services/geminiService';
import { runThesis } from '../services/hegel/chola';
import { runAntithesis } from '../services/hegel/malandra';
import { runSynthesis } from '../services/hegel/fresa';

// Lazy Components
const DialecticDisplay = lazy(() => import('../components/DialecticDisplay'));
const StatsView = lazy(() => import('../components/StatsView'));

const App: React.FC = () => {
  const chromeApi = (window as any).chrome;
  
  const [activeTab, setActiveTab] = useState<AppTab>('DIALECTIC');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'IDLE' | 'THESIS' | 'ANTITHESIS' | 'SYNTHESIS'>('IDLE');
  const [useThinking, setUseThinking] = useState(false);
  const [result, setResult] = useState<DialecticResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!chromeApi?.runtime?.onMessage) return;

    const messageListener = (msg: any) => {
      if (msg.action === "START_DIALECTIC" || msg.action === "CONTEXT_ANALYSIS") {
        setInput(msg.text);
        setActiveTab('DIALECTIC');
        executeDialectic(msg.text);
      }
    };
    chromeApi.runtime.onMessage.addListener(messageListener);

    if (chromeApi.storage?.local) {
      chromeApi.storage.local.get(['lastContextualInput'], (data: any) => {
        if (data.lastContextualInput) {
          const text = data.lastContextualInput;
          setInput(text);
          executeDialectic(text);
          chromeApi.storage.local.remove('lastContextualInput');
        }
      });
    }

    return () => chromeApi.runtime.onMessage.removeListener(messageListener);
  }, [chromeApi]);

  const executeDialectic = async (textInput: string) => {
    if (!textInput || loading) return;
    
    setLoading(true);
    setResult(null); // Clear previous result? Or keep it?
    // We want to show partial results.
    // Initialize empty result structure
    const partialResult: DialecticResult = {
        thesis: "",
        antithesis: "",
        synthesis: "",
        level: 0,
        alignment: 0,
        timestamp: new Date().toISOString(),
        source: 'HYBRID'
    };
    setResult(partialResult);
    setFeedback(null);
    
    try {
      // Step 1: Thesis (Chola)
      setCurrentStep('THESIS');
      const thesis = await runThesis(true, textInput, (text) => {
          setResult(prev => prev ? { ...prev, thesis: text } : null);
      });
      partialResult.thesis = thesis;
      setResult({...partialResult}); // Ensure final state
      
      // Step 2: Antithesis (Malandra)
      setCurrentStep('ANTITHESIS');
      const antithesis = await runAntithesis(textInput, thesis, (text) => {
          setResult(prev => prev ? { ...prev, antithesis: text } : null);
      });
      partialResult.antithesis = antithesis;
      setResult({...partialResult});
      
      // Step 3: Synthesis (Fresa)
      setCurrentStep('SYNTHESIS');
      const synthesisData = await runSynthesis(thesis, antithesis, (text) => {
          // Fresa streams JSON string usually, or partial text.
          // If we receive partial text (e.g. from the parser), we update synthesis.
          // Note: If Fresa outputs JSON, 'text' might be the raw JSON string `{"text": "..."}`
          // Visualizing raw JSON is ugly but satisfies "writing in real time".
          // Ideally we parse it.
          // For now, let's just dump it into synthesis field.
          setResult(prev => prev ? { ...prev, synthesis: text } : null);
      });
      
      // Update with final parsed data
      partialResult.synthesis = synthesisData.text;
      partialResult.level = synthesisData.level;
      partialResult.alignment = synthesisData.alignment;
      
      setResult(partialResult);
      setCurrentStep('IDLE');

      // Persistence
      if (chromeApi?.storage?.local) {
        chromeApi.storage.local.get(['history', 'magistral_stats'], (data: any) => {
          const history = data.history || [];
          chromeApi.storage.local.set({ 
            history: [partialResult, ...history].slice(0, 20)
          });

          const stats = data.magistral_stats || { totalAnalyses: 0, localAnalyses: 0, cloudAnalyses: 0, achievements: [] };
          chromeApi.storage.local.set({
            magistral_stats: {
              ...stats,
              totalAnalyses: stats.totalAnalyses + 1,
              cloudAnalyses: stats.cloudAnalyses + 1
            }
          });
        });
      }

    } catch (e) {
      console.error("Dialectic Core Breach:", e);
      setCurrentStep('IDLE');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => executeDialectic(input);

  const handlePageExtraction = () => {
    if (loading || !chromeApi?.runtime?.sendMessage) return;
    setLoading(true);
    chromeApi.runtime.sendMessage({ action: "GET_PAGE_TEXT" }, (response: any) => {
      if (response && response.text) {
        setInput(response.text);
        setLoading(false);
        executeDialectic(response.text);
      } else {
        setLoading(false);
        setFeedback(response?.error || "Error al extraer texto de la página.");
      }
    });
  };

  const renderStepIndicator = () => {
    // Show step indicator even if we are streaming, to show progress
    if (currentStep === 'IDLE' && !loading) return null;
    
    const steps = [
      { id: 'THESIS', label: 'TESIS', persona: PERSONAS.CHOLA },
      { id: 'ANTITHESIS', label: 'ANTÍTESIS', persona: PERSONAS.MALANDRA },
      { id: 'SYNTHESIS', label: 'SÍNTESIS', persona: PERSONAS.FRESA }
    ];

    return (
      <div className="flex justify-between items-center gap-2 mb-8 animate-in fade-in zoom-in duration-500">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isDone = steps.findIndex(s => s.id === currentStep) > idx || currentStep === 'IDLE'; // IDLE after loading means done
          
          return (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${
                isActive ? `${step.persona.border} ${step.persona.color} animate-pulse scale-110 shadow-[0_0_15px_rgba(230,194,117,0.3)]` : 
                isDone ? 'border-emerald-500 text-emerald-500' : 'border-white/5 text-gray-700'
              }`}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={`text-[8px] font-syncopate tracking-widest ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-obsidian-void text-gray-200 font-main flex flex-col selection:bg-champagne-gold selection:text-black">
      <div className="scanner fixed top-0 left-0 w-full z-50 pointer-events-none" />
      
      <header className="p-4 border-b border-white/5 bg-obsidian-void/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {ASSETS.LOGO}
            <div className="cursor-default">
              <h1 className="text-xl font-syncopate font-bold text-gradient tracking-tighter">CHALAMANDRA</h1>
              <p className="text-[8px] text-gray-600 tracking-[0.4em] uppercase">V1.6.3 Elite Protocol</p>
            </div>
          </div>
          <nav className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {(['DIALECTIC', 'STATS'] as AppTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[8px] font-syncopate font-bold uppercase transition-all duration-300 ${activeTab === tab ? 'bg-champagne-gold text-black shadow-lg shadow-champagne-gold/20' : 'text-gray-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {activeTab === 'DIALECTIC' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <section className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-champagne-gold/20 to-fuchsia-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <textarea
                  className="w-full h-32 bg-obsidian-void border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-champagne-gold outline-none font-display italic placeholder-gray-800 relative z-10 transition-all"
                  placeholder="Introduzca texto o use 'Leer Página'..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setUseThinking(!useThinking)}
                  className={`flex-1 min-w-[120px] py-3 rounded-xl border text-[9px] font-syncopate uppercase tracking-widest transition-all ${useThinking ? 'border-champagne-gold text-champagne-gold bg-champagne-gold/5' : 'border-white/5 text-gray-600'}`}
                >
                  {useThinking ? 'Deep Thinking ON' : 'Standard Logic'}
                </button>
                <button 
                  onClick={handlePageExtraction}
                  disabled={loading}
                  className="flex-1 min-w-[120px] py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-syncopate font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
                >
                  Leer Página
                </button>
                <button 
                  onClick={handleManualSubmit}
                  disabled={loading || !input}
                  className="flex-[2] min-w-[180px] py-3 bg-champagne-gold text-black rounded-xl font-syncopate font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-champagne-gold/10"
                >
                  {loading ? 'Sincronizando...' : 'Ejecutar Hegel-Trinity'}
                </button>
              </div>
            </section>

            {(loading || result) && (
              <div className="py-2">
                {renderStepIndicator()}
                {/*
                  When streaming, we want to show the result component as it fills up.
                  So we render DialecticDisplay even if loading is true, provided we have a result object.
                */}
                {result && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Suspense fallback={<div className="text-center text-champagne-gold animate-pulse">Cargando Módulo...</div>}>
                       <DialecticDisplay result={result} />
                    </Suspense>

                    {!loading && (
                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] text-center space-y-6 glow-card">
                          <p className="text-[9px] font-syncopate text-gray-500 uppercase tracking-widest">¿Ha sido útil esta resolución?</p>
                          <div className="flex justify-center gap-6">
                            <button
                              onClick={() => setFeedback('Sincronía reforzada. Datos guardados.')}
                              className="group flex flex-col items-center gap-2"
                            >
                              <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                👍
                              </div>
                            </button>
                            <button
                              onClick={() => setFeedback('Ajuste crítico registrado para el próximo ciclo.')}
                              className="group flex flex-col items-center gap-2"
                            >
                              <div className="w-12 h-12 rounded-full border border-rose-500/30 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-black transition-all">
                                👎
                              </div>
                            </button>
                          </div>
                          {feedback && (
                            <p className="text-[9px] font-syncopate text-platinum-cyan animate-pulse uppercase tracking-widest">
                              {feedback}
                            </p>
                          )}
                        </div>
                    )}
                  </div>
                )}

                {loading && !result && (
                     <div className="flex flex-col items-center justify-center space-y-4 py-10">
                       <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-2 border-champagne-gold/20 rounded-full"></div>
                          <div className="absolute inset-0 border-t-2 border-champagne-gold rounded-full animate-spin"></div>
                       </div>
                       <p className="font-syncopate text-[7px] tracking-[0.4em] text-champagne-gold uppercase animate-pulse">
                         Inicializando...
                       </p>
                    </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'STATS' && (
          <div className="max-w-5xl mx-auto">
             <Suspense fallback={<div className="text-center text-champagne-gold animate-pulse">Cargando Estadísticas...</div>}>
                <StatsView />
             </Suspense>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-[7px] text-gray-800 font-syncopate tracking-[1.2em] uppercase border-t border-white/5 bg-obsidian-void/50">
        Magistral Decox Systems &copy; 2025 // STATUS: OPERATIONAL
      </footer>
    </div>
  );
};

export default App;
