
/**
 * CHALAMANDRA - Background Orchestrator V1.6.3
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
    chrome.tabs.create({ url: "src/sidepanel/welcome.html" });
  }
});

// --- GESTOR DE MENÚ CONTEXTUAL Y ICONO ---
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: 'src/sidepanel/sidepanel.html',
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
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0] && tabs[0].id) {
        const tabId = tabs[0].id;

        // Función de ayuda para extraer
        const tryExtract = () => {
             chrome.tabs.sendMessage(tabId, { action: "EXTRACT_PAGE_CONTENT" }, (response) => {
                if (chrome.runtime.lastError) {
                  // Si hay error, asumimos que no hay script, inyectamos y reintentamos.
                  // Pero OJO: esto podría ser loop infinito si el script falla por otra razón.
                  // Así que lo hacemos UNA vez.
                  injectAndExtract();
                } else {
                  sendResponse(response);
                }
              });
        };

        const injectAndExtract = async () => {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['src/content/index.js']
                });
                // Reintentar envío de mensaje
                chrome.tabs.sendMessage(tabId, { action: "EXTRACT_PAGE_CONTENT" }, (response) => {
                    if (chrome.runtime.lastError) {
                         sendResponse({ error: "Fallo tras inyección. Página protegida o error de script." });
                    } else {
                         sendResponse(response);
                    }
                });
            } catch (err) {
                console.error("Injection error: ", err);
                sendResponse({ error: "No se pudo inyectar el script en la página." });
            }
        };

        // Estrategia: Intentar comunicar primero. Si falla, inyectar.
        chrome.tabs.sendMessage(tabId, { action: "PING" }, (response) => {
             // Si content script responde al PING (o cualquier mensaje), no inyectamos.
             // Pero content.js actual solo escucha EXTRACT_PAGE_CONTENT.
             // Así que enviamos EXTRACT_PAGE_CONTENT directo.
             chrome.tabs.sendMessage(tabId, { action: "EXTRACT_PAGE_CONTENT" }, (response) => {
                 if (chrome.runtime.lastError) {
                     // Error de conexión -> Script no inyectado (o tab muerta/protegida)
                     injectAndExtract();
                 } else {
                     // Éxito
                     sendResponse(response);
                 }
             });
        });

      } else {
        sendResponse({ error: "No hay pestaña activa detectada." });
      }
    });
    return true; // Respuesta asíncrona
  }
});
