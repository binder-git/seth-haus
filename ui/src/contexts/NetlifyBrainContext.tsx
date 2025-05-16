import React, { createContext, useContext, ReactNode } from 'react';
import { netlifyBrain } from '@/brain/NetlifyBrain';

const NetlifyBrainContext = createContext<typeof netlifyBrain | null>(null);

export const NetlifyBrainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <NetlifyBrainContext.Provider value={netlifyBrain}>
      {children}
    </NetlifyBrainContext.Provider>
  );
};

export const useNetlifyBrain = () => {
  const context = useContext(NetlifyBrainContext);
  if (!context) {
    throw new Error('useNetlifyBrain must be used within a NetlifyBrainProvider');
  }
  return context;
};
