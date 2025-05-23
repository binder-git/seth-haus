import React from "react";
import { useMarketStore } from "@/utils/market-store";
import { Market } from '@/types';
import { Outlet, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  // Use the global market store - it already has a default value
  const { market } = useMarketStore();

  // Log route changes
  React.useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);

  return <Outlet context={{ selectedMarket: market }} />;
}
