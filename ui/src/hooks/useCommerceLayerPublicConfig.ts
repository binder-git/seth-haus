import { useState, useEffect } from 'react';

interface CommerceLayerPublicConfig {
  organization?: string;
  domain?: string;
  appTitle?: string;
  // Add any other public config properties exposed by your /config function
}

export function useCommerceLayerPublicConfig() {
  const [config, setConfig] = useState<CommerceLayerPublicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Fetch from the Netlify Function endpoint
        // Vite's proxy (configured in ui/vite.config.ts) will handle this during dev
        const response = await fetch('/.netlify/functions/config');
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        const data: CommerceLayerPublicConfig = await response.json();
        setConfig(data);
      } catch (err: any) {
        console.error("Error fetching Commerce Layer public config:", err);
        setError(err.message || 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []); // Run once on component mount

  return { config, loading, error };
}
