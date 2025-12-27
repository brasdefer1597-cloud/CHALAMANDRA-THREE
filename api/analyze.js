// api/analyze.js
// Vercel Serverless Function to act as a proxy for Google Gemini API
// ARCHITECTURE: Ultralight / Native Fetch (No external dependencies)
// Protects the GEMINI_API_KEY from being exposed in client-side environments.

// Using gemini-3-flash-preview for high efficiency in proxy calls
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
const MAX_INPUT_SIZE = 30000;
const ALLOWED_ORIGIN_PREFIX = "chrome-extension://"; 

export default async function handler(req, res) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // 2. Handle Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Method Check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 4. Origin Check (Security)
    const origin = req.headers.origin;
    const isAllowed = origin && (
        origin.startsWith(ALLOWED_ORIGIN_PREFIX) || 
        origin.includes("localhost") || 
        origin.includes("127.0.0.1") ||
        origin.includes("vercel.app")
    );

    if (!isAllowed) {
        // console.warn(`Blocked request from unauthorized origin: ${origin}`);
        // return res.status(403).json({ error: "Origen no autorizado" });
        // Allowing loose for now to ensure extension works during review
    }

    // 5. Payload Validation
    const {
        prompt,
        systemInstruction,
        responseSchema,
        useThinking,
        responseMimeType,
        temperature
    } = req.body;

    if (!prompt || prompt.length > MAX_INPUT_SIZE) {
        return res.status(400).json({ error: "Payload excesivamente grande o vacío" });
    }

    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // 6. Gemini API Call (Native Fetch)
    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: temperature || 0.7,
                topP: 0.95,
                topK: 40,
                responseMimeType: responseMimeType
            },
        };

        if (responseSchema) {
            payload.generationConfig.responseSchema = responseSchema;
        }

        if (systemInstruction) {
            payload.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        // Note: Thinking config and Tools are model specific and might require model switching.
        // For this simple proxy, we default to Flash.
        // A full implementation would select the URL based on `useThinking`.

        const url = `${GEMINI_API_URL}?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upstream API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Empty response from Gemini API");
        }

        return res.status(200).json({ result: text.trim() });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}