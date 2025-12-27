
import React from 'react';
import { DialecticResult } from '../utils/types';
import { PERSONAS } from '../utils/constants';

interface DialecticDisplayProps {
  result: DialecticResult;
}

const DialecticDisplay: React.FC<DialecticDisplayProps> = ({ result }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* TESIS */}
      <section className="card group">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-xs">
             {PERSONAS.CHOLA.emoji}
           </div>
           <div>
             <h3 className="text-[10px] font-syncopate font-bold text-gray-400 group-hover:text-white transition-all">TESIS (CHOLA)</h3>
             <p className="text-[8px] text-gray-600 font-mono">Pattern Recognition Module</p>
           </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-main" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem' }}>
          {result.thesis}
        </p>
      </section>

      {/* ANTITESIS */}
      <section className="card group">
        <div className="flex items-center gap-3 mb-2" style={{ flexDirection: 'row-reverse', textAlign: 'right' }}>
           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-xs">
             {PERSONAS.MALANDRA.emoji}
           </div>
           <div>
             <h3 className="text-[10px] font-syncopate font-bold text-gray-400 group-hover:text-accent-magenta transition-all">ANTÍTESIS (MALANDRA)</h3>
             <p className="text-[8px] text-gray-600 font-mono">Disruption Engine</p>
           </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-main text-right" style={{ borderRight: '2px solid rgba(255,0,255,0.2)', paddingRight: '0.75rem' }}>
          {result.antithesis}
        </p>
      </section>

      {/* SINTESIS */}
      <section className="synthesis-card">
        <div className="synthesis-inner relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta))' }}>
              {PERSONAS.FRESA.emoji}
            </div>
            <div>
              <h3 className="text-[12px] font-syncopate font-bold" style={{ background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SÍNTESIS (FRESA)</h3>
              <div className="flex gap-2 text-[8px] font-mono mt-1 text-gray-500">
                <span>LVL: {result.level || 1}</span>
                <span>•</span>
                <span>COHERENCE: {result.alignment || 0}%</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-white font-medium leading-loose" style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
            {result.synthesis}
          </p>

          <div className="mt-4 flex justify-between items-center opacity-40 text-[8px] font-syncopate uppercase">
             <span>Generated via {result.source} Protocol</span>
             <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DialecticDisplay;
