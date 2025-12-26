
import { Type } from "@google/genai";
import { callCloudGemini } from "../geminiService";

function cleanJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1];
  }
  return text;
}

export async function runSynthesis(thesis: string, antithesis: string) {
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

  const result = await callCloudGemini(prompt, {
    systemInstruction,
    temperature: 0.7,
    responseMimeType: "application/json",
    responseSchema: schema
  });

  try {
    const cleanedText = cleanJson(result.text);
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("JSON Parse error in Fresa:", result.text);
    return { text: result.text, level: 3, alignment: 85 };
  }
}
