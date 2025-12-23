import React, { useRef } from 'react';

interface QuickActionProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({ input, setInput, onSubmit, loading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <footer id="quick-action-bar" className="flex p-2 border-t border-[#333] bg-[#121212]">
      <textarea
        id="quick-prompt"
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Análisis rápido..."
        className="flex-grow bg-[#222] border border-[#444] text-white rounded p-2 h-10 resize-none font-main focus:outline-none focus:border-accent-cyan"
        disabled={loading}
      />
      <button
        id="send-btn"
        onClick={onSubmit}
        disabled={loading}
        className="bg-transparent border-none text-accent-cyan text-2xl cursor-pointer px-4 disabled:opacity-50"
      >
        ➔
      </button>
    </footer>
  );
};

export default QuickAction;
