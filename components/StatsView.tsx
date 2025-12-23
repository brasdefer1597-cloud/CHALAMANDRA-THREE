
import React, { useEffect, useState } from 'react';
import { MagistralStats } from '../types';
import { getMagistralStats, ACHIEVEMENTS } from '../services/achievementService';
import { ASSETS } from '../constants';

const StatsView: React.FC = () => {
  const [stats, setStats] = useState<MagistralStats>({
    totalAnalyses: 0,
    localAnalyses: 0,
    cloudAnalyses: 0,
    achievements: []
  });

  useEffect(() => {
    getMagistralStats().then(setStats);
  }, []);

  const efficiency = stats.totalAnalyses > 0 
    ? Math.round((stats.localAnalyses / stats.totalAnalyses) * 100) 
    : 0;

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glow-card p-10 rounded-3xl border border-white/5 bg-white/[0.02] text-center group">
          <div className="text-[11px] font-syncopate text-gray-600 tracking-[0.4em] uppercase mb-4 group-hover:text-gray-400 transition-colors">Total_Ops</div>
          <div className="text-6xl font-syncopate text-white font-bold">{stats.totalAnalyses}</div>
        </div>
        <div className="glow-card p-10 rounded-3xl border border-champagne-gold/10 bg-champagne-gold/[0.02] text-center group">
          <div className="text-[11px] font-syncopate text-champagne-gold/40 tracking-[0.4em] uppercase mb-4 group-hover:text-champagne-gold/70 transition-colors">Local_Ops</div>
          <div className="text-6xl font-syncopate text-champagne-gold font-bold">{stats.localAnalyses}</div>
        </div>
        <div className="glow-card p-10 rounded-3xl border border-electric-fuchsia/10 bg-electric-fuchsia/[0.02] text-center group">
          <div className="text-[11px] font-syncopate text-electric-fuchsia/40 tracking-[0.4em] uppercase mb-4 group-hover:text-electric-fuchsia/70 transition-colors">Cloud_Ops</div>
          <div className="text-6xl font-syncopate text-electric-fuchsia font-bold">{stats.cloudAnalyses}</div>
        </div>
      </div>

      <div className="glow-card p-12 rounded-[2.5rem] border border-platinum-cyan/10 bg-gradient-to-br from-platinum-cyan/[0.05] via-transparent to-purple-900/[0.05] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-40">
            {ASSETS.PRIVACY_LOCK}
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6">
            <h3 className="text-3xl font-syncopate font-bold text-platinum-cyan tracking-[0.2em] uppercase">Eficiencia Estratégica</h3>
            <p className="text-gray-400 font-main text-lg leading-relaxed max-w-xl">
              La arquitectura de Chalamandra prioriza el <span className="text-white italic">procesamiento local (Gemini Nano)</span>. Esto garantiza la soberanía de sus datos y una latencia mínima en operaciones tácticas.
            </p>
            <div className="flex gap-4 font-mono text-[10px] text-gray-600 tracking-widest uppercase mt-4">
                <span>[Privacy_Status: Maximum]</span>
                <span>[Egress_Risk: Null]</span>
            </div>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={552} strokeDashoffset={552 - (552 * efficiency / 100)}
                className="text-platinum-cyan transition-all duration-[2000ms] ease-out" />
            </svg>
            <div className="text-center">
                <div className="text-4xl font-syncopate text-white font-bold">{efficiency}%</div>
                <div className="text-[9px] font-syncopate text-platinum-cyan/60 uppercase tracking-widest mt-1">Local_Sync</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center gap-6">
            <h3 className="text-sm font-syncopate font-bold text-gray-500 tracking-[0.5em] uppercase">Hitos_Magistrales</h3>
            <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = stats.achievements.includes(ach.id);
            return (
              <div key={ach.id} className={`p-8 rounded-2xl border transition-all duration-700 relative overflow-hidden group ${isUnlocked ? 'border-champagne-gold/20 bg-champagne-gold/[0.03] shadow-[0_0_30px_rgba(230,194,117,0.05)]' : 'border-white/5 bg-white/[0.01] opacity-30'}`}>
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border text-xl transition-all duration-500 ${isUnlocked ? 'border-champagne-gold bg-champagne-gold/10 text-champagne-gold shadow-[0_0_15px_rgba(230,194,117,0.3)]' : 'border-gray-800 text-gray-800'}`}>
                    {isUnlocked ? '✦' : '✧'}
                  </div>
                  <div>
                    <div className={`text-[11px] font-syncopate font-bold tracking-[0.3em] uppercase mb-1 ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>{ach.title}</div>
                    <div className="text-sm text-gray-500 font-main leading-relaxed">{ach.message}</div>
                  </div>
                </div>
                {isUnlocked && (
                    <div className="absolute -bottom-4 -right-4 text-8xl font-syncopate text-champagne-gold/5 pointer-events-none group-hover:text-champagne-gold/10 transition-colors">
                        {stats.achievements.indexOf(ach.id) + 1}
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
