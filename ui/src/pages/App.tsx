import React from "react";
import { useMarketStore } from "utils/market-store";
import { Market } from '@/types';
import { CommerceLayerProvider } from "@/contexts/CommerceLayerContext";
import { Outlet } from "react-router-dom";

// Create a type for the context
export type AppContextType = {
  selectedMarket: Market;
};

export default function App() {
  // Use the global market store
  const { market } = useMarketStore();

  // Ensure market is always defined
  const selectedMarket = market || {
    name: 'UK',
    region: 'uk',
    id: 'uk-market',
    countryCode: 'GB',
    currencyCode: 'GBP'
  };

  // Pass the selectedMarket to all child routes
  return (
    <CommerceLayerProvider>
      <Outlet context={{ selectedMarket }} />
    </CommerceLayerProvider>
  );
}
