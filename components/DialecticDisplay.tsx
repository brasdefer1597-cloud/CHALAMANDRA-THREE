
import React from 'react';
import { DialecticResult } from '../types';
import { PERSONAS } from '../constants';

interface DialecticDisplayProps {
  result: DialecticResult;
}

const DialecticDisplay: React.FC<DialecticDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Thesis Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
           <div className="w-1 h-3 bg-champagne-gold/50"></div>
           <h3 className="text-[10px] font-syncopate font-bold text-champagne-gold tracking-widest uppercase">
             {PERSONAS.CHOLA.name}
           </h3>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-300 font-main text-sm leading-relaxed">
          {result.thesis}
        </div>
      </div>

      {/* Antithesis Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
           <div className="w-1 h-3 bg-accent-magenta/50"></div>
           <h3 className="text-[10px] font-syncopate font-bold text-accent-magenta tracking-widest uppercase">
             {PERSONAS.MALANDRA.name}
           </h3>
        </div>
        <div className="p-5 rounded-2xl bg-accent-magenta/[0.02] border border-accent-magenta/10 text-gray-300 font-main text-sm leading-relaxed">
          {result.antithesis}
        </div>
      </div>

      {/* Synthesis Section - HERO VIEW */}
      <div className="pt-6 border-t border-white/5">
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-accent-cyan/[0.07] via-transparent to-transparent border border-accent-cyan/10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-cyan/10 blur-[80px] rounded-full"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
              {PERSONAS.FRESA.icon}
            </div>
            <h3 className="text-sm font-syncopate font-bold text-white tracking-[0.2em] uppercase">
              Resultado de Síntesis
            </h3>
          </div>

          <div className="text-gray-100 text-lg md:text-xl leading-relaxed font-main italic">
            <span className="text-3xl text-accent-cyan font-syncopate not-italic mr-1">“</span>
            {result.synthesis}
            <span className="text-3xl text-accent-cyan font-syncopate not-italic ml-1">”</span>
          </div>

          <div className="mt-8 flex items-center gap-8 pt-6 border-t border-white/5">
            <div>
              <div className="text-[8px] font-syncopate text-gray-600 uppercase tracking-widest mb-1">Coherencia</div>
              <div className="text-xl font-syncopate text-accent-cyan">{result.alignment}%</div>
            </div>
            <div>
              <div className="text-[8px] font-syncopate text-gray-600 uppercase tracking-widest mb-1">Nivel_Evo</div>
              <div className="text-xl font-syncopate text-accent-cyan">S-{result.level}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialecticDisplay;
