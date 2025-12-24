
import { GoogleGenAI } from "@google/genai";

// Configurable Endpoint
const PROXY_ENDPOINT = "https://chalamandra.vercel.app/api/analyze";

// Exporting parser for testing purposes
export function parseChunk(buffer: string, processedIndex: number): { text: string, newProcessedIndex: number, foundNewText: boolean } {
    let fullText = "";
    const searchBuffer = buffer.slice(processedIndex);
    const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
    let match;
    let lastMatchEnd = 0;
    let foundNewText = false;

    while ((match = regex.exec(searchBuffer)) !== null) {
            try {
                const extracted = JSON.parse(`"${match[1]}"`);
                fullText += extracted;
                foundNewText = true;
                lastMatchEnd = match.index + match[0].length;
            } catch (e) {}
    }

    return {
        text: fullText,
        newProcessedIndex: processedIndex + lastMatchEnd,
        foundNewText
    };
}

export async function callCloudGemini(prompt: string, options: any = {}, onUpdate?: (text: string) => void) {
  try {
    const response = await fetch(PROXY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt,
            systemInstruction: options.systemInstruction,
            generationConfig: {
                temperature: options.temperature,
                responseMimeType: options.responseMimeType,
                responseSchema: options.responseSchema
            }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";
    let processedIndex = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const parsed = parseChunk(buffer, processedIndex);

        if (parsed.foundNewText) {
             fullText += parsed.text; // Accumulate extracted text?
             // Wait, parseChunk returns logic.
             // My previous logic was: fullText += extracted.
             // And parseChunk returns extracted text from CURRENT search buffer.

             if (onUpdate) onUpdate(fullText);
             processedIndex = parsed.newProcessedIndex;
        }
    }

    return { text: fullText, sources: [] };

  } catch (error) {
      console.error("Gemini API Error:", error);
      return { text: "Error de conexión con el núcleo cognitivo.", sources: [] };
  }
}

export async function callLocalGemini(prompt: string, systemInstruction?: string) {
  if (typeof window !== 'undefined' && (window as any).ai?.languageModel) {
    try {
        const session = await (window as any).ai.languageModel.create({ systemPrompt: systemInstruction });
        const result = await session.prompt(prompt);
        session.destroy();
        return result;
    } catch (e) {
        // Fallback
    }
  }
  const res = await callCloudGemini(prompt, { systemInstruction });
  return res.text;
}

export async function generateEliteImage(prompt: string, aspectRatio: string = "1:1") {
  try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio as any } }
      });
      const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (e) {
      console.error("Image Gen Error", e);
      return null;
  }
}
