
import React, { useState, useEffect, useCallback } from 'react';
import { AnalysisStep, DialecticResult, AnalysisHistoryItem, AppTab } from './types';
import { runDialecticAnalysis } from './services/geminiService';
import { PERSONAS, ASSETS } from './constants';
import DialecticDisplay from './components/DialecticDisplay';
import HistoryPanel from './components/HistoryPanel';
import StatsView from './components/StatsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('ANALYSIS');
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.IDLE);
  const [currentPersona, setCurrentPersona] = useState<string>('');
  const [currentSource, setCurrentSource] = useState<'CLOUD' | 'LOCAL'>('CLOUD');
  const [result, setResult] = useState<DialecticResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handshake de Sistema de Élite
  useEffect(() => {
    const performHandshake = async () => {
      console.log("%c[SYSTEM] CHALAMANDRA OS | Iniciando protocolo de enlace...", "color: #E6C275; font-weight: bold");
      
      // 1. Sincronización de Historial
      const saved = localStorage.getItem('chalamandra_history');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("[SYSTEM] Error de integridad en la bitácora.");
        }
      }

      // 2. Captura de Contexto Externo (Handshake robusto)
      const chromeEnv = (window as any).chrome;
      if (chromeEnv && chromeEnv.storage && chromeEnv.storage.local) {
        chromeEnv.storage.local.get(['contextualInput'], (data: any) => {
          if (data.contextualInput) {
            setInput(data.contextualInput);
            chromeEnv.storage.local.remove('contextualInput');
          }
        });
      }

      // 3. Fase de Calibración
      await new Promise(r => setTimeout(r, 1800));
      setIsInitializing(false);
    };

    performHandshake();
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('chalamandra_history', JSON.stringify(history));
    }
  }, [history, isInitializing]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || step !== AnalysisStep.IDLE || isInitializing) return;

    setError(null);
    setResult(null);
    setStep(AnalysisStep.THESIS);

    try {
      const dialecticResult = await runDialecticAnalysis(input, (p, s) => {
        setCurrentPersona(p as string);
        setCurrentSource(s as 'CLOUD' | 'LOCAL');
      });
      
      setResult(dialecticResult);
      setStep(AnalysisStep.COMPLETED);

      const historyItem: AnalysisHistoryItem = {
        ...dialecticResult,
        id: Date.now().toString(),
        originalPrompt: input
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 10));

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Interrupción crítica en el flujo dialéctico.');
      setStep(AnalysisStep.ERROR);
    }
  };

  const handleSelectFromHistory = useCallback((item: AnalysisHistoryItem) => {
    setInput(item.originalPrompt);
    setResult(item);
    setStep(AnalysisStep.COMPLETED);
    setActiveTab('ANALYSIS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const reset = () => {
    setInput('');
    setResult(null);
    setStep(AnalysisStep.IDLE);
    setCurrentPersona('');
    setError(null);
  };

  const getStepColor = () => {
    switch(currentPersona) {
      case 'CHOLA': return 'text-champagne-gold';
      case 'MALANDRA': return 'text-electric-fuchsia';
      case 'FRESA': return 'text-platinum-cyan';
      default: return 'text-gray-400';
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-obsidian-void flex items-center justify-center p-8 font-syncopate">
        <div className="text-center space-y-8 animate-pulse">
          <div className="flex justify-center">
            {ASSETS.CORE_ROBOT}
          </div>
          <div className="space-y-3">
            <div className="text-[14px] text-champagne-gold tracking-[0.6em] uppercase">
              Kernel_Booting
            </div>
            <div className="text-[10px] text-gray-700 tracking-[0.3em] font-mono">
              MAGISTRAL DECOX SYSTEMS V1.4.0
            </div>
            <div className="w-48 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
               <div className="h-full bg-champagne-gold animate-[scan_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 md:p-12 max-w-full mx-auto selection:bg-champagne-gold selection:text-black animate-in fade-in duration-1000">
      <header className="mb-12 border-b border-white/5 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="hover:rotate-12 transition-transform duration-500">
                {ASSETS.LOGO}
            </div>
            <div>
                <h1 className="text-4xl font-syncopate font-bold text-gradient tracking-tighter uppercase glitch-text">
                Chalamandra
                </h1>
                <div className="text-[9px] font-mono text-gray-700 tracking-[0.4em] uppercase">Hegel-Trinity Engine</div>
            </div>
          </div>
          
          <nav className="flex gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('ANALYSIS')}
              className={`px-8 py-3 rounded-lg text-[11px] font-syncopate font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'ANALYSIS' ? 'bg-champagne-gold text-black shadow-[0_0_15px_rgba(230,194,117,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              Análisis
            </button>
            <button 
              onClick={() => setActiveTab('STATS')}
              className={`px-8 py-3 rounded-lg text-[11px] font-syncopate font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'STATS' ? 'bg-platinum-cyan text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              Bitácora
            </button>
          </nav>
        </div>

        <div className="flex justify-between items-center font-mono text-[10px] text-gray-600 uppercase tracking-widest px-1">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Sync: Gemini_3_Pro
          </span>
          <span className="opacity-50 italic">Protocol: {step === AnalysisStep.IDLE ? 'Standby' : 'Processing_Input'}</span>
        </div>
      </header>

      {activeTab === 'ANALYSIS' ? (
        <section className="space-y-12 max-w-5xl mx-auto">
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="gradient-border-gold transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(230,194,117,0.05)]">
              <div className="gradient-content-dark p-8 md:p-10">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Introduzca idea, dilema o contexto para síntesis hegeliana..."
                  className="w-full bg-transparent border-none focus:ring-0 text-2xl text-gray-100 placeholder-gray-900 min-h-[200px] resize-none font-display italic leading-relaxed"
                  disabled={step !== AnalysisStep.IDLE && step !== AnalysisStep.COMPLETED && step !== AnalysisStep.ERROR}
                />
                <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-white/5">
                  <button
                    type="submit"
                    className="w-full py-5 bg-champagne-gold text-black font-syncopate font-bold text-[12px] uppercase hover:bg-white transition-all transform active:scale-[0.98] disabled:opacity-20 tracking-[0.5em] rounded-sm shadow-2xl"
                    disabled={!input.trim() || (step !== AnalysisStep.IDLE && step !== AnalysisStep.COMPLETED && step !== AnalysisStep.ERROR)}
                  >
                    {step === AnalysisStep.IDLE || step === AnalysisStep.COMPLETED || step === AnalysisStep.ERROR ? 'Ejecutar Motor Dialéctico' : 'Sincronizando Trinidad...'}
                  </button>
                  {(step === AnalysisStep.COMPLETED || step === AnalysisStep.ERROR) && (
                    <button
                      onClick={reset}
                      className="w-full py-4 border border-white/10 text-gray-600 font-syncopate text-[10px] uppercase hover:text-white hover:border-white/30 transition-all tracking-[0.5em] rounded-sm"
                    >
                      Nuevo Protocolo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>

          {step !== AnalysisStep.IDLE && step !== AnalysisStep.COMPLETED && step !== AnalysisStep.ERROR && (
            <div className="py-12 space-y-10 animate-in slide-in-from-top-6 duration-700">
              <div className="scanner w-full rounded-full opacity-50"></div>
              <div className="text-center space-y-4">
                <div className={`text-3xl font-syncopate font-bold tracking-[0.3em] uppercase transition-colors duration-500 ${getStepColor()}`}>
                  {currentPersona || 'Analizando...'}
                </div>
                <div className="text-[11px] text-gray-600 font-mono tracking-[0.4em] uppercase flex items-center justify-center gap-3">
                  <span className="w-8 h-px bg-white/10"></span>
                  Gateway: {currentSource}_GATEWAY_ACTIVE
                  <span className="w-8 h-px bg-white/10"></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-mono leading-relaxed shadow-xl animate-in zoom-in-95">
              <div className="font-bold mb-3 uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                [Error_Critico]
              </div>
              {error}
            </div>
          )}

          {result && step === AnalysisStep.COMPLETED && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <DialecticDisplay result={result} />
            </div>
          )}

          <HistoryPanel 
            history={history} 
            onSelect={handleSelectFromHistory}
            onClear={() => {
              setHistory([]);
              localStorage.removeItem('chalamandra_history');
            }} 
          />
        </section>
      ) : (
        <div className="max-w-5xl mx-auto">
            <StatsView />
        </div>
      )}

      <footer className="mt-32 pt-16 border-t border-white/5 text-center">
        <div className="flex justify-center gap-12 mb-10 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
           <span className="text-[10px] font-syncopate tracking-[0.5em] uppercase">Hegel</span>
           <span className="text-[10px] font-syncopate tracking-[0.5em] uppercase">Decox</span>
           <span className="text-[10px] font-syncopate tracking-[0.5em] uppercase">Trinity</span>
        </div>
        <div className="text-[10px] text-gray-800 font-syncopate tracking-[1.2em] uppercase">
          Magistral Decox Systems &copy; 2025 // Nominal Status
        </div>
      </footer>
    </div>
  );
};

export default App;
