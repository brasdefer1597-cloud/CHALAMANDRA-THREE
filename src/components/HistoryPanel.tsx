
import React from 'react';
import { AnalysisHistoryItem } from '../utils/types';

interface HistoryPanelProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      {history.length === 0 && (
        <p className="text-center text-xs text-gray-500 py-4">No historical data recorded.</p>
      )}
      {history.map((item, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(item)}
          className="card cursor-pointer group"
          style={{ padding: '0.75rem' }}
        >
          <div className="flex justify-between items-start mb-1">
             <span className="text-[10px] font-bold text-gray-400 group-hover:text-accent-cyan transition-all" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
               {item.thesis}
             </span>
             <span className="text-[8px] text-gray-600 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="text-[9px] text-gray-500" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.synthesis}
          </p>
        </div>
      ))}
    </div>
  );
};

export default HistoryPanel;
