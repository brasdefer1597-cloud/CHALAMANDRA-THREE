
import React from 'react';
import { render, screen } from '@testing-library/react';
import DialecticDisplay from './DialecticDisplay';
import { DialecticResult } from '../types';

const mockResult: DialecticResult = {
  thesis: "Tesis de prueba",
  antithesis: "Antítesis de prueba",
  synthesis: "Síntesis final",
  level: 5,
  alignment: 99,
  timestamp: new Date().toISOString(),
  source: 'HYBRID'
};

describe('DialecticDisplay Component', () => {
  test('debe renderizar las tres secciones principales', () => {
    render(<DialecticDisplay result={mockResult} />);

    expect(screen.getByText("Tesis de prueba")).toBeInTheDocument();
    expect(screen.getByText("Antítesis de prueba")).toBeInTheDocument();
    expect(screen.getByText("Síntesis final")).toBeInTheDocument();
  });

  test('debe mostrar el nivel de sincronización', () => {
    render(<DialecticDisplay result={mockResult} />);
    expect(screen.getByText("99%")).toBeInTheDocument();
  });
});
