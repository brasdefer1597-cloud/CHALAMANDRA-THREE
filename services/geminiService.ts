
import { GoogleGenAI } from "@google/genai";
import { DialecticResult, MagistralStats } from "../types";
import { runThesis } from "./hegel/chola";
import { runAntithesis } from "./hegel/malandra";
import { runSynthesis } from "./hegel/fresa";
import { getMagistralStats, checkAchievements } from "./achievementService";

// Configuración de modelos de última generación
const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';

/**
 * Utilidad para reintentos con backoff exponencial
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Telemetría de protocolos para observabilidad interna
 */
const logTelemetry = (action: string, details: any) => {
  const timestamp = new Date().toISOString();
  console.log(`%c[PROTOCOL] ${timestamp} | ${action}`, "color: #E6C275; font-weight: bold", details);
};

/**
 * Actualiza las estadísticas magistrales en el almacenamiento local
 */
async function updateMagistralStats(source: 'LOCAL' | 'CLOUD' | 'HYBRID') {
  const chromeEnv = (window as any).chrome;
  if (!chromeEnv || !chromeEnv.storage) return;

  const currentStats = await getMagistralStats();
  const newStats: MagistralStats = {
    ...currentStats,
    totalAnalyses: currentStats.totalAnalyses + 1,
    localAnalyses: source === 'LOCAL' || source === 'HYBRID' ? currentStats.localAnalyses + 1 : currentStats.localAnalyses,
    cloudAnalyses: source === 'CLOUD' || source === 'HYBRID' ? currentStats.cloudAnalyses + 1 : currentStats.cloudAnalyses,
  };

  await chromeEnv.storage.local.set({ magistral_stats: newStats });
  await checkAchievements(newStats);
}

/**
 * Llamador de IA en la nube con resiliencia y configuración de pensamiento
 */
export async function callCloudGemini(
  prompt: string, 
  config: any = {}, 
  retries = 3
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let lastError: any;

  const model = config.responseSchema ? PRO_MODEL : FLASH_MODEL;

  for (let i = 0; i < retries; i++) {
    const start = performance.now();
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          ...config,
          thinkingConfig: { thinkingBudget: model === PRO_MODEL ? 16384 : 8192 }
        },
      });
      
      const text = response.text;
      if (!text) throw new Error("UPSTREAM_API_EMPTY_RESPONSE");
      
      logTelemetry('CLOUD_SUCCESS', { 
        attempt: i + 1, 
        latency: `${Math.round(performance.now() - start)}ms`,
        model: model 
      });
      return text;
    } catch (error: any) {
      lastError = error;
      logTelemetry('CLOUD_RETRY', { attempt: i + 1, error: error.message });
      if (i < retries - 1) {
        await wait(Math.pow(2, i) * 1000); 
      }
    }
  }
  logTelemetry('CLOUD_FATAL', { error: lastError.message });
  throw lastError;
}

/**
 * Puente para IA Local (Gemini Nano) mediante Chrome Built-in AI
 * Ideal para tareas complejas rápidas que requieren privacidad.
 */
export async function callLocalGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const aiInterface = typeof window !== 'undefined' ? (window as any).ai : null;

  if (aiInterface && aiInterface.languageModel) {
    try {
      const capabilities = await aiInterface.languageModel.capabilities();
      if (capabilities.available !== 'no') {
        const session = await aiInterface.languageModel.create({
          systemPrompt: systemInstruction,
          temperature: 0.4, // Más determinista para tareas rápidas
        });
        const result = await session.prompt(prompt);
        logTelemetry('LOCAL_SUCCESS', { model: 'gemini-nano' });
        return result.trim();
      }
    } catch (e: any) {
      logTelemetry('LOCAL_BYPASS', { reason: e.message });
    }
  }
  throw new Error("LOCAL_ENGINE_UNAVAILABLE");
}

/**
 * Orquestador Dialéctico Resiliente
 * Implementa la arquitectura Local-First (Quick Complex) con Fallback a Cloud (Detailed).
 */
export async function runDialecticAnalysis(
  input: string,
  onStepChange: (step: string, source: 'CLOUD' | 'LOCAL') => void
): Promise<DialecticResult> {
  let finalSource: 'CLOUD' | 'LOCAL' | 'HYBRID' = 'CLOUD';
  const workflowStart = performance.now();
  
  try {
    // 1. TESIS (CHOLA) - PRIORIDAD LOCAL (Rápida y Privada)
    // El núcleo Nano es perfecto para este análisis de patrones inicial.
    let thesis: string;
    try {
      onStepChange('CHOLA', 'LOCAL');
      thesis = await runThesis(true, input);
      finalSource = 'LOCAL';
    } catch {
      // Fallback a la nube si Nano no está disponible o falla
      onStepChange('CHOLA', 'CLOUD');
      thesis = await runThesis(false, input);
      finalSource = 'CLOUD';
    }

    // 2. ANTÍTESIS (MALANDRA) - ANÁLISIS DETALLADO (Cloud)
    // Requiere mayor profundidad crítica y acceso a razonamiento avanzado.
    onStepChange('MALANDRA', 'CLOUD');
    const antithesis = await runAntithesis(input, thesis);

    // 3. SÍNTESIS (FRESA) - FUSIÓN ESTRATÉGICA (Cloud)
    // Requiere el motor Pro para garantizar una síntesis elegante y estructurada (JSON).
    onStepChange('FRESA', 'CLOUD');
    const synthesisData = await runSynthesis(thesis, antithesis);
    
    const resultSource = finalSource === 'LOCAL' ? 'HYBRID' : 'CLOUD';
    
    // Registrar estadísticas para el sistema de hitos
    await updateMagistralStats(resultSource);

    logTelemetry('WORKFLOW_COMPLETE', { 
      totalLatency: `${Math.round(performance.now() - workflowStart)}ms`,
      source: resultSource 
    });

    return {
      thesis,
      antithesis,
      synthesis: synthesisData.text,
      level: synthesisData.level || 3,
      alignment: synthesisData.alignment || 90,
      timestamp: new Date().toISOString(),
      source: resultSource
    };
  } catch (error: any) {
    logTelemetry('WORKFLOW_ABORTED', { error: error.message });
    throw error;
  }
}
