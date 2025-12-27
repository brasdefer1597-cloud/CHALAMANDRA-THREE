
# CHALAMANDRA: IA Dialéctica Élite

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.6.2-cyan.svg)

Chalamandra es una extensión de Chrome que implementa el **Protocolo Hegel-Trinity Multimodal**, un sistema híbrido (Nano + Pro) diseñado para sintetizar información web mediante un proceso dialéctico (Tesis, Antítesis, Síntesis).

## 📂 Arquitectura de Archivos (Elite File Architecture)

```
CHALAMANDRA_EXTENSION/
│
├── 📜 manifest.json           # EL CEREBRO. Configuración central.
├── 📜 README.md               # Documentación.
├── 📜 LICENSE                 # Licencia MIT.
├── 📜 .gitignore              # Configuración de Git.
│
├── 📂 assets/                 # RECURSOS
│   ├── 📂 icons/              # Iconos (16, 48, 128px)
│   ├── 📂 images/             # Logos y gráficos
│   └── 📂 fonts/              # Syncopate & Inter
│
└── 📂 src/                    # CÓDIGO FUENTE
    │
    ├── 📂 background/         # SERVICE WORKER
    │   └── index.js           # Orquestador de eventos.
    │
    ├── 📂 content/            # CONTENT SCRIPT
    │   └── index.js           # Extractor de contexto DOM.
    │
    ├── 📂 sidepanel/          # INTERFAZ (React + Vite)
    │   ├── sidepanel.html     # Entry point.
    │   ├── sidepanel.css      # Estilos "Obsidian Void".
    │   ├── sidepanel.tsx      # Lógica de montaje React.
    │   ├── App.tsx            # Componente raíz.
    │   ├── 📂 components/     # UI Components (Stats, History, etc).
    │   └── 📂 services/       # Lógica Hegel (Chola, Malandra, Fresa).
    │
    ├── 📂 options/            # CONFIGURACIÓN
    │   ├── options.html       # Página de opciones.
    │   ├── options.css        # Estilos.
    │   └── options.js         # Lógica de guardado de API Key.
    │
    └── 📂 utils/              # UTILIDADES
        ├── storage.js         # Wrapper de chrome.storage.
        ├── types.ts           # Definiciones TypeScript.
        └── constants.tsx      # Constantes globales.
```

## 🚀 Instalación y Configuración

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-repo/chalamandra.git
    cd chalamandra
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crear un archivo `.env` en la raíz (opcional para desarrollo):
    ```env
    GEMINI_API_KEY=tu_api_key_aqui
    ```

4.  **Compilar**:
    ```bash
    npm run build
    ```

5.  **Cargar en Chrome**:
    *   Ir a `chrome://extensions/`
    *   Activar "Modo de desarrollador".
    *   Clic en "Cargar descomprimida".
    *   Seleccionar la carpeta `dist/` generada.

## 🧠 Protocolo Dialéctico

1.  **TESIS (Chola)**: Análisis de patrones y contexto histórico (Gemini Nano/Flash).
2.  **ANTÍTESIS (Malandra)**: Generación de contra-argumentos y disrupción (Gemini Pro).
3.  **SÍNTESIS (Fresa)**: Resolución dialéctica y elevación conceptual (Gemini Pro).

## 🛡️ Seguridad y Privacidad

*   **CSP Estricto**: Solo scripts locales y WASM evaluados de forma segura.
*   **Almacenamiento Local**: La API Key se guarda en `chrome.storage.local` y nunca sale del entorno seguro.
*   **Sanitización**: Todo input/output del LLM es sanitizado antes del renderizado para prevenir XSS.

---
*Magistral Decox Systems // 2025*
