// ui/src/utils/commerceLayerConfig.ts
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of our public configuration
export interface CommerceLayerPublicConfig {
  organization?: string;
  domain?: string;
  appTitle?: string;
  // Add any other public config properties exposed by your /config function
}

// Define the context type
interface ConfigContextType {
  config: CommerceLayerPublicConfig | null;
  loading: boolean;
  error: string | null;
}

// Create the context with default values
const ConfigContext = createContext<ConfigContextType>({
  config: null,
  loading: true,
  error: null,
});

// Provider component that will wrap our app
export function CommerceLayerConfigProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfigContextType>({
    config: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/.netlify/functions/config');
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        const data = await response.json();
        setState({
          config: data,
          loading: false,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load configuration';
        console.error("Error fetching config:", message);
        setState({
          config: null,
          loading: false,
          error: message,
        });
      }
    }
    fetchConfig();
  }, []); // Run once on component mount

  return (
    <ConfigContext.Provider value={state}>
      {children}
    </ConfigContext.Provider>
  );
}

// Custom hook to use the config
export function useCommerceLayerConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useCommerceLayerConfig must be used within a CommerceLayerConfigProvider');
  }
  return context;
}
