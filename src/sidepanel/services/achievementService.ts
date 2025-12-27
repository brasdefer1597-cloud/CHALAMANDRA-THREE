
import { MagistralStats } from '../../utils/types';
import { storage } from '../../utils/storage';

export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Synthesis', icon: '🩸', condition: (s: MagistralStats) => s.totalAnalyses >= 1 },
  { id: 'dialectician', name: 'Dialectician', icon: '🧠', condition: (s: MagistralStats) => s.totalAnalyses >= 10 },
  { id: 'cloud_walker', name: 'Cloud Walker', icon: '☁️', condition: (s: MagistralStats) => s.cloudAnalyses >= 20 },
  { id: 'visionary', name: 'Visionary', icon: '👁️', condition: (s: MagistralStats) => false }, // Placeholder
  { id: 'audiophile', name: 'Audiophile', icon: '🎧', condition: (s: MagistralStats) => false }, // Placeholder
  { id: 'grand_master', name: 'Grand Master', icon: '👑', condition: (s: MagistralStats) => s.totalAnalyses >= 100 },
];

export async function getMagistralStats(): Promise<MagistralStats> {
  const data = await storage.get(['magistral_stats']);
  const stats = data.magistral_stats || {
    totalAnalyses: 0,
    localAnalyses: 0,
    cloudAnalyses: 0,
    achievements: []
  };

  // Check achievements
  let newAchievements = [...stats.achievements];
  let changed = false;
  ACHIEVEMENTS.forEach(ach => {
    if (!newAchievements.includes(ach.id) && ach.condition(stats)) {
      newAchievements.push(ach.id);
      changed = true;
      // Notify unlock?
    }
  });

  if (changed) {
    const newStats = { ...stats, achievements: newAchievements };
    await storage.set({ magistral_stats: newStats });
    return newStats;
  }

  return stats;
}
