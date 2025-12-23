
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { DialecticResult } from "../types";

const MODELS = {
  DEEP_THINK: 'gemini-3-pro-preview',
  FAST_TEXT: 'gemini-3-flash-preview',
  LITE: 'gemini-flash-lite-latest',
  IMAGE_PRO: 'gemini-3-pro-image-preview',
  IMAGE_EDIT: 'gemini-2.5-flash-image',
  VIDEO: 'veo-3.1-fast-generate-preview',
  AUDIO_LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025',
  // Maps grounding is only supported in Gemini 2.5 series models.
  MAPS: 'gemini-2.5-flash'
};

/**
 * THOUGHT PROTOCOL: Gemini 3 Pro con Thinking Budget máximo.
 */
export async function runDeepThinking(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.DEEP_THINK,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text;
}

/**
 * Generic Cloud Call helper for dialectic analysis steps.
 */
export async function callCloudGemini(prompt: string, options: {
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: any;
}) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.FAST_TEXT,
    contents: prompt,
    config: {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature,
      responseMimeType: options.responseMimeType as any,
      responseSchema: options.responseSchema,
    }
  });
  return response.text || "";
}

/**
 * Local Call using window.ai (Gemini Nano) where supported.
 */
export async function callLocalGemini(prompt: string, systemInstruction?: string) {
  // @ts-ignore - window.ai is experimental and may not be typed in all environments
  if (typeof window !== 'undefined' && (window as any).ai?.languageModel) {
    // @ts-ignore
    const session = await (window as any).ai.languageModel.create({
      systemPrompt: systemInstruction
    });
    // @ts-ignore
    const result = await session.prompt(prompt);
    session.destroy();
    return result;
  }
  throw new Error("Local model (Gemini Nano) is not available in this browser environment.");
}

/**
 * VISION PROTOCOL: Imagen Pro con Aspect Ratio variable.
 */
export async function generateEliteImage(prompt: string, aspectRatio: string = "16:9") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_PRO,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" }
    }
  });
  // Find the image part, do not assume it is the first part.
  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
}

/**
 * EDIT PROTOCOL: Inpainting / Edición con 2.5 Flash Image.
 */
export async function editEliteImage(base64: string, instruction: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_EDIT,
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: 'image/png' } },
        { text: instruction }
      ]
    }
  });
  // Find the image part, do not assume it is the first part.
  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
}

/**
 * VIDEO PROTOCOL: Generación Veo 3.1 Fast.
 */
export async function generateEliteVideo(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: MODELS.VIDEO,
    prompt: prompt,
    config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: aspectRatio }
  });

  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const url = operation.response?.generatedVideos?.[0]?.video?.uri;
  // Always append API key when fetching from the download link as per SDK rules.
  return `${url}&key=${process.env.API_KEY}`;
}

/**
 * EXPLORE PROTOCOL: Maps Grounding con ubicación real.
 */
export async function exploreEliteMaps(query: string) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: MODELS.MAPS,
          contents: query,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
              }
            }
          }
        });
        resolve({
          text: response.text,
          sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        });
      } catch (e) { reject(e); }
    }, (err) => reject(err));
  });
}

/**
 * LIVE PROTOCOL: Audio nativo bidireccional.
 */
export function connectEliteLive(callbacks: {
  onAudio: (data: string) => void,
  onTranscription: (text: string, isUser: boolean) => void
}) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: MODELS.AUDIO_LIVE,
    callbacks: {
      onopen: () => console.debug('Live API: Connection opened'),
      onmessage: async (message: LiveServerMessage) => {
        // Extract the model's audio output from candidates/parts.
        const base64EncodedAudioString =
          message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64EncodedAudioString) callbacks.onAudio(base64EncodedAudioString);
        
        // Handle output and input transcriptions.
        if (message.serverContent?.outputTranscription) {
          callbacks.onTranscription(message.serverContent.outputTranscription.text, false);
        }
        if (message.serverContent?.inputTranscription) {
          callbacks.onTranscription(message.serverContent.inputTranscription.text, true);
        }
      },
      onerror: (e: any) => console.error('Live API: Connection error', e),
      onclose: (e: any) => console.debug('Live API: Connection closed', e),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
    }
  });
}

// Audio Utils (Decoding raw PCM)
// The audio bytes returned by the API is raw PCM data. 
// Standard AudioContext.decodeAudioData is NOT compatible with raw PCM streams.
export async function decodePcm(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  
  const int16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, int16.length, 24000);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 32768.0;
  return buffer;
}
