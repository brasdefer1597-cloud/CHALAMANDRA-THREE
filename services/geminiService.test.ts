
import { parseChunk } from './geminiService';

describe('Gemini Streaming Parser', () => {
  test('debe extraer texto de un chunk JSON válido', () => {
    const input = '... [{"candidates": [{"content": {"parts": [{"text": "Hola"}]}}]}] ...';
    const result = parseChunk(input, 0);
    expect(result.text).toBe('Hola');
    expect(result.foundNewText).toBe(true);
  });

  test('debe manejar chunks con múltiples tokens', () => {
    const input = '... "text": "Hola" ... "text": " Mundo" ...';
    const result = parseChunk(input, 0);
    expect(result.text).toBe('Hola Mundo');
  });

  test('debe manejar caracteres escapados correctamente', () => {
    const input = '... "text": "Línea 1\\nLínea 2" ...';
    const result = parseChunk(input, 0);
    expect(result.text).toBe('Línea 1\nLínea 2');
  });

  test('debe respetar el processedIndex para no re-leer', () => {
    const input = '... "text": "Hola" ... "text": "Mundo"';
    // Simular que ya leímos "Hola"
    // El índice debería estar después de la primera coincidencia.
    // Manualmente calculamos un índice simulado.
    const firstMatchEnd = input.indexOf('Hola"') + 5;

    const result = parseChunk(input, firstMatchEnd);
    expect(result.text).toBe('Mundo');
  });
});
