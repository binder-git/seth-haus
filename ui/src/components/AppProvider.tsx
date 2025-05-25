import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { toast, Toaster } from "sonner";
import { TooltipProvider } from "@/extensions/shadcn/components/tooltip";
import { SimpleFooter } from './SimpleFooter';
import SimpleHeader from './SimpleHeader';
import { Market } from "@/types";
import { useMarketStore } from "@/utils/market-store";

export interface AppContextProps {
  clientId: string | null;
  baseUrl: string | null;
  organization: string | null;
  marketIdMap: Record<string, string> | null; 
  configReady: boolean;
  clReady: boolean;
  currentMarketId: string | null;
  market: Market;
  error: string | null;
  accessToken: string | null;
  v2ConfigReady: boolean;
}

interface AppProviderProps {
  children: React.ReactNode;
}

const AppContext = createContext<AppContextProps | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: AppProviderProps): React.ReactElement => {
  const [clReady, setClReady] = useState(false);
  const [currentMarketId, setCurrentMarketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [v2ConfigReady, setV2ConfigReady] = useState(false);

  const { market } = useMarketStore();

  // Default values since we're removing the config
  const clientId = null;
  const organization = null;
  const baseUrl = null;
  const marketIdMap = null;
  const configReady = true; // Assume config is ready since we're not using it anymore

  // Check for Commerce Layer configuration readiness
  useEffect(() => {
    const checkCommerceLayerConfig = () => {
      if ((window as any).commercelayerConfig) {
        console.log('[AppProvider] Commerce Layer config found:', (window as any).commercelayerConfig);
        setClReady(true);
        setV2ConfigReady(true);
      } else {
        console.log('[AppProvider] Commerce Layer config not ready, retrying...');
        setTimeout(checkCommerceLayerConfig, 100);
      }
    };

    console.log('[AppProvider] Starting Commerce Layer config check...');
    checkCommerceLayerConfig();
  }, []);

  const value = useMemo<AppContextProps>(() => ({
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clReady,
    currentMarketId,
    market,
    error,
    accessToken,
    organization,
    v2ConfigReady,
  }), [
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clReady,
    currentMarketId,
    market,
    error,
    accessToken,
    organization,
    v2ConfigReady,
  ]);

  return (
    <AppContext.Provider value={value}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          {/* SimpleHeader now uses global market store - no props needed */}
          <SimpleHeader />
          <main className="flex-grow">{children}</main>
          <SimpleFooter />
          <Toaster position="top-center" />
        </div>
      </TooltipProvider>
    </AppContext.Provider>
  );
};
