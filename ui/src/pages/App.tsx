import React from "react";
import { useMarketStore } from "@/utils/market-store";
import { Market } from '@/types';
import { CommerceLayerProvider } from "@/contexts/CommerceLayerContext";
import { Outlet, useLocation } from "react-router-dom";
import EnvDebug from "@/components/EnvDebug";
import { CommerceLayerConfigProvider } from "@/utils/commerceLayerConfig";
import CommerceLayerInitializer from "@/components/commerce/CommerceLayerInitializer";

export default function App() {
  const location = useLocation();
  // Use the global market store - it already has a default value
  const { market } = useMarketStore();

  // Log route changes
  React.useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);

  return (
    <CommerceLayerConfigProvider>
      <CommerceLayerProvider>
        <CommerceLayerInitializer>
          {import.meta.env.DEV && (
            <div style={{ marginBottom: '2rem' }}>
              <EnvDebug />
            </div>
          )}
          <Outlet context={{ selectedMarket: market }} />
        </CommerceLayerInitializer>
      </CommerceLayerProvider>
    </CommerceLayerConfigProvider>
  );
}
