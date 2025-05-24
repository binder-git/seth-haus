import React from "react";
import { useMarketStore } from "@/utils/market-store";
import { Market } from '@/types';
import { Outlet, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  // Use the global market store - it already has a default value
  const { market } = useMarketStore();

  // Initialize Commerce Layer Drop-in configuration
  React.useEffect(() => {
    // Initialize Commerce Layer Drop-in configuration
    (window as any).commercelayerConfig = {
      clientId: import.meta.env.VITE_COMMERCE_LAYER_CLIENT_ID,
      organization: import.meta.env.VITE_COMMERCE_LAYER_ORGANIZATION,
      domain: import.meta.env.VITE_COMMERCE_LAYER_DOMAIN || 'commercelayer.io',
      scope: import.meta.env.VITE_COMMERCE_LAYER_UK_SCOPE || 'market:all'
    };

    console.log('[App] Commerce Layer Drop-in config initialized:', {
      clientId: import.meta.env.VITE_COMMERCE_LAYER_CLIENT_ID ? '***' : 'MISSING',
      organization: import.meta.env.VITE_COMMERCE_LAYER_ORGANIZATION || 'MISSING',
      domain: import.meta.env.VITE_COMMERCE_LAYER_DOMAIN || 'commercelayer.io',
      scope: import.meta.env.VITE_COMMERCE_LAYER_UK_SCOPE || 'market:all'
    });
  }, []);

  // Log route changes
  React.useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);

  return <Outlet context={{ selectedMarket: market }} />;
}
