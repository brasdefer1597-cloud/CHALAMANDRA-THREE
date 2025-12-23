
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
    <div className="animate-in fade-in duration-1000">
      <div className="stats-grid">
        <div className="stat-box group">
          <div className="stat-box-label group-hover:text-gray-400 transition-colors">Total_Ops</div>
          <div className="stat-box-number">{stats.totalAnalyses}</div>
        </div>
        <div className="stat-box local group">
          <div className="stat-box-label transition-colors">Local_Ops</div>
          <div className="stat-box-number">{stats.localAnalyses}</div>
        </div>
        <div className="stat-box cloud group">
          <div className="stat-box-label transition-colors">Cloud_Ops</div>
          <div className="stat-box-number">{stats.cloudAnalyses}</div>
        </div>
      </div>

      <div className="efficiency-card">
        <div className="absolute top-0 right-0 p-12 opacity-40">
            {ASSETS.PRIVACY_LOCK}
        </div>
        <div className="efficiency-layout">
          <div className="flex-1 space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 className="text-3xl font-syncopate font-bold tracking-widest uppercase" style={{ color: 'var(--platinum-cyan)', letterSpacing: '0.2em' }}>Eficiencia Estratégica</h3>
            <p className="text-gray-400 font-main text-lg leading-relaxed max-w-xl" style={{ color: '#9ca3af' }}>
              La arquitectura de Chalamandra prioriza el <span className="italic" style={{ color: 'white' }}>procesamiento local (Gemini Nano)</span>. Esto garantiza la soberanía de sus datos y una latencia mínima en operaciones tácticas.
            </p>
            <div className="flex gap-4 font-mono text-xs text-gray-600 tracking-widest uppercase mt-4" style={{ fontSize: '10px' }}>
                <span>[Privacy_Status: Maximum]</span>
                <span>[Egress_Risk: Null]</span>
            </div>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 filter" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 15px rgba(0,229,255,0.4))' }}>
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" style={{ color: 'var(--white-5)' }} />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={552} strokeDashoffset={552 - (552 * efficiency / 100)}
                className="transition-all duration-1000 ease-out"
                style={{ color: 'var(--platinum-cyan)', transitionDuration: '2000ms' }} />
            </svg>
            <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="text-4xl font-syncopate text-white font-bold">{efficiency}%</div>
                <div className="text-xs font-syncopate uppercase tracking-widest mt-1" style={{ fontSize: '9px', color: 'var(--platinum-cyan-40)' }}>Local_Sync</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '4rem' }}>
        <div className="flex items-center gap-6">
            <h3 className="text-sm font-syncopate font-bold text-gray-500 tracking-widest uppercase" style={{ letterSpacing: '0.5em' }}>Hitos_Magistrales</h3>
            <div className="h-px flex-1 bg-white-5" style={{ height: '1px', backgroundColor: 'var(--white-5)', flex: 1 }}></div>
        </div>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = stats.achievements.includes(ach.id);
            return (
              <div key={ach.id} className={`achievement-card group ${isUnlocked ? 'unlocked' : ''}`}>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="achievement-icon">
                    {isUnlocked ? '✦' : '✧'}
                  </div>
                  <div>
                    <div className={`text-xs font-syncopate font-bold tracking-widest uppercase mb-1 ${isUnlocked ? 'text-white' : 'text-gray-600'}`} style={{ fontSize: '11px', letterSpacing: '0.3em' }}>{ach.title}</div>
                    <div className="text-sm text-gray-500 font-main leading-relaxed">{ach.message}</div>
                  </div>
                </div>
                {isUnlocked && (
                    <div className="absolute -bottom-4 -right-4 text-8xl font-syncopate pointer-events-none transition-colors" style={{ fontSize: '6rem', color: 'rgba(230, 194, 117, 0.05)' }}>
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
