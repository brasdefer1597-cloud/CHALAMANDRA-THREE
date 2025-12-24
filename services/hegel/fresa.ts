
import { Type } from "@google/genai";
import { callCloudGemini } from "../geminiService";

export async function runSynthesis(thesis: string, antithesis: string, onUpdate?: (text: string) => void) {
  const prompt = `Tesis de CHOLA: "${thesis}". Antítesis de MALANDRA: "${antithesis}". Fusiona ambas en un camino óptimo y sofisticado.`;
  
  const systemInstruction = "Eres FRESA, experta en síntesis de alto nivel y elegancia conceptual. Resuelve la tensión dialéctica. Responde obligatoriamente en formato JSON.";

  const schema = {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: "La síntesis final refinada." },
      level: { type: Type.NUMBER, description: "Nivel de síntesis alcanzado (1-5)." },
      alignment: { type: Type.NUMBER, description: "Porcentaje de coherencia (0-100)." }
    },
    required: ["text", "level", "alignment"]
  };

  // For Fresa, we request JSON. Streaming JSON is tricky.
  // We will pass onUpdate, but callCloudGemini's simple regex parser might fail on structured JSON strings.
  // However, since we want the "real-time" feel, we might accept seeing the raw JSON being built
  // or we can try to extract the 'text' property if it appears.

  // Strategy: Pass onUpdate. If the model streams `{"text": "Hola..."`, the regex in geminiService
  // looking for `"text": "..."` might catch the partial text if it's not split across chunks too badly.

  const result = await callCloudGemini(prompt, {
    systemInstruction,
    temperature: 0.7,
    responseMimeType: "application/json",
    responseSchema: schema
  }, onUpdate);

  try {
    return JSON.parse(result.text);
  } catch (e) {
    console.error("JSON Parse error in Fresa:", result.text);
    return { text: result.text, level: 3, alignment: 85 };
  }
}
