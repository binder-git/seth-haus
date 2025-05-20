import React, { createContext, useContext, ReactNode } from 'react';
import { Market } from '@/types';

interface CommerceLayerContextType {
  selectedMarket: Market;
}

const CommerceLayerContext = createContext<CommerceLayerContextType | undefined>(undefined);

export const CommerceLayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // This is a placeholder. In a real implementation, you would get the market from a store or props
  const value = {
    selectedMarket: {
      id: 'UK',
      name: 'UK',
      scope: 'market:id:UK',
      skuListId: ''
    } as Market
  };

  return (
    <CommerceLayerContext.Provider value={value}>
      {children}
    </CommerceLayerContext.Provider>
  );
};

export const useCommerceLayer = (): CommerceLayerContextType => {
  const context = useContext(CommerceLayerContext);
  if (context === undefined) {
    throw new Error('useCommerceLayer must be used within a CommerceLayerProvider');
  }
  return context;
};

export default CommerceLayerContext;
