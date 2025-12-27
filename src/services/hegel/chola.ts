
import { callCloudGemini, callLocalGemini } from "../geminiService";

export async function runThesis(tryLocal: boolean, input: string): Promise<string> {
  const prompt = `Analiza este texto: "${input}" y dime cuáles son los patrones establecidos, qué ha funcionado antes y cuál es la perspectiva histórica o tradicional. Sé concisa y directa.`;
  const systemInstruction = "Eres CHOLA, experta en patrones históricos y sabiduría establecida. Tu tono es tradicional y analítico. Representas la TESIS.";

  if (tryLocal) {
    try {
      return await callLocalGemini(prompt, systemInstruction);
    } catch {
      // Fall through to cloud
    }
  }

  // Fix: Extract text from the result object returned by callCloudGemini
  const result = await callCloudGemini(prompt, {
    systemInstruction,
    temperature: 0.5,
  });
  return result.text;
}
