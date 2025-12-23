
import { MagistralStats } from '../types';

export const ACHIEVEMENTS = [
  {
    id: 'STREET_OPS_1',
    threshold: 1,
    source: 'LOCAL',
    title: 'Iniciación Táctica',
    message: 'Has completado tu primera operación en calle. Eficiencia local detectada.'
  },
  {
    id: 'STREET_OPS_10',
    threshold: 10,
    source: 'LOCAL',
    title: 'Veterano de Calle',
    message: '10 operaciones en calle completadas. Tu autonomía del núcleo es admirable.'
  },
  {
    id: 'CLOUD_STRATEGIST_5',
    threshold: 5,
    source: 'CLOUD',
    title: 'Estratega de Nube',
    message: '5 análisis profundos completados. La potencia de Malandra fluye con éxito.'
  },
  {
    id: 'DIALECTIC_MASTER_20',
    threshold: 20,
    source: 'TOTAL',
    title: 'Maestro Dialéctico',
    message: '20 síntesis totales alcanzadas. El equilibrio Hegeliano es ahora parte de ti.'
  }
];

export async function checkAchievements(stats: MagistralStats) {
  const chromeEnv = (window as any).chrome;
  // Deep check for notification API
  if (!chromeEnv?.runtime || !chromeEnv?.notifications) return;

  const newAchievements: string[] = [...stats.achievements];
  let hasNew = false;

  for (const achievement of ACHIEVEMENTS) {
    if (newAchievements.includes(achievement.id)) continue;

    let reached = false;
    if (achievement.source === 'LOCAL' && stats.localAnalyses >= achievement.threshold) reached = true;
    if (achievement.source === 'CLOUD' && stats.cloudAnalyses >= achievement.threshold) reached = true;
    if (achievement.source === 'TOTAL' && stats.totalAnalyses >= achievement.threshold) reached = true;

    if (reached) {
      newAchievements.push(achievement.id);
      hasNew = true;
      
      chromeEnv.notifications.create(achievement.id, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: `HITO MAGISTRAL: ${achievement.title}`,
        message: achievement.message,
        priority: 2
      });
    }
  }

  if (hasNew && chromeEnv.storage?.local) {
    await chromeEnv.storage.local.set({ magistral_stats: { ...stats, achievements: newAchievements } });
  }
}

export async function getMagistralStats(): Promise<MagistralStats> {
  const chromeEnv = (window as any).chrome;
  if (!chromeEnv?.storage?.local) {
    return { totalAnalyses: 0, localAnalyses: 0, cloudAnalyses: 0, achievements: [] };
  }

  try {
    const data = await chromeEnv.storage.local.get(['magistral_stats']);
    return data.magistral_stats || { totalAnalyses: 0, localAnalyses: 0, cloudAnalyses: 0, achievements: [] };
  } catch (e) {
    console.warn("Could not access chrome storage:", e);
    return { totalAnalyses: 0, localAnalyses: 0, cloudAnalyses: 0, achievements: [] };
  }
}
