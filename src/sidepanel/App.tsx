
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
    <div className="app-container">
      <div className="scanner-overlay" />

      {/* HEADER */}
      <header className="header">
        <div className="header-top">
          <div className="brand">
            <div className="status-dot"></div>
            <h1 className="brand-title">CHALAMANDRA</h1>
          </div>
          <button onClick={handlePageExtraction} className="extract-btn">
            Extract Context
          </button>
        </div>
        <nav className="nav">
          {([
            { id: 'DIALECTIC', label: 'Dialéctica' },
            { id: 'VISION', label: 'Visión' },
            { id: 'AUDIO', label: 'Audio' },
            { id: 'STATS', label: 'Stats' }
          ] as {id: AppTab, label: string}[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN */}
      <main className="main-content custom-scrollbar">
        {activeTab === 'DIALECTIC' && (
          <div className="fade-in">
            {!loading && !result && (
              <div className="empty-state">
                <div style={{ transform: 'scale(1.5)', marginBottom: '1rem' }}>{ASSETS.LOGO}</div>
                <p className="empty-title">Awaiting Input</p>
                <p className="empty-subtitle">Select text or type below</p>
              </div>
            )}

            {loading && (
              <div className="empty-state" style={{ opacity: 1 }}>
                <p className="empty-title" style={{ color: 'var(--accent-cyan)' }}>PROCESSING: {currentStep}</p>
              </div>
            )}

            {!loading && result && (
              <>
                <DialecticDisplay result={result} />
                {feedback && <div className="card" style={{marginTop: '1rem', textAlign: 'center', fontSize: '10px', color: 'var(--accent-cyan)'}}>{feedback}</div>}
              </>
            )}
          </div>
        )}

        {activeTab === 'VISION' && (
          <div className="empty-state">
            <p className="empty-title">Vision Mode Locked</p>
            <p className="empty-subtitle">Protocol V1.7 Prerequisite</p>
          </div>
        )}

        {activeTab === 'AUDIO' && (
          <div className="empty-state">
            <p className="empty-title">Audio Stream Offline</p>
          </div>
        )}

        {activeTab === 'STATS' && <StatsView />}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="input-group">
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
            className="input-area"
          />
          <button
            onClick={handleQuickSubmit}
            disabled={!quickInput.trim() || loading}
            className="send-btn"
          >
            ➜
          </button>
        </div>
        <div className="footer-status">
          Magistral Decox // Status: {loading ? 'SYNCING' : 'READY'}
        </div>
      </footer>
    </div>
  );
};

export default App;
