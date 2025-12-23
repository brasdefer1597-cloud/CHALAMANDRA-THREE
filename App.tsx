import React, { useState, useEffect } from 'react';
import { AppTab, DialecticResult } from './types';
import { PERSONAS } from './constants';
import { runThesis } from './services/hegel/chola';
import { runAntithesis } from './services/hegel/malandra';
import { runSynthesis } from './services/hegel/fresa';

// Components
import DialecticDisplay from './components/DialecticDisplay';
import StatsView from './components/StatsView';
import TabSelector from './components/TabSelector';
import QuickAction from './components/QuickAction';
import ContentView from './components/ContentView';

const App: React.FC = () => {
  // Access chrome APIs safely
  const chromeApi = (window as any).chrome;
  
  const [activeTab, setActiveTab] = useState<AppTab>('DIALECTIC');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'IDLE' | 'THESIS' | 'ANTITHESIS' | 'SYNTHESIS'>('IDLE');
  const [result, setResult] = useState<DialecticResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Robust check for the chrome extension environment
    if (!chromeApi?.runtime?.onMessage) return;

    const messageListener = (msg: any) => {
      if (msg.action === "START_DIALECTIC" || msg.action === "CONTEXT_ANALYSIS") {
        setInput(msg.text);
        setActiveTab('DIALECTIC');
        executeDialectic(msg.text);
      } else if (msg.action === "executeAnalysis") {
         setInput(msg.text);
         setActiveTab('DIALECTIC'); // Assuming default is Dialectic for now
         executeDialectic(msg.text);
      }
    };
    chromeApi.runtime.onMessage.addListener(messageListener);

    // Initial check for contextual input from background
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
    setResult(null);
    setFeedback(null);
    
    try {
      // Step 1: Thesis (Chola)
      setCurrentStep('THESIS');
      const thesis = await runThesis(true, textInput);
      
      // Step 2: Antithesis (Malandra)
      setCurrentStep('ANTITHESIS');
      const antithesis = await runAntithesis(textInput, thesis);
      
      // Step 3: Synthesis (Fresa)
      setCurrentStep('SYNTHESIS');
      const synthesisData = await runSynthesis(thesis, antithesis);
      
      const newResult: DialecticResult = {
        thesis,
        antithesis,
        synthesis: synthesisData.text,
        level: synthesisData.level,
        alignment: synthesisData.alignment,
        timestamp: new Date().toISOString(),
        source: 'HYBRID'
      };
      
      setResult(newResult);
      setCurrentStep('IDLE');

      // Persistence and Stats update
      if (chromeApi?.storage?.local) {
        chromeApi.storage.local.get(['history', 'magistral_stats'], (data: any) => {
          const history = data.history || [];
          chromeApi.storage.local.set({ 
            history: [newResult, ...history].slice(0, 20) 
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
      // Clean input after execution if needed? The prompt says "limpia el textarea"
      setInput('');
    }
  };

  const handleManualSubmit = () => executeDialectic(input);

  const renderStepIndicator = () => {
    if (!loading) return null;
    
    const steps = [
      { id: 'THESIS', label: 'TESIS', persona: PERSONAS.CHOLA },
      { id: 'ANTITHESIS', label: 'ANTÍTESIS', persona: PERSONAS.MALANDRA },
      { id: 'SYNTHESIS', label: 'SÍNTESIS', persona: PERSONAS.FRESA }
    ];

    return (
      <div className="flex justify-between items-center gap-2 mb-8 animate-in fade-in zoom-in duration-500">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isDone = steps.findIndex(s => s.id === currentStep) > idx;
          
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
    <div id="command-center" className="h-screen bg-obsidian-void text-primary font-main flex flex-col selection:bg-accent-magenta selection:text-white">
      
      <TabSelector activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as AppTab)} />

      <ContentView>
        {activeTab === 'DIALECTIC' && (
          <div className="dialectic-output">
            {loading && (
              <div className="py-10">
                {renderStepIndicator()}
                <div className="flex flex-col items-center justify-center space-y-4">
                   <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-2 border-accent-cyan/20 rounded-full"></div>
                      <div className="absolute inset-0 border-t-2 border-accent-cyan rounded-full animate-spin"></div>
                   </div>
                   <p className="font-syncopate text-[7px] tracking-[0.4em] text-accent-cyan uppercase animate-pulse">
                     Procesando Dialéctica...
                   </p>
                </div>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DialecticDisplay result={result} />
                
                {/* Dynamic Feedback Loop */}
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] text-center space-y-6 glow-card">
                  <p className="text-[9px] font-syncopate text-gray-500 uppercase tracking-widest">Feedback del Sistema</p>
                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => setFeedback('Sincronía reforzada.')}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        👍
                      </div>
                    </button>
                    <button 
                      onClick={() => setFeedback('Ajuste registrado.')}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full border border-rose-500/30 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-black transition-all">
                        👎
                      </div>
                    </button>
                  </div>
                  {feedback && (
                    <p className="text-[9px] font-syncopate text-accent-cyan animate-pulse uppercase tracking-widest">
                      {feedback}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!loading && !result && (
               <div className="text-center mt-20 text-[#b3b3b3]">
                 <p className="font-syncopate text-sm">ESPERANDO INPUT...</p>
                 <p className="text-xs mt-2">Ingrese texto en la terminal inferior.</p>
               </div>
            )}
          </div>
        )}

        {activeTab === 'VISION' && (
           <div className="flex items-center justify-center h-full text-[#b3b3b3]">
             <div className="text-center">
               <h3 className="font-syncopate text-accent-magenta">MÓDULO DE VISIÓN</h3>
               <p className="text-sm mt-2">En espera de señal visual...</p>
             </div>
           </div>
        )}

        {activeTab === 'AUDIO' && (
           <div className="flex items-center justify-center h-full text-[#b3b3b3]">
             <div className="text-center">
               <h3 className="font-syncopate text-accent-magenta">MÓDULO DE AUDIO</h3>
               <p className="text-sm mt-2">Frecuencia silenciosa.</p>
             </div>
           </div>
        )}

        {activeTab === 'STATS' && (
          <div className="max-w-5xl mx-auto">
            <StatsView />
          </div>
        )}
      </ContentView>

      <QuickAction
        input={input}
        setInput={setInput}
        onSubmit={handleManualSubmit}
        loading={loading}
      />
    </div>
  );
};

export default App;
