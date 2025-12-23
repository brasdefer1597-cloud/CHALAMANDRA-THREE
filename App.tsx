
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, DialecticResult } from './types';
import { ASSETS, PERSONAS } from './constants';
import { runThesis } from './services/hegel/chola';
import { runAntithesis } from './services/hegel/malandra';
import { runSynthesis } from './services/hegel/fresa';

// Components
import DialecticDisplay from './components/DialecticDisplay';
import StatsView from './components/StatsView';

const App: React.FC = () => {
  // Access chrome APIs safely
  const chromeApi = (window as any).chrome;
  
  const [activeTab, setActiveTab] = useState<AppTab>('DIALECTIC');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'IDLE' | 'THESIS' | 'ANTITHESIS' | 'SYNTHESIS'>('IDLE');
  const [useThinking, setUseThinking] = useState(false);
  const [result, setResult] = useState<DialecticResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Robust check for the chrome extension environment
    if (!chromeApi?.runtime?.onMessage) return;

    const messageListener = (msg: any) => {
      // Handle the simulated response from background.js
      if (msg.action === "ANALYSIS_COMPLETE") {
        setResult(msg.result);
        setLoading(false);
        setCurrentStep('IDLE');
      }

      if (msg.action === "START_DIALECTIC" || msg.action === "CONTEXT_ANALYSIS") {
        setInput(msg.text);
        setActiveTab('DIALECTIC');
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
    setCurrentStep('THESIS'); // Start indicating loading immediately

    // Dispatch message to background.js to simulate analysis
    if (chromeApi?.runtime?.sendMessage) {
        chromeApi.runtime.sendMessage({
            action: "executeAnalysis",
            prompt: textInput
        }, (response: any) => {
            // If the background script returns directly (not via onMessage)
            if (response && response.result) {
                 // But wait, the background script is simulated to return a string,
                 // but our App expects a DialecticResult object structure.
                 // We should probably handle the structure parsing here or in background.
                 // The user prompt said: { result: `Respuesta simulada...` }
                 // But DialecticDisplay needs { thesis, antithesis, synthesis ... }
                 // I will mock a full object in the background response for now to make it work seamlessly.
            }
        });
    } else {
        // Fallback for development outside extension
        console.warn("Chrome API not available, simulating locally");
        setTimeout(() => {
            setResult({
                thesis: "Simulated Thesis",
                antithesis: "Simulated Antithesis",
                synthesis: "Simulated Synthesis",
                level: 5,
                alignment: 99,
                timestamp: new Date().toISOString(),
                source: "SIMULATED"
            });
            setLoading(false);
            setCurrentStep('IDLE');
        }, 2000);
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
    if (!loading) return null;
    
    const steps = [
      { id: 'THESIS', label: 'TESIS', persona: PERSONAS.CHOLA },
      { id: 'ANTITHESIS', label: 'ANTÍTESIS', persona: PERSONAS.MALANDRA },
      { id: 'SYNTHESIS', label: 'SÍNTESIS', persona: PERSONAS.FRESA }
    ];

    return (
      <div className="step-indicator-container">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isDone = steps.findIndex(s => s.id === currentStep) > idx;
          
          return (
            <div key={step.id} className="step-item">
              <div className={`step-circle ${isActive ? 'active' : ''} ${isDone ? 'border-emerald-500 text-emerald-500' : ''}`}
                   style={isActive ? { borderColor: step.persona.color.replace('text-', 'var(--') + ')', color: step.persona.color.replace('text-', 'var(--') + ')' } : {}}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={`step-label ${isActive ? 'text-white' : ''}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="scanner" />
      
      <header className="app-header">
        <div className="header-logo-group">
          {ASSETS.LOGO}
          <div className="cursor-default">
            <h1 className="text-xl font-syncopate font-bold text-gradient">CHALAMANDRA</h1>
            <p className="text-xs text-gray-600 tracking-widest uppercase" style={{ fontSize: '8px', letterSpacing: '0.4em' }}>V1.6.2 Elite Protocol</p>
          </div>
        </div>
        <nav className="header-nav">
          {(['DIALECTIC', 'STATS'] as AppTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'DIALECTIC' && (
          <div className="input-section">
            <section className="input-wrapper">
              <div className="input-glow-bg"></div>
              <textarea
                className="main-textarea"
                placeholder="Introduzca texto o use 'Leer Página'..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
            </section>

            <div className="action-buttons">
              <button
                onClick={() => setUseThinking(!useThinking)}
                className={`btn-base btn-toggle ${useThinking ? 'active' : ''}`}
              >
                {useThinking ? 'Deep Thinking ON' : 'Standard Logic'}
              </button>
              <button
                onClick={handlePageExtraction}
                disabled={loading}
                className="btn-base btn-secondary"
              >
                Leer Página
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={loading || !input}
                className="btn-base btn-primary"
              >
                {loading ? 'Sincronizando...' : 'Ejecutar Hegel-Trinity'}
              </button>
            </div>

            {loading && (
              <div className="py-10">
                {renderStepIndicator()}
                <div className="flex flex-col items-center justify-center gap-4">
                   <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-2 border-champagne-gold-20 rounded-full"></div>
                      <div className="absolute inset-0 border-t-2 rounded-full animate-spin" style={{ borderColor: 'var(--champagne-gold)', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}></div>
                   </div>
                   <p className="font-syncopate text-xs tracking-widest text-champagne-gold uppercase animate-pulse" style={{ fontSize: '7px', letterSpacing: '0.4em' }}>
                     Accediendo al Núcleo Dialéctico...
                   </p>
                </div>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <DialecticDisplay result={result} />
                
                {/* Dynamic Feedback Loop */}
                <div className="feedback-card">
                  <p className="text-xs font-syncopate text-gray-500 uppercase tracking-widest" style={{ fontSize: '9px' }}>¿Ha sido útil esta resolución?</p>
                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => setFeedback('Sincronía reforzada. Datos guardados.')} 
                      className="feedback-btn group"
                    >
                      <div className="feedback-circle up">
                        👍
                      </div>
                      <span className="text-xs font-syncopate text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '7px' }}>Útil</span>
                    </button>
                    <button 
                      onClick={() => setFeedback('Ajuste crítico registrado para el próximo ciclo.')} 
                      className="feedback-btn group"
                    >
                      <div className="feedback-circle down">
                        👎
                      </div>
                      <span className="text-xs font-syncopate text-rose-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '7px' }}>Ajustar</span>
                    </button>
                  </div>
                  {feedback && (
                    <p className="text-xs font-syncopate text-platinum-cyan animate-pulse uppercase tracking-widest" style={{ fontSize: '9px' }}>
                      {feedback}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'STATS' && (
          <div className="max-w-5xl mx-auto">
            <StatsView />
          </div>
        )}
      </main>

      <footer className="app-footer">
        Magistral Decox Systems &copy; 2025 // STATUS: OPERATIONAL
      </footer>
    </div>
  );
};

export default App;
