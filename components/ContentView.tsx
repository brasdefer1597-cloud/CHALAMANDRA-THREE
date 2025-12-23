import React from 'react';

interface ContentViewProps {
  children: React.ReactNode;
}

const ContentView: React.FC<ContentViewProps> = ({ children }) => {
  return (
    <main id="content-view" className="flex-grow overflow-y-auto p-4">
      {children}
    </main>
  );
};

export default ContentView;
