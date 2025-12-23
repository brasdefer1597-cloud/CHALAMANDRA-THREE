
/**
 * Extractor de Contexto Dialéctico
 */
function extractOptimalText() {
  const selectors = 'p, h1, h2, h3, blockquote, li';
  const elements = document.querySelectorAll(selectors);
  let content = '';
  
  elements.forEach(el => {
    const text = el.innerText.trim();
    if (text.length > 20 && !el.closest('nav, footer, header, aside')) {
      content += text + '\n\n';
    }
  });

  return content.slice(0, 15000); // Límite de seguridad
}

// Escuchar peticiones del sistema central
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PAGE_TEXT") {
    sendResponse({ text: extractOptimalText() });
  }
  return true;
});
