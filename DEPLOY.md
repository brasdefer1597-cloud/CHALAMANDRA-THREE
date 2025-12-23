
# 🚀 GUÍA DE DESPLIEGUE FINAL: CHALAMANDRA V1.3.1

## 1. Empaquetado para Chrome Web Store (Correcto)
Para generar un paquete válido para su publicación, siga estos pasos estrictamente:
1. Asegúrese de estar en el directorio raíz de la aplicación (donde reside `manifest.json`).
2. El archivo `.zip` debe contener los archivos en su raíz, **no dentro de una carpeta anidada**.
3. **Comando Recomendado:**
   ```bash
   # Desde la raíz del proyecto
   zip -r chalamandra-release.zip manifest.json index.html index.tsx background.js content.js welcome.html types.ts constants.tsx services/ components/ icons/ metadata.json DEPLOY.md
   ```
4. Este paquete será aceptado instantáneamente por el dashboard de desarrolladores de Chrome.

## 2. Configuración del Backend (Vercel)
1. Despliegue el repositorio actual en Vercel.
2. Configure la Variable de Entorno: `API_KEY` con su clave de Google Gemini.
3. El proxy acepta peticiones desde orígenes `chrome-extension://`.

## 3. Instalación para Desarrollo
1. Vaya a `chrome://extensions/`.
2. Active "Developer Mode".
3. Haga clic en "Load unpacked" y seleccione la carpeta raíz de este proyecto.

---
*CHALAMANDRA PROTOCOL - Magistral Decox Systems 2025*
