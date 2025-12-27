
import { storage } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load existing key
  const data = await storage.get(['GEMINI_API_KEY']);
  if (data.GEMINI_API_KEY) {
    apiKeyInput.value = data.GEMINI_API_KEY;
  }

  saveBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      await storage.set({ GEMINI_API_KEY: key });
      status.textContent = 'Configuration Saved.';
      status.style.color = '#00FFFF';
      setTimeout(() => { status.textContent = ''; }, 2000);
    }
  });
});
