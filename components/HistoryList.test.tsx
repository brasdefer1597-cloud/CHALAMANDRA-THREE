
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryList from './HistoryList';
import { DialecticResult } from '../types';

// Mock data generator
const generateHistory = (count: number): DialecticResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    thesis: `Thesis ${i}`,
    antithesis: `Antithesis ${i}`,
    synthesis: `Synthesis ${i}`,
    level: 1,
    alignment: 50,
    timestamp: new Date().toISOString(),
    source: 'HYBRID'
  }));
};

describe('HistoryList Component (Virtualization)', () => {
  test('debe mostrar mensaje vacío si no hay historial', () => {
    render(<HistoryList history={[]} />);
    expect(screen.getByText(/NO ARCHIVES FOUND/i)).toBeInTheDocument();
  });

  test('debe renderizar solo un subconjunto de elementos (Virtualización)', () => {
    const history = generateHistory(100);
    render(<HistoryList history={history} />);

    // El componente está configurado para mostrar aprox 5 elementos visibles + buffer
    // Verificamos que NO estén todos en el DOM

    expect(screen.getByText(/Thesis 0/)).toBeInTheDocument();
    expect(screen.queryByText(/Thesis 90/)).not.toBeInTheDocument(); // Debería estar fuera del viewport
  });

  // Nota: Probar el scroll real en JSDOM es difícil porque no calcula layout real,
  // pero podemos verificar la lógica inicial de renderizado virtual.
});
