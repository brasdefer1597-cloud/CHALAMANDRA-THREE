
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Pass response config from options to the Gemini API generation config
  const response = await ai.models.generateContent({
    model: options.useThinking ? MODELS.PRO : MODELS.FLASH,
    contents: prompt,
    config: {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature || 0.7,
      thinkingConfig: options.useThinking ? { thinkingBudget: 32768 } : undefined,
      tools: options.useSearch ? [{ googleSearch: {} }] : undefined,
      responseMimeType: options.responseMimeType,
      responseSchema: options.responseSchema
    },
  });
  
  // Extraer links si hubo búsqueda
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text: response.text || "", sources };
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.LITE,
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text || "";
}

export async function generateEliteImage(prompt: string, aspectRatio: string = "1:1") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
}
