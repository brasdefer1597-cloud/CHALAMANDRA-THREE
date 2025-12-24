
import React from 'react';
import { DialecticResult } from '../types';
import DialecticDisplay from './DialecticDisplay';
// A simplified Virtual List implementation (since we cannot add 'react-window' dependency without npm install,
// and the environment might not support it).
// But we can implement a basic "windowing" logic if the list is huge.
// Or just limit the render count as the user suggested ("Solo se renderizan los 10-20 elementos visibles").

interface HistoryListProps {
  history: DialecticResult[];
}

const ROW_HEIGHT = 600; // Estimated height of a card
const VISIBLE_COUNT = 5;

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 1);
  const endIndex = Math.min(history.length, startIndex + VISIBLE_COUNT + 2);

  const visibleItems = history.slice(startIndex, endIndex);
  const paddingTop = startIndex * ROW_HEIGHT;
  const paddingBottom = (history.length - endIndex) * ROW_HEIGHT;

  if (history.length === 0) {
      return <div className="text-center text-gray-500 font-syncopate text-xs tracking-widest py-10">NO ARCHIVES FOUND</div>;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[800px] overflow-y-auto pr-2 custom-scrollbar space-y-8"
      style={{ position: 'relative' }}
    >
        <div style={{ height: paddingTop }} />
        {visibleItems.map((item, index) => (
             <div key={startIndex + index} className="mb-8 border-b border-white/5 pb-8">
                 <div className="flex justify-between items-center mb-4">
                     <span className="text-[9px] font-syncopate text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                     <span className="text-[9px] font-syncopate text-champagne-gold">LVL.{item.level}</span>
                 </div>
                 {/* Reusing DialecticDisplay for history items might be too heavy?
                     Maybe a summary view?
                     The user said "Si muestras un historial de análisis... virtual scrolling".
                     Let's show a summary.
                  */}
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-champagne-gold/30 transition-colors cursor-default">
                     <div className="line-clamp-3 text-sm text-gray-400 font-main italic">
                        "{item.thesis.slice(0, 150)}..."
                     </div>
                     <div className="mt-2 flex gap-2">
                        <span className="text-[8px] bg-black/50 px-2 py-1 rounded text-gray-500 uppercase">Thesis</span>
                        <span className="text-[8px] bg-black/50 px-2 py-1 rounded text-gray-500 uppercase">Antithesis</span>
                        <span className="text-[8px] bg-black/50 px-2 py-1 rounded text-platinum-cyan uppercase">Synthesis</span>
                     </div>
                 </div>
             </div>
        ))}
        <div style={{ height: paddingBottom }} />
    </div>
  );
};

export default HistoryList;
