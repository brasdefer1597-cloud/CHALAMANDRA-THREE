
import React, { useState, useEffect } from 'react';
import { AppTab, DialecticResult } from '../utils/types';
import { ASSETS, PERSONAS } from '../utils/constants';
import * as ai from './services/geminiService';
import { runThesis } from './services/hegel/chola';
import { runAntithesis } from './services/hegel/malandra';
import { runSynthesis } from './services/hegel/fresa';

// Components
import DialecticDisplay from './components/DialecticDisplay';
import StatsView from './components/StatsView';

import './sidepanel.css';

const App: React.FC = () => {
  const chromeApi = (window as any).chrome;
  
  const [activeTab, setActiveTab] = useState<AppTab>('DIALECTIC');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'IDLE' | 'THESIS' | 'ANTITHESIS' | 'SYNTHESIS'>('IDLE');
  const [useThinking, setUseThinking] = useState(false);
  const [result, setResult] = useState<DialecticResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quickInput, setQuickInput] = useState('');

  useEffect(() => {
    if (!chromeApi?.runtime?.onMessage) return;

    const messageListener = (msg: any) => {
      if (msg.action === "START_DIALECTIC" || msg.action === "CONTEXT_ANALYSIS") {
        setActiveTab('DIALECTIC');
        executeDialectic(msg.text);
      }
    };
    chromeApi.runtime.onMessage.addListener(messageListener);

    if (chromeApi.storage?.local) {
      chromeApi.storage.local.get(['lastContextualInput'], (data: any) => {
        if (data.lastContextualInput) {
          setActiveTab('DIALECTIC');
          executeDialectic(data.lastContextualInput);
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
      setCurrentStep('THESIS');
      const thesis = await runThesis(true, textInput);
      
      setCurrentStep('ANTITHESIS');
      const antithesis = await runAntithesis(textInput, thesis);
      
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
    }
  };

  const handleQuickSubmit = () => {
    if (quickInput.trim()) {
      executeDialectic(quickInput);
      setQuickInput('');
    }
  };

  const handlePageExtraction = () => {
    if (loading || !chromeApi?.runtime?.sendMessage) return;
    setLoading(true);
    chromeApi.runtime.sendMessage({ action: "GET_PAGE_TEXT" }, (response: any) => {
      if (response && response.text) {
        executeDialectic(response.text);
      } else {
        setLoading(false);
        setFeedback(response?.error || "No context found on page.");
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-obsidian-void overflow-hidden">
      <div className="scanner fixed top-0 left-0 w-full z-50 pointer-events-none opacity-20" />
      
      {/* 1. HEADER: Tab Selector */}
      <header className="flex-none header-blur z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
            <h1 className="text-[10px] font-syncopate font-bold tracking-[0.4em] text-white">CHALAMANDRA</h1>
          </div>
          <button 
            onClick={handlePageExtraction}
            className="text-[8px] font-syncopate text-accent-cyan opacity-60 hover:opacity-100 uppercase tracking-widest transition-all"
          >
            Extract Context
          </button>
        </div>
        <nav className="flex justify-around px-2 pb-1">
          {([
            { id: 'DIALECTIC', label: 'Dialéctica' },
            { id: 'VISION', label: 'Visión' },
            { id: 'AUDIO', label: 'Audio' },
            { id: 'STATS', label: 'Stats' }
          ] as {id: AppTab, label: string}[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 2. MAIN: ContentView */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'DIALECTIC' && (
          <div className="flex flex-col gap-3">
            {!loading && !result && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <div className="mb-4">{ASSETS.LOGO}</div>
                <p className="text-[9px] font-syncopate uppercase tracking-[0.3em]">Awaiting Dialectic Input</p>
                <p className="text-[8px] mt-2 font-main text-text-secondary">Input text below or select from browser context menu</p>
              </div>
            )}

            {loading && (
              <div className="py-20 flex flex-col gap-3 animate-pulse">
                <div className="flex justify-between items-center gap-2">
                   {['THESIS', 'ANTITHESIS', 'SYNTHESIS'].map((step, i) => (
                     <div key={step} className="flex-1 flex flex-col items-center gap-2">
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '50%',
                          border: currentStep === step ? '2px solid var(--accent-cyan)' : '2px solid rgba(255,255,255,0.05)',
                          color: currentStep === step ? 'var(--accent-cyan)' : 'gray',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                        }}>
                          {i+1}
                        </div>
                        <span className="text-[7px] font-syncopate tracking-widest">{step}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {!loading && result && (
              <div className="animate-fade-in">
                <DialecticDisplay result={result} />
                
                {feedback && (
                  <div className="mt-8 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl text-center">
                    <p className="text-[9px] font-syncopate text-accent-cyan uppercase tracking-widest animate-pulse">
                      {feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'VISION' && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
            <p className="text-[9px] font-syncopate uppercase tracking-widest">Vision Mode Locked</p>
            <p className="text-[7px] font-main mt-1 uppercase tracking-widest">Protocol V1.7 Prerequisite</p>
          </div>
        )}

        {activeTab === 'AUDIO' && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
            <p className="text-[9px] font-syncopate uppercase tracking-widest">Audio Stream Offline</p>
            <p className="text-[7px] font-main mt-1 uppercase tracking-widest">Encrypted Live Link Required</p>
          </div>
        )}

        {activeTab === 'STATS' && <StatsView />}
      </main>

      {/* 3. FOOTER: QuickAction Bar */}
      <footer className="flex-none p-4 header-blur">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative group">
            <textarea
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickSubmit();
                }
              }}
              placeholder="Análisis rápido..."
              className="w-full input-area h-12"
            />
          </div>
          <button 
            onClick={handleQuickSubmit}
            disabled={!quickInput.trim() || loading}
            className="action-btn w-12 h-12"
          >
            ➜
          </button>
        </div>
        <div className="mt-2 text-[6px] font-syncopate text-gray-600 tracking-[0.5em] text-center uppercase">
          Magistral Decox // Status: {loading ? 'Sincronizando' : 'Operativo'}
        </div>
      </footer>
    </div>
  );
};

export default App;
