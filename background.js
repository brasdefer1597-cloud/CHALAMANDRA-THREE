
/**
 * CHALAMANDRA - Background Service Worker
 * Protocolo de inicialización y gestión de contexto robusto.
 */

chrome.runtime.onInstalled.addListener(() => {
  // Crear menú contextual para análisis rápido
  chrome.contextMenus.create({
    id: "analizar-chalamandra",
    title: "Analizar con Chalamandra",
    contexts: ["selection"]
  });

  // Protocolo de Onboarding
  chrome.tabs.create({ url: "welcome.html" });
});

// Manejador de clics en el menú contextual
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analizar-chalamandra") {
    // Almacenamiento atómico para evitar race conditions con el Side Panel
    chrome.storage.local.set({ contextualInput: info.selectionText }, () => {
      // Abrir el panel lateral tras asegurar la persistencia del dato
      if (chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ tabId: tab.id });
      }
    });
  }
});
