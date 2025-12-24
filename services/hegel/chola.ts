
import { callCloudGemini, callLocalGemini } from "../geminiService";

export async function runThesis(tryLocal: boolean, input: string, onUpdate?: (text: string) => void): Promise<string> {
  const prompt = `Analiza este texto: "${input}" y dime cuáles son los patrones establecidos, qué ha funcionado antes y cuál es la perspectiva histórica o tradicional. Sé concisa y directa.`;
  const systemInstruction = "Eres CHOLA, experta en patrones históricos y sabiduría establecida. Tu tono es tradicional y analítico. Representas la TESIS.";

  if (tryLocal) {
    try {
      // Local Gemini doesn't support streaming in this API version yet (or we simplify)
      const res = await callLocalGemini(prompt, systemInstruction);
      if (onUpdate) onUpdate(res);
      return res;
    } catch {
      // Fall through
    }
  }

  const result = await callCloudGemini(prompt, {
    systemInstruction,
    temperature: 0.5,
  }, onUpdate);
  return result.text;
}
