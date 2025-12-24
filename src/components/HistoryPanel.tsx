
import React from 'react';
import { AnalysisHistoryItem } from '../types';

interface HistoryPanelProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-syncopate font-bold text-gray-400 tracking-wider">REGISTRO DE OPERACIONES</h2>
        <button 
          onClick={onClear}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors uppercase font-bold tracking-widest"
        >
          Limpiar Bitácora
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group overflow-hidden"
          >
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <p className="text-sm font-medium text-gray-300 line-clamp-2">
              {item.originalPrompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
