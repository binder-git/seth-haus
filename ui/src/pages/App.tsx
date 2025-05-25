import React from "react";
import { useMarketStore } from "@/utils/market-store";
import { Market } from '@/types';
import { Outlet, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  // Use the global market store - it already has a default value
  const { market } = useMarketStore();

  // Update Commerce Layer configuration when market changes
  React.useEffect(() => {
    // Use the full scope format FIRST, then fallback to ID
    const marketScope = market.scope || market.id || "market:id:vjzmJhvEDo";

    console.log('[App] Original market object:', market);
    console.log('[App] Market scope being used:', marketScope);
    console.log('[App] Market scope character check:', {
      length: marketScope.length,
      includes_market_prefix: marketScope.startsWith('market:id:'),
      actual_chars: marketScope.split('')
    });
    
    // Enhanced Commerce Layer v2 configuration with proper authentication
    (window as any).commercelayerConfig = {
      clientId: "3uRXduKWJ8qr4G7lUBdrC1GFormL5Qa-RbFy-eCIGtA",
      scope: marketScope, // Now uses full scope format
      domain: "commercelayer.io",
      defaultAttributes: {
        orders: {
          return_url: window.location.origin
        }
      }
    };
  
    console.log('[App] Commerce Layer config updated for market:', market.name, 'scope:', marketScope);
  }, [market]); // Re-run when market changes

  // Log route changes
  React.useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);

  return <Outlet context={{ selectedMarket: market }} />;
}
