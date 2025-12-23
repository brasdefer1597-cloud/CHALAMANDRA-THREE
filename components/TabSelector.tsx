import React from 'react';

interface TabSelectorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'DIALECTIC', label: 'Dialéctica' },
    { id: 'VISION', label: 'Visión' },
    { id: 'AUDIO', label: 'Audio' }
  ];

  return (
    <header id="tab-selector" className="flex justify-around p-2 border-b border-[#333]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn font-syncopate bg-transparent border-none text-[14px] cursor-pointer px-4 py-2 transition-colors duration-200 border-b-2 ${
            activeTab === tab.id
              ? 'text-accent-cyan border-accent-cyan'
              : 'text-[#b3b3b3] border-transparent hover:text-accent-cyan'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </header>
  );
};

export default TabSelector;
