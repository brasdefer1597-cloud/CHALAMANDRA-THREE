// api/analyze.js
// Vercel Serverless Function to act as a proxy for Google Gemini API
// ARCHITECTURE: Ultralight / Native Fetch (No external dependencies)
// Protects the GEMINI_API_KEY from being exposed in client-side environments.

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_INPUT_SIZE = 30000;
const ALLOWED_ORIGIN_PREFIX = "chrome-extension://"; 
const EXPECTED_AUTH_TOKEN = "chalamandra-elite-protocol-token-v1"; // Match with client side

// Simple In-Memory Rate Limiter (Note: Per instance, resets on cold boot)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 20;
const rateLimitMap = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - record.startTime > RATE_LIMIT_WINDOW) {
        // Reset window
        record.count = 1;
        record.startTime = now;
        rateLimitMap.set(ip, record);
        return false;
    }

    if (record.count >= MAX_REQUESTS_PER_MINUTE) {
        return true;
    }

    record.count++;
    rateLimitMap.set(ip, record);
    return false;
}

export default async function handler(req, res) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
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

    // 4. Authentication (Extension Token)
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${EXPECTED_AUTH_TOKEN}`) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    }

    // 5. Rate Limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: "Too Many Requests" });
    }

    // 6. Payload Validation
    const {
        prompt,
        systemInstruction,
        model = "gemini-3-flash-preview",
        temperature = 0.7,
        thinkingConfig,
        tools,
        responseSchema,
        responseMimeType
    } = req.body;

    if (!prompt || prompt.length > MAX_INPUT_SIZE) {
        return res.status(400).json({ error: "Payload excesivamente grande o vacío" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        console.error("Missing GEMINI_API_KEY environment variable");
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // 7. Construct Gemini API Request
    try {
        const generationConfig = {
            temperature,
            topP: 0.95,
            topK: 40,
        };

        if (responseMimeType) generationConfig.responseMimeType = responseMimeType;
        if (responseSchema) generationConfig.responseSchema = responseSchema;
        if (thinkingConfig) generationConfig.thinkingConfig = thinkingConfig;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
        };

        if (systemInstruction) {
            payload.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        if (tools) {
            payload.tools = tools;
        }

        const url = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${apiKey}`;

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

        // Handle result parsing for simpler clients
        // But also return full structure if needed?
        // For compatibility with previous `analyze.js`, we return `result: text`.
        // However, if we support function calling or complex responses, we might need more.
        // For the current scope (Text generation & JSON), extracting text is usually enough.
        // Note: Thinking models might output thoughts.

        const candidate = result.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        // Concatenate text parts
        const text = parts.map(p => p.text).join('');

        if (!text && !result.candidates) {
             throw new Error("Empty response from Gemini API");
        }

        return res.status(200).json({
            result: text.trim(),
            raw: result // Optional: Include raw response for debugging/advanced usage
        });

    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
