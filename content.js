
/**
 * CHALAMANDRA - Extractor de Contexto Dialéctico V1.6.2
 */

function extractOptimalText() {
  // Seleccionamos elementos que suelen contener el núcleo semántico
  const selectors = 'p, h1, h2, h3, article, section, blockquote, li';
  const elements = document.querySelectorAll(selectors);
  let content = '';

  elements.forEach(el => {
    // Ignorar elementos ruidosos (nav, footers, sidebars, etc)
    if (el.closest('nav, footer, header, aside, form, .menu, #sidebar, .nav, .footer')) {
      return;
    }
    
    // Solo textos con una longitud mínima para evitar botones o etiquetas
    const text = el.innerText.trim();
    if (text.length > 25) { 
      content += text + '\n\n';
    }
  });

  // Retornar con un límite de seguridad para evitar saturar el prompt
  return content.slice(0, 15000); 
}

// Escuchar peticiones del background service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_PAGE_CONTENT") {
    const pageText = extractOptimalText();
    sendResponse({ text: pageText });
  }
  return true;
});
