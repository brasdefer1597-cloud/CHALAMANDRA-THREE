
import React from 'react';
import { DialecticResult } from '../types';
import { PERSONAS } from '../utils/constants';

interface DialecticDisplayProps {
  result: DialecticResult;
}

const DialecticDisplay: React.FC<DialecticDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Thesis Card */}
        <div className={`p-8 rounded-2xl border ${PERSONAS.CHOLA.border} ${PERSONAS.CHOLA.bg} glow-card relative overflow-hidden group`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-champagne-gold/30 group-hover:bg-champagne-gold transition-colors" />
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-xl bg-champagne-gold/10 ${PERSONAS.CHOLA.color}`}>
              {PERSONAS.CHOLA.icon}
            </div>
            <h3 className={`text-xl font-bold font-syncopate tracking-widest ${PERSONAS.CHOLA.color}`}>
              {PERSONAS.CHOLA.name}
            </h3>
          </div>
          <div className="text-gray-300 leading-relaxed font-main text-base md:text-lg whitespace-pre-wrap">
            {result.thesis}
          </div>
        </div>

        {/* Antithesis Card */}
        <div className={`p-8 rounded-2xl border ${PERSONAS.MALANDRA.border} ${PERSONAS.MALANDRA.bg} glow-card relative overflow-hidden group`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-electric-fuchsia/30 group-hover:bg-electric-fuchsia transition-colors" />
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-xl bg-electric-fuchsia/10 ${PERSONAS.MALANDRA.color}`}>
              {PERSONAS.MALANDRA.icon}
            </div>
            <h3 className={`text-xl font-bold font-syncopate tracking-widest ${PERSONAS.MALANDRA.color}`}>
              {PERSONAS.MALANDRA.name}
            </h3>
          </div>
          <div className="text-gray-300 leading-relaxed font-main text-base md:text-lg whitespace-pre-wrap">
            {result.antithesis}
          </div>
        </div>
      </div>

      {/* Synthesis Card */}
      <div className={`p-12 rounded-3xl border-t-2 border-x border-b ${PERSONAS.FRESA.border} bg-gradient-to-br from-platinum-cyan/10 to-purple-900/20 glow-card relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8">
            <div className="text-[10px] font-syncopate text-platinum-cyan/40 tracking-[0.4em]">N-3_SYNTHESIS_ACTIVE</div>
        </div>
        <div className="flex items-center gap-4 mb-10">
          <div className={`p-4 rounded-xl bg-platinum-cyan/10 ${PERSONAS.FRESA.color}`}>
            {PERSONAS.FRESA.icon}
          </div>
          <h3 className={`text-3xl font-bold font-syncopate tracking-[0.2em] ${PERSONAS.FRESA.color}`}>
            {PERSONAS.FRESA.name}
          </h3>
        </div>
        <div className="text-gray-100 text-xl md:text-2xl leading-relaxed font-main whitespace-pre-wrap relative z-10 first-letter:text-6xl first-letter:font-bold first-letter:text-platinum-cyan first-letter:mr-2">
          {result.synthesis}
        </div>
        <div className="mt-12 flex flex-wrap gap-16 pt-10 border-t border-white/10">
            <div className="flex flex-col">
                <span className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-2">Protocolo</span>
                <span className="text-4xl font-syncopate text-platinum-cyan">V.12</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-2">Sincronización</span>
                <span className="text-4xl font-syncopate text-platinum-cyan">{result.alignment}%</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DialecticDisplay;
