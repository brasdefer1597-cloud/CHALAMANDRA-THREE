// api/analyze.js
// Vercel Serverless Function to act as a proxy for Google Gemini API
// ARCHITECTURE: Edge Runtime with Streaming & Caching
// Protects the GEMINI_API_KEY from being exposed in client-side environments.

export const config = {
    runtime: 'edge',
};

// Using gemini-3-flash-preview for high efficiency in proxy calls
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent";
const MAX_INPUT_SIZE = 30000;
const ALLOWED_ORIGIN_PREFIX = "chrome-extension://"; 

// Simple in-memory cache (Simulates Vercel KV)
// In production: import { kv } from '@vercel/kv';
const CACHE = new Map();

export default async function handler(req) {
    // 1. CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders });
    }

    let body;
    try {
        body = await req.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
    }

    const { prompt, systemInstruction, generationConfig } = body;

    // Cache Logic
    const cacheKey = JSON.stringify({ prompt, systemInstruction }); // Simple key
    if (CACHE.has(cacheKey)) {
        // Return cached plain text result instantly
        // Since the client handles parsing, we can wrap it in a mock stream format
        // OR just return a JSON object?
        // The client expects a RAW GEMINI STREAM format (JSON chunks).
        // It's hard to mock that.
        // However, if we return a simple JSON response like `{ "text": "..." }`,
        // and our client parses it, we are good?
        // Client parser looks for `"text": "..."`.
        // So we can return a JSON with the cached text.
        const cachedText = CACHE.get(cacheKey);
        // Emulate a Gemini chunk
        const mockChunk = JSON.stringify({ candidates: [{ content: { parts: [{ text: cachedText }] } }] });
        return new Response(mockChunk, {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: corsHeaders });
    }

    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                ...generationConfig
            },
        };

        if (systemInstruction) {
            payload.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        const url = `${GEMINI_API_URL}?key=${apiKey}`;

        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Upstream API Error: ${geminiResponse.status} - ${errorText}`);
        }

        // Streaming with Cache Population (Tee the stream)
        const [clientStream, cacheStream] = geminiResponse.body.tee();

        // Process cache in background without blocking response
        (async () => {
            try {
                const reader = cacheStream.getReader();
                const decoder = new TextDecoder();
                let fullText = "";
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                }
                // Parse full buffer to extract text for cache
                const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
                let match;
                while ((match = regex.exec(buffer)) !== null) {
                    try { fullText += JSON.parse(`"${match[1]}"`); } catch (e) {}
                }

                if (fullText) {
                    // Limit cache size
                    if (CACHE.size > 100) CACHE.clear();
                    CACHE.set(cacheKey, fullText);
                }
            } catch (e) {
                console.error("Cache Write Error", e);
            }
        })();

        // Return the raw stream to client
        return new Response(clientStream, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
}
