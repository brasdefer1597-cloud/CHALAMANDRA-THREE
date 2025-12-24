
import { callCloudGemini } from "../geminiService";

export async function runAntithesis(input: string, thesis: string, onUpdate?: (text: string) => void): Promise<string> {
  const prompt = `Texto original: "${input}". Tesis de CHOLA: "${thesis}". Encuentra los fallos ocultos, riesgos sistémicos y desafía agresivamente las suposiciones tradicionales.`;
  const systemInstruction = "Eres MALANDRA, crítica, disruptiva y pragmática. Tu misión es destruir falsas seguridades. Representas la ANTÍTESIS.";

  const result = await callCloudGemini(prompt, {
    systemInstruction,
    temperature: 0.9,
  }, onUpdate);
  return result.text;
}
