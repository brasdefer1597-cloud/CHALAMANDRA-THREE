
/**
 * CHALAMANDRA - Background Orchestrator V2.0 (Live)
 */

const PROXY_URL = "https://chalamandra.vercel.app/api/analyze"; // Placeholder for production URL

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

  // --- NUEVO: Lógica de Proxy Fetch para la IA ---
  if (request.action === "ANALYZE_PROXY") {
    handleProxyAnalysis(request).then(sendResponse);
    return true; // Importante: mantener el canal abierto para la respuesta asíncrona
  }
});

/**
 * Maneja la comunicación segura con el Backend Vercel
 */
async function handleProxyAnalysis(request) {
  try {
    const { prompt, systemInstruction } = request;

    // Recuperar User API Key si fuera necesaria (aunque el proxy tiene su propia key)
    // En este diseño, el proxy gestiona la key de Google, pero podríamos enviar un token de usuario si fuera necesario.
    // Memoria dice: extension authenticates using a `userApiKey` token stored in `chrome.storage.local`.
    // Vamos a leerlo para enviarlo como header si el proxy lo requiere, o validación futura.
    const storage = await chrome.storage.local.get(['userApiKey']);
    const userApiKey = storage.userApiKey;

    // TODO: Validar userApiKey si el backend lo requiere.

    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${userApiKey}` // Futura implementación
      },
      body: JSON.stringify({
        prompt,
        systemInstruction
      })
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    return { result: data.result };

  } catch (error) {
    console.error("Fallo en la conexión al proxy:", error);
    return { error: error.message };
  }
}
