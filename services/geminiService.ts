
import { GoogleGenAI } from "@google/genai";

const MODELS = {
  PRO: 'gemini-3-pro-preview',
  FLASH: 'gemini-3-flash-preview',
  LITE: 'gemini-flash-lite-latest',
  IMAGE: 'gemini-2.5-flash-image',
  VIDEO: 'veo-3.1-fast-generate-preview',
  AUDIO_LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025',
  MAPS: 'gemini-2.5-flash'
};

/**
 * Orquestador Multimodal Chalamandra
 */
export async function callCloudGemini(prompt: string, options: any = {}) {
  // REFACTOR: Usar Proxy Backend via Background Service Worker
  // Se elimina el uso directo de GoogleGenAI y process.env.API_KEY en el cliente
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: "ANALYZE_PROXY",
      prompt: prompt,
      systemInstruction: options.systemInstruction
    }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (response && response.error) {
        return reject(new Error(response.error));
      }

      // Estructura de respuesta compatible con la UI existente
      // El backend devuelve { result: string }
      if (response && response.result) {
        resolve({ text: response.result, sources: [] });
      } else {
        reject(new Error("Respuesta vacía del backend"));
      }
    });
  });
}

export async function callLocalGemini(prompt: string, systemInstruction?: string) {
  // @ts-ignore - Flag experimental window.ai
  if (typeof window !== 'undefined' && (window as any).ai?.languageModel) {
    const session = await (window as any).ai.languageModel.create({ systemPrompt: systemInstruction });
    const result = await session.prompt(prompt);
    session.destroy();
    return result;
  }

  // Fallback a Flash Lite si no hay Nano local
  // NOTA: Para este fallback, si también queremos evitar la key expuesta, deberíamos usar el proxy.
  // Por ahora mantenemos la lógica existente para 'Local' pero si no hay API Key fallará.
  // Asumimos que el usuario podría tener la key configurada localmente para dev,
  // pero lo ideal es migrar todo al proxy. Para el scope de 'Live Backend', Cloud es la prioridad.
  // Si process.env.API_KEY no existe (prod), esto fallará, lo cual es correcto.
  if (process.env.API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODELS.LITE,
      contents: prompt,
      config: { systemInstruction }
    });
    return response.text || "";
  } else {
     // Si no hay key local, intentamos usar el proxy también como fallback
     return callCloudGemini(prompt, { systemInstruction }).then(res => res.text as string);
  }
}

export async function generateEliteImage(prompt: string, aspectRatio: string = "1:1") {
  // TODO: Implementar endpoint de imagen en el proxy si es necesario.
  // Por ahora requiere key local.
  if (!process.env.API_KEY) throw new Error("API Key no configurada para generación de imágenes.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
}
