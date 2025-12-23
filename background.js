
/**
 * CHALAMANDRA - Background Orchestrator V1.6.2
 */

// --- PROTOCOLO DE INSTALACIÓN Y ONBOARDING ---
chrome.runtime.onInstalled.addListener((details) => {
  // 1. Crear menú contextual para análisis rápido
  chrome.contextMenus.create({
    id: "chalamandra-dialectic",
    title: "Chalamandra: Analizar Texto Seleccionado",
    contexts: ["selection"]
  });

  // 2. Abrir página de bienvenida solo en la primera instalación
  if (details.reason === 'install') {
    chrome.tabs.create({ url: "welcome.html" });
    // Seed default authentication token for the MVP
    chrome.storage.local.set({ userApiKey: "chalamandra-elite-protocol-token-v1" });
  }
});

// --- GESTOR DE MENÚ CONTEXTUAL Y ICONO ---
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: 'index.html',
    enabled: true
  });
  chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "chalamandra-dialectic" && info.selectionText) {
    // Patrón optimizado: Persistir y notificar
    chrome.storage.local.set({ lastContextualInput: info.selectionText }, () => {
      chrome.sidePanel.open({ windowId: tab.windowId }).then(() => {
        chrome.runtime.sendMessage({
          action: "START_DIALECTIC",
          text: info.selectionText
        }).catch(() => {
          // El panel se encargará al montar si no estaba abierto
        });
      });
    });
  }
});

// --- ENRUTADOR CENTRAL DE MENSAJES ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Petición desde el Side Panel para obtener el texto de la página
  if (request.action === "GET_PAGE_TEXT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "EXTRACT_PAGE_CONTENT" }, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: "No se pudo comunicar con la página activa." });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ error: "No hay pestaña activa detectada." });
      }
    });
    return true; // Respuesta asíncrona
  }

  // --- EJECUCIÓN EN VIVO: ONE-SHOT DIALECTIC ---
  if (request.action === "executeAnalysis") {
    const PROXY_URL = "https://chalamandra-backend.vercel.app/api/analyze";

    chrome.storage.local.get(['userApiKey'], async (storage) => {
        if (!storage.userApiKey) {
            sendResponse({ error: "Error de autenticación: Token no configurado." });
            return;
        }

        try {
            // Construir un Prompt Maestro para obtener la estructura JSON completa en una sola llamada
            const masterPrompt = `
                Analiza el siguiente texto usando el protocolo dialéctico (Tesis, Antítesis, Síntesis).
                Texto: "${request.prompt}"

                Instrucciones:
                1. Tesis (CHOLA): Identifica patrones establecidos y sabiduría histórica.
                2. Antítesis (MALANDRA): Critica, encuentra fallos y riesgos.
                3. Síntesis (FRESA): Fusiona ambas en una solución óptima y elegante.

                Responde EXCLUSIVAMENTE en formato JSON válido con esta estructura:
                {
                    "thesis": "string",
                    "antithesis": "string",
                    "synthesis": "string",
                    "level": number (1-5),
                    "alignment": number (0-100)
                }
            `;

            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storage.userApiKey}`
                },
                body: JSON.stringify({
                    prompt: masterPrompt,
                    responseMimeType: "application/json" // Hint para Gemini Flash
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Parsear el resultado (Gemini devuelve texto, que debería ser JSON)
            let parsedResult;
            try {
                // Limpiar posibles bloques markdown ```json ... ```
                let cleanText = data.result.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedResult = JSON.parse(cleanText);
            } catch (e) {
                console.error("Error parsing JSON from Gemini:", data.result);
                // Fallback estructurado si falla el parseo
                parsedResult = {
                    thesis: "Error al estructurar la tesis.",
                    antithesis: "Error al estructurar la antítesis.",
                    synthesis: data.result, // Devolver el texto crudo en síntesis
                    level: 1,
                    alignment: 0
                };
            }

            // Enriquecer con metadatos
            const finalResult = {
                ...parsedResult,
                timestamp: new Date().toISOString(),
                source: "LIVE_BACKEND"
            };

            sendResponse({ result: finalResult });

            // Notificar globalmente por si hay otros oyentes
            chrome.runtime.sendMessage({ action: "ANALYSIS_COMPLETE", result: finalResult }).catch(() => {});

        } catch (error) {
            console.error("Error en la llamada al proxy de Chalamandra:", error);
            sendResponse({ error: `Error de conexión: ${error.message}` });
        }
    });

    return true; // Mantiene el canal de mensaje abierto
  }
});
