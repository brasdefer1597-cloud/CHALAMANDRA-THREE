
import React from 'react';
import { DialecticResult } from '../types';
import { PERSONAS } from '../constants';

interface DialecticDisplayProps {
  result: DialecticResult;
}

const DialecticDisplay: React.FC<DialecticDisplayProps> = ({ result }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="dialectic-grid">
        {/* Thesis Card */}
        <div className="dialectic-card thesis group">
          <div className="absolute top-0 left-0 w-1 h-full bg-champagne-gold-30 group-hover:bg-champagne-gold transition-colors"></div>
          <div className="card-header">
            <div className="icon-box thesis">
              {PERSONAS.CHOLA.icon}
            </div>
            <h3 className="card-title text-thesis">
              {PERSONAS.CHOLA.name}
            </h3>
          </div>
          <div className="card-content">
            {result.thesis}
          </div>
        </div>

        {/* Antithesis Card */}
        <div className="dialectic-card antithesis group">
          <div className="absolute top-0 left-0 w-1 h-full bg-electric-fuchsia-30 group-hover:bg-electric-fuchsia transition-colors"></div>
          <div className="card-header">
            <div className="icon-box antithesis">
              {PERSONAS.MALANDRA.icon}
            </div>
            <h3 className="card-title text-antithesis">
              {PERSONAS.MALANDRA.name}
            </h3>
          </div>
          <div className="card-content">
            {result.antithesis}
          </div>
        </div>
      </div>

      {/* Synthesis Card */}
      <div className="synthesis-card">
        <div className="absolute top-0 right-0 p-8">
            <div className="text-xs font-syncopate text-platinum-cyan-40 tracking-widest" style={{ fontSize: '10px', letterSpacing: '0.4em', color: 'var(--platinum-cyan-40)' }}>N-3_SYNTHESIS_ACTIVE</div>
        </div>
        <div className="card-header">
          <div className="icon-box synthesis">
            {PERSONAS.FRESA.icon}
          </div>
          <h3 className="card-title text-synthesis" style={{ fontSize: '1.875rem' }}>
            {PERSONAS.FRESA.name}
          </h3>
        </div>
        <div className="synthesis-content">
          {result.synthesis}
        </div>
        <div className="synthesis-stats">
            <div className="stat-group">
                <span className="stat-label">Protocolo</span>
                <span className="stat-value">V.12</span>
            </div>
            <div className="stat-group">
                <span className="stat-label">Sincronización</span>
                <span className="stat-value">{result.alignment}%</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DialecticDisplay;
