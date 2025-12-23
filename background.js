
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
});
