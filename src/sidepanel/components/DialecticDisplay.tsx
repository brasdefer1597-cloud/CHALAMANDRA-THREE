
import React from 'react';
import { DialecticResult } from '../../utils/types';
import { PERSONAS } from '../../utils/constants';

interface DialecticDisplayProps {
  result: DialecticResult;
}

const DialecticDisplay: React.FC<DialecticDisplayProps> = ({ result }) => {
  return (
    <div className="fade-in">
      {/* TESIS */}
      <section className="card">
        <div className="card-header">
           <div className="persona-icon">{PERSONAS.CHOLA.emoji}</div>
           <div className="persona-info">
             <h3>TESIS (CHOLA)</h3>
             <p>Pattern Recognition Module</p>
           </div>
        </div>
        <p className="card-content">
          {result.thesis}
        </p>
      </section>

      {/* ANTITESIS */}
      <section className="card">
        <div className="card-header reverse">
           <div className="persona-icon">{PERSONAS.MALANDRA.emoji}</div>
           <div className="persona-info" style={{textAlign: 'right'}}>
             <h3 style={{color: 'var(--accent-magenta)'}}>ANTÍTESIS (MALANDRA)</h3>
             <p>Disruption Engine</p>
           </div>
        </div>
        <p className="card-content reverse">
          {result.antithesis}
        </p>
      </section>

      {/* SINTESIS */}
      <section className="synthesis-card">
        <div className="synthesis-inner">
          <div className="card-header">
            <div className="persona-icon" style={{background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta))', color: 'black', fontWeight: 'bold'}}>
              {PERSONAS.FRESA.emoji}
            </div>
            <div>
              <h3 className="synthesis-title">SÍNTESIS (FRESA)</h3>
              <div className="synthesis-meta">
                <span>LVL: {result.level || 1}</span>
                <span>•</span>
                <span>COHERENCE: {result.alignment || 0}%</span>
              </div>
            </div>
          </div>

          <p className="card-content" style={{borderLeftColor: 'var(--accent-cyan)', color: 'white', fontSize: '13px'}}>
            {result.synthesis}
          </p>

          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '6px', fontFamily: 'var(--font-syncopate)', opacity: 0.5, textTransform: 'uppercase'}}>
             <span>Via {result.source} Protocol</span>
             <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DialecticDisplay;
