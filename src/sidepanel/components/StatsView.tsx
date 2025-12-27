
import React, { useEffect, useState } from 'react';
import { MagistralStats } from '../../utils/types';
import { getMagistralStats, ACHIEVEMENTS } from '../services/achievementService';
import { ASSETS } from '../../utils/constants';

const StatsView: React.FC = () => {
  const [stats, setStats] = useState<MagistralStats | null>(null);

  useEffect(() => {
    getMagistralStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-4 text-center text-xs font-mono text-gray-600">Loading Neuro-metrics...</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-[10px] font-syncopate text-accent-cyan uppercase tracking-widest mb-2">Magistral Analytics</h2>
        <div className="flex justify-center gap-4 text-xs font-mono text-gray-400">
           <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
             TOTAL: <span className="text-white">{stats.totalAnalyses}</span>
           </div>
           <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
             CLOUD: <span className="text-white">{stats.cloudAnalyses}</span>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {ACHIEVEMENTS.map(ach => {
          const unlocked = stats.achievements.includes(ach.id);
          return (
            <div key={ach.id} className="aspect-square p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all"
                 style={{
                   backgroundColor: unlocked ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                   borderColor: unlocked ? 'rgba(0,255,255,0.4)' : 'rgba(255,255,255,0.05)',
                   opacity: unlocked ? 1 : 0.4,
                   filter: unlocked ? 'none' : 'grayscale(100%)'
                 }}>
               <div className="text-xl mb-1">{ach.icon}</div>
               <p className="text-[6px] font-syncopate uppercase text-white/80 leading-tight">{ach.name}</p>
            </div>
          );
        })}
      </div>

      <div className="card relative overflow-hidden">
         <p className="text-[8px] font-mono text-gray-500 mb-1">CURRENT RANK</p>
         <p className="text-sm font-bold text-white uppercase tracking-widest font-syncopate">
           {stats.totalAnalyses < 10 ? 'Neophyte' : stats.totalAnalyses < 50 ? 'Dialectician' : 'Hegelian Master'}
         </p>
         <div className="w-full bg-white/10 h-1 mt-3 rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{ width: `${(stats.totalAnalyses % 50) * 2}%`, background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-magenta))' }}
            ></div>
         </div>
      </div>
    </div>
  );
};

export default StatsView;
