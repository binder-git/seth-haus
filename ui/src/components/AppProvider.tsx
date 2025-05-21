import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { toast, Toaster } from "sonner";
import { TooltipProvider } from "@/extensions/shadcn/components/tooltip";
import { SimpleFooter } from './SimpleFooter';
import SimpleHeader from './SimpleHeader';
import { Market } from "@/types";
import { useMarketStore } from "@/utils/market-store";
import { useCommerceLayerConfig } from "@/utils/commerceLayerConfig";

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
  const { config, loading: configLoading, error: configError } = useCommerceLayerConfig();
  const [clReady, setClReady] = useState(false);
  const [currentMarketId, setCurrentMarketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [v2ConfigReady, setV2ConfigReady] = useState(false);

  const { market } = useMarketStore();

  const clientId = config?.clientId || null;
  const organization = config?.organization || null;
  const baseUrl = config ? `https://${config.organization}.${config.domain}/api` : null;

  const marketIdMap = useMemo(() => {
    if (!config?.markets) return null;
    return Object.entries(config.markets).reduce((acc, [key, value]) => {
      acc[key] = value.scope;
      return acc;
    }, {} as Record<string, string>);
  }, [config?.markets]);

  const configReady = !configLoading && !configError && config !== null;

  useEffect(() => {
    if (configReady) {
      setClReady(true);
      if (configError) {
        setError(configError);
      }
    } else if (configError) {
      setError(configError);
    }
  }, [configReady, configError]);

  const setMarketInContext = (newMarket: Market) => {
    if (!marketIdMap) return;
    const marketName = typeof newMarket === 'string' ? newMarket : newMarket.name;
    const newMarketId = marketIdMap[marketName];
    if (!newMarketId) {
      console.error(`[AppProvider] Market ID not found in config for market: ${marketName}`);
      return;
    }
    setCurrentMarketId(newMarketId);
  };

  useEffect(() => {
    if (market && marketIdMap) {
      setMarketInContext(market);
    }
  }, [market, marketIdMap]);

  const value = useMemo<AppContextProps>(() => ({
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clReady,
    currentMarketId,
    market,
    error: error || configError,
    accessToken,
    organization,
    v2ConfigReady,
    setMarket: setMarketInContext,
  }), [
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clReady,
    currentMarketId,
    market,
    error,
    configError,
    accessToken,
    organization,
    v2ConfigReady,
    setMarketInContext,
  ]);

  if (configLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        Loading application configuration...
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center text-red-600">
        Error loading application: {configError}
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <SimpleHeader selectedMarket={market} onMarketChange={setMarketInContext} />
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
