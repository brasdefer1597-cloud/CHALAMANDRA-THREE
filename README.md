# CHALAMANDRA: IA Dialéctica Élite

**Protocolo Hegel-Trinity Multimodal sobre Manifest V3.**

Chalamandra es una extensión de navegador de clase mundial diseñada para transformar el consumo pasivo de información en un proceso activo de pensamiento crítico. Implementa un análisis dialéctico (Tesis, Antítesis, Síntesis) para deconstruir narrativas y aumentar la cognición del usuario.

---

### 🧠 Arquitectura y Flujo de Datos del Sistema

El sistema opera sobre una arquitectura desacoplada y segura, orquestada por un service worker y mediada por un proxy de backend para proteger las credenciales de la API.

```mermaid
graph TD
    subgraph "Navegador del Usuario"
        A[Página Web Activa]
        B(Usuario)
    end

    subgraph "Extensión Chalamandra (Cliente)"
        C(Content Script)
        D(Background Service Worker - Orquestador)
        E(Side Panel - Command Center UI)
    end

    subgraph "Backend Seguro (Vercel/Cloudflare)"
        F[Proxy Endpoint]
    end

    subgraph "Google Cloud"
        G[Gemini API]
    end

    %% Flujos de Interacción
    B -- 1. Selecciona Texto & Clic Derecho --> D
    D -- 2. Abre el Panel y Envía Texto Seleccionado --> E
    
    B -- 3. Abre el Panel Directamente --> D
    D -- 4. Abre el Panel --> E

    E -- 5. Solicita Texto Completo de la Página --> D
    D -- 6. Reenvía Petición de Extracción --> C
    C -- 7. Extrae Texto del DOM y Responde --> D
    D -- 8. Devuelve Texto Extraído --> E

    E -- 9. Inicia Análisis (con texto, imagen, etc.) --> D
    D -- 10. Llama al Endpoint Seguro con el prompt --> F
    F -- 11. Adjunta API Key del Servidor y Llama a la API --> G
    G -- 12. Procesa y Devuelve Resultado --> F
    F -- 13. Devuelve Resultado a la Extensión --> D
    D -- 14. Reenvía Resultado Final --> E
    E -- 15. Muestra Síntesis al Usuario --> B
```

### ✨ Características Principales

*   **Análisis Dialéctico de Texto:** Descompone cualquier texto seleccionado o página completa en Tesis, Antítesis y Síntesis.
*   **Protocolo Multimodal:** Capacidades para analizar imágenes (Visión) y audio (Live API).
*   **Grounding Geográfico:** Integra `geolocation` para análisis contextuales basados en la ubicación del usuario.
*   **Arquitectura Segura:** Las llamadas a la API de Gemini se realizan a través de un proxy de backend para nunca exponer las claves en el lado del cliente.
*   **UI Persistente:** Utiliza la API `sidePanel` de Chrome para un "Command Center" robusto y siempre accesible.

### 🛠️ Tech Stack

*   **Core:** Manifest V3, JavaScript (ESM)
*   **UI:** React (v19), TailwindCSS
*   **Backend:** Proxy sin servidor (Vercel, Cloudflare Workers)
*   **IA:** Google Gemini API (Pro, Nano, Veo)

### 🚀 Instalación para Desarrollo

1.  Clona este repositorio.
2.  Abre Chrome y ve a `chrome://extensions`.
3.  Activa el "Modo de desarrollador".
4.  Haz clic en "Cargar descomprimida" y selecciona la carpeta raíz del proyecto.