
import React, { useEffect, useState } from 'react';
import { MagistralStats } from '../../utils/types';
import { getMagistralStats, ACHIEVEMENTS } from '../services/achievementService';
import { ASSETS } from '../../utils/constants';

const StatsView: React.FC = () => {
  const [stats, setStats] = useState<MagistralStats | null>(null);

  useEffect(() => {
    getMagistralStats().then(setStats);
  }, []);

  if (!stats) return <div style={{textAlign: 'center', padding: '2rem', fontSize: '10px', color: '#6b7280'}}>Loading Neuro-metrics...</div>;

  return (
    <div className="fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <div style={{textAlign: 'center'}}>
        <h2 style={{fontFamily: 'var(--font-syncopate)', fontSize: '10px', color: 'var(--accent-cyan)', letterSpacing: '0.3em', marginBottom: '0.5rem'}}>Magistral Analytics</h2>
        <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '10px', fontFamily: 'var(--font-mono)'}}>
           <div style={{background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem'}}>
             TOTAL: <span style={{color: 'white'}}>{stats.totalAnalyses}</span>
           </div>
           <div style={{background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem'}}>
             CLOUD: <span style={{color: 'white'}}>{stats.cloudAnalyses}</span>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {ACHIEVEMENTS.map(ach => {
          const unlocked = stats.achievements.includes(ach.id);
          return (
            <div key={ach.id} style={{
              aspectRatio: '1',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: unlocked ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              opacity: unlocked ? 1 : 0.4,
              filter: unlocked ? 'none' : 'grayscale(100%)'
            }}>
               <div style={{fontSize: '1.2rem', marginBottom: '0.25rem'}}>{ach.icon}</div>
               <p style={{fontSize: '6px', fontFamily: 'var(--font-syncopate)', textTransform: 'uppercase', lineHeight: 1.2}}>{ach.name}</p>
            </div>
          );
        })}
      </div>

      <div className="card" style={{position: 'relative', overflow: 'hidden'}}>
         <p style={{fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#6b7280', margin: 0}}>CURRENT RANK</p>
         <p style={{fontSize: '14px', fontWeight: 'bold', color: 'white', fontFamily: 'var(--font-syncopate)', letterSpacing: '0.2em', margin: '0.25rem 0 0.5rem 0'}}>
           {stats.totalAnalyses < 10 ? 'Neophyte' : stats.totalAnalyses < 50 ? 'Dialectician' : 'Hegelian Master'}
         </p>
         <div style={{width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden'}}>
            <div style={{
              height: '100%',
              width: `${(stats.totalAnalyses % 50) * 2}%`,
              background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-magenta))'
            }} />
         </div>
      </div>
    </div>
  );
};

export default StatsView;
