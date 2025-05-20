import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { toast, Toaster } from "sonner";
import { TooltipProvider } from "@/extensions/shadcn/components/tooltip";
import { SimpleFooter } from './SimpleFooter';
import SimpleHeader from './SimpleHeader';
import { CLCoreConfigResponse, TokenResponse, Market } from "@/types";
import { useMarketStore } from "@/utils/market-store";
import { API } from "@/config";

// --- Context Definition ---
export interface AppContextProps {
  clientId: string | null;
  baseUrl: string | null;
  marketIdMap: Record<string, string> | null;
  configReady: boolean;
  clScriptReady: boolean;
  clReady: boolean;
  currentMarketId: string | null;
  market: Market;
  error: string | null;
  accessToken: string | null;
  organization: string | null;
  v2ConfigReady: boolean;
  setMarket: (market: Market) => void;
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
  const [clientId, setClientId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [marketIdMap, setMarketIdMap] = useState<Record<string, string> | null>(null);
  const [configReady, setConfigReady] = useState(false);
  const [clScriptReady, setClScriptReady] = useState(false);
  const [clReady, setClReady] = useState(false);
  const [currentMarketId, setCurrentMarketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [organization, setOrganization] = useState<string | null>(null);
  const [v2ConfigReady, setV2ConfigReady] = useState(false);

  const clScriptRef = useRef<HTMLScriptElement | null>(null);
  const { market } = useMarketStore();

  // Check if we're in development mode
  const isDev = import.meta.env.MODE === 'development';

  // Get core config from environment
  const getCoreConfig = (): CLCoreConfigResponse => {
    return {
      clientId: import.meta.env.COMMERCE_LAYER_CLIENT_ID || '',
      baseUrl: API.baseUrl,
      marketIdMap: {
        EU: import.meta.env.COMMERCE_LAYER_EU_SCOPE || 'market:qjANwhQrJg',
        UK: import.meta.env.COMMERCE_LAYER_UK_SCOPE || 'market:vjzmJhvEDo'
      },
      organization: import.meta.env.COMMERCE_LAYER_ORGANIZATION || ''
    };
  };

  // Initialize Commerce Layer
  const initCommerceLayer = async () => {
    try {
      const coreConfig = getCoreConfig();
      setClientId(coreConfig.clientId);
      setBaseUrl(coreConfig.baseUrl);
      setMarketIdMap(coreConfig.marketIdMap);
      setOrganization(coreConfig.organization);
      setConfigReady(true);
      setClScriptReady(true); // Mark as ready since we're using the other initialization method
      
      if (isDev) {
        console.log('[AppProvider] Using centralized Commerce Layer initialization');
      }
    } catch (error) {
      setError('Failed to initialize Commerce Layer configuration');
      console.error('[AppProvider] Error initializing Commerce Layer configuration:', error);
    }
  };

  // Update market in Commerce Layer
  const setMarket = (newMarket: Market) => {
    if (!marketIdMap) return;
    const marketKey = typeof newMarket === 'string' ? newMarket : newMarket.name;
    const newMarketId = marketIdMap[marketKey];
    if (!newMarketId) {
      console.error(`[AppProvider] Market ID not found for market: ${marketKey}`);
      return;
    }
    setCurrentMarketId(newMarketId);
  };

  // Initialize Commerce Layer when component mounts
  useEffect(() => {
    initCommerceLayer();
  }, []);

  // Update market when it changes in the store
  useEffect(() => {
    if (market && marketIdMap) {
      setMarket(market);
    }
  }, [market, marketIdMap]);

  // Context value
  const value = useMemo<AppContextProps>(() => ({
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clScriptReady,
    clReady,
    currentMarketId,
    market,
    error,
    accessToken,
    organization,
    v2ConfigReady,
    setMarket,
  }), [
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clScriptReady,
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
        <div className="flex flex-col min-h-screen">
          <SimpleHeader selectedMarket={market} onMarketChange={setMarket} />
          <main className="flex-grow">
            {children}
          </main>
          <SimpleFooter />
          <Toaster position="bottom-right" />
        </div>
      </TooltipProvider>
    </AppContext.Provider>
  );
};
