import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from "react";
import { Outlet } from "react-router-dom"; // Import Outlet for routing
import { Toaster } from "sonner"; // Import Toaster
import { TooltipProvider } from "@/components/ui/tooltip"; // Import TooltipProvider
import SimpleHeader from "components/SimpleHeader"; // Import Header
import { SimpleFooter } from "components/SimpleFooter"; // Import Footer
import brain from "brain";
import { CoreCLConfigResponse, AccessTokenResponse } from "types"; // Import the specific response types
import { API_URL, APP_BASE_PATH, Mode, mode } from "app"; // Import API_URL, APP_BASE_PATH, Mode, and mode
import { useMarketStore } from "../utils/market-store"; // Import market store

import { toast } from "sonner"; // Import toast for feedback

// --- TypeScript Declarations for Commerce Layer Global ---
declare global {
  interface Window {
    commercelayer: {
      config: (config: { clientId: string; baseUrl: string; marketId: string }) => void;
      // Add the init method based on the new understanding
      init: (config: { clientId: string; baseUrl: string; marketId: string }) => void;
    };
    // Define the expected structure of the config object
    commercelayerConfig?: {
      clientId: string;
      baseUrl: string;
      scope: string; // e.g., "market:1234"
      // Add other potential config properties based on CL docs
      countryCode?: string;
      languageCode?: string;
      cartUrl?: string;
      returnUrl?: string;
      privacyUrl?: string;
      termsUrl?: string;
    };
  }
  // Keep the existing JSX declaration for cl-config JUST IN CASE
  // but we won't be rendering it anymore.
  namespace JSX {
    interface IntrinsicElements {
      "cl-config": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "client-id"?: string;
        "base-url"?: string;
        "market-id"?: string;
      };
    }
  }
}
// --- End TypeScript Declarations ---

// --- Commerce Layer API Types (Simplified) ---
type Market = "UK" | "EU"; // Define Market type
type MarketIdMap = Record<Market, string>;

// --- Context Definition ---
interface AppContextProps {
  clientId: string | null;
  baseUrl: string | null;
  marketIdMap: MarketIdMap | null;
  configReady: boolean; // Flag to indicate if core config is loaded
  clScriptReady: boolean; // Flag to indicate if CL drop-in script is loaded
  clReady: boolean; // Flag to indicate if CL has been configured successfully via cl-init
  currentMarketId: string | null; // Derived market ID based on selection
  market: Market; // The currently selected market (UK/EU)
  // NEW: Add v2 config state
  accessToken: string | null;
  organization: string | null;
  v2ConfigReady: boolean; // Flag to indicate if v2 token/org/endpoint are fetched
  error: string | null; // Add error state
  // REMOVED: cartUpdatedAt state - no longer needed
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// --- Helper function to check if running in development ---
const isDevelopment = () => {
  // Basic check, adjust if your env variable is different
  return import.meta.env.MODE === "development"; 
};

// --- Provider Component ---
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // State and effects for fetching config, handling market, cart, etc.
  // ... (Keep all the existing state and useEffect hooks here) ...
  const [clientId, setClientId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [marketIdMap, setMarketIdMap] = useState<MarketIdMap | null>(null);
  const [configReady, setConfigReady] = useState(false); // Initially false
  const [clScriptReady, setClScriptReady] = useState(false); // State for script readiness
  const [clReady, setClReady] = useState(false); // State for CL config readiness
  const [error, setError] = useState<string | null>(null);
  // NEW: State for v2 config
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [organization, setOrganization] = useState<string | null>(null);
  const [v2ConfigReady, setV2ConfigReady] = useState<boolean>(false);
  // REMOVED: cartUpdatedAt state

  // Get market state and setter from Zustand store
  const { market, setMarket } = useMarketStore();

  


  const [currentMarketId, setCurrentMarketId] = useState<string | null>(null);

  // Ref to track script loading state
  const clScriptLoadingRef = useRef(false);

  // --- Effect 0: Load CL Script and CSS (Runs once on mount) --- //
  useEffect(() => {
    // --- Add CL CSS Link --- //
    const cssLinkId = "cl-drop-in-css";
    if (!document.getElementById(cssLinkId)) {
      const cssLink = document.createElement('link');
      cssLink.id = cssLinkId;
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/@commercelayer/drop-in.js@2/dist/drop-in/drop-in.css';
      document.head.appendChild(cssLink);
      console.log('[AppProvider] Added CL CSS link to head early.');
    } else {
      console.log('[AppProvider] CL CSS link already exists (checked early).');
    }

    // JS SCRIPT LOADING IS MOVED TO AFTER CONFIGURATION
    // Ensure clScriptLoadingRef is reset if it was true for some reason, 
    // though it should only be set by the new loading logic.
    // if (clScriptLoadingRef.current) clScriptLoadingRef.current = false;

    // --- Cleanup Function (CSS Only) --- //
    return () => {
      console.log('[AppProvider] Cleanup triggered for EARLY CL CSS effect.');
      const existingCssLink = document.getElementById(cssLinkId);
      if (existingCssLink && document.head.contains(existingCssLink)) {
        // console.log('[AppProvider] Removing CL CSS link (early load cleanup).');
        // document.head.removeChild(existingCssLink); 
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // 1. Fetch Core Commerce Layer Configuration from Backend
  useEffect(() => {
    const fetchCoreConfig = async () => {
      console.log("[AppProvider] Initializing - fetching core CL config from backend...");
      setError(null);
      setConfigReady(false); // Reset ready state
      try {
        let data: CoreCLConfigResponse;

        if (mode === Mode.DEV || brain.get_core_cl_config === undefined) {
          // Use fetch directly in development to include credentials
          console.log(`[AppProvider] Using manual fetch for core config. URL: ${API_URL}/commerce-layer/config`);
          const response = await fetch(`${API_URL}/commerce-layer/config`, {
            credentials: mode === Mode.DEV ? 'include' : 'same-origin',
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to parse error
            throw new Error(
              errorData?.detail ||
              `Failed to fetch core CL config (Status: ${response.status})`
            );
          }
          data = await response.json();
        } else {
          // Use brain client in production (or non-dev)
          console.log("[AppProvider] Using brain client for core config.");
          const response = await brain.get_core_cl_config({});
          if (response.status !== 200) {
            const errorData = await response.json();
            throw new Error(errorData?.detail || "Failed to fetch core CL config");
          }
          data = await response.json();
        }

        console.log("[AppProvider] Core CL config received (raw):", JSON.stringify(data));
        console.log(`[AppProvider] Setting state: ClientID=${data.clientId}, BaseURL=${data.baseUrl}, MarketMap=${JSON.stringify(data.marketIdMap)}`);

        // Validate required fields
        if (!data.clientId || !data.baseUrl || !data.marketIdMap) {
            throw new Error("Incomplete core configuration received from backend.");
        }

        setClientId(data.clientId); // <-- Ensure clientId state is set here
        setBaseUrl(data.baseUrl);
        setMarketIdMap(data.marketIdMap as MarketIdMap); // Assuming backend returns correct structure
        setConfigReady(true); // Set ready state to true
        console.log("[AppProvider] Core CL config is ready.");

      } catch (err: any) {
        console.error("[AppProvider] Error fetching core CL config:", err);
        setError(err.message || "Could not load essential configuration.");
        setConfigReady(false); // Ensure ready state is false on error
        toast.error("Failed to load app configuration. Please refresh.", { duration: 10000 });
      }
    };

    fetchCoreConfig();
  }, []); // Run only once on mount

  // NEW: 1.5 Fetch v2 Access Token and Config (depends on core config and market)
  useEffect(() => {
    // Only run if core config is ready AND market ID is derived
    if (!configReady || !currentMarketId) {
      console.log(`[AppProvider] Skipping v2 token fetch (ConfigReady: ${configReady}, MarketId: ${currentMarketId})`);
      setV2ConfigReady(false);
      return;
    }
    
    console.log(`[AppProvider] Core config and market ID ready. Fetching v2 token for market: ${currentMarketId}...`);
    setV2ConfigReady(false); // Reset ready state
    setError(null); // Reset error

    const fetchV2Token = async () => {
      try {
        const body = { market_id: currentMarketId };
        // Try brain client first, fallback to manual fetch
        let data: AccessTokenResponse;
        try {
            console.log(`[AppProvider] Trying brain client for v2 token. Endpoint: get_cl_access_token2`);
            const response = await brain.get_cl_access_token2(body);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); 
                throw new Error(
                  errorData?.detail ||
                  `Failed to fetch v2 CL token via brain (Status: ${response.status})`
                );
            }
            data = await response.json();
            console.log("[AppProvider] Successfully fetched v2 token via brain client.");
        } catch(brainError: any) {
             console.warn("[AppProvider] Brain client call failed for get_cl_access_token2, falling back to manual fetch.", brainError);
             console.log(`[AppProvider] Using manual fetch for v2 token. URL: ${API_URL}/auth/cl-access-token2`);
             const fetchResponse = await fetch(`${API_URL}/auth/cl-access-token2`, {
                method: "POST",
                headers: {
                   "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                credentials: isDevelopment() ? "include" : "same-origin", 
             });
            
             if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json().catch(() => ({})); 
                throw new Error(
                  errorData?.detail ||
                  `Failed to fetch v2 CL token via manual fetch (Status: ${fetchResponse.status})`
                );
              }
             data = await fetchResponse.json();
             console.log("[AppProvider] Successfully fetched v2 token via manual fetch.");
        }

        if (!data.access_token || !data.endpoint || !data.organization) {
          throw new Error("Incomplete v2 token/config response received from backend.");
        }
        
        console.log("[AppProvider] v2 Token/Config received: Token=***, Endpoint=", data.endpoint, "Org=", data.organization);
        setAccessToken(data.access_token);
        // IMPORTANT: Use the endpoint returned from the token response for v2 config
        setBaseUrl(data.endpoint); 
        setOrganization(data.organization);
        setV2ConfigReady(true);
        console.log("[AppProvider] v2 token/config is ready.");

      } catch (err: any) {
        console.error("[AppProvider] Error fetching v2 CL token/config:", err);
        setError(err.message || "Could not load essential v2 configuration.");
        setV2ConfigReady(false);
        setAccessToken(null); // Clear token on error
        setOrganization(null);
        toast.error("Failed to load essential store components. Please refresh.", { duration: 10000 });
      }
    };

    fetchV2Token();
  // Dependencies: Fetch when core config is ready OR market ID changes
  }, [configReady, currentMarketId]);


  // --- Effect 3: Define window.commercelayerConfig and trigger script load --- //
  useEffect(() => {
    // Define config only when all necessary pieces are ready
    if (
      v2ConfigReady &&
      accessToken &&
      baseUrl &&
      organization &&
      clientId && // Restore check
      currentMarketId // Keep market ID for URLs/locale/scope
    ) {
      console.log(
        '[AppProvider] All config ready (v2Token, BaseUrl, Org, ClientId, MarketId), defining window config & triggering script load...',
      );

      // Define window.commercelayerConfig
      const cartUrl = `${APP_BASE_PATH}cart`;
      const returnUrl = `${APP_BASE_PATH}return`;
      const privacyUrl = `${APP_BASE_PATH}privacy`;
      const termsUrl = `${APP_BASE_PATH}terms`;

      window.commercelayerConfig = {
        clientId: clientId!, // RESTORED - Required by script
        accessToken: accessToken!, // Use the fetched token
        endpoint: baseUrl!, // Use the endpoint from token response
        organization: organization!, // Use the fetched organization slug
        scope: `market:id:${currentMarketId}`, // CORRECTED format based on research
        locale: market === 'UK' ? 'en-GB' : 'en-IE',
        environment: isDevelopment() ? "development" : "production",
        // Add necessary URLs if needed by specific components
        cartUrl: cartUrl,
        returnUrl: returnUrl,
        privacyUrl: privacyUrl,
        termsUrl: termsUrl,
      };
      console.log(
        '[AppProvider] Defined window.commercelayerConfig (v2):',
        window.commercelayerConfig,
      );
      // setShouldLoadClScript(true); // No longer needed, we load script directly

      // NOW, LOAD THE COMMERCE LAYER SCRIPT
      if (!document.getElementById('cl-drop-in-script') && !clScriptLoadingRef.current) {
        console.log('[AppProvider] Configuration ready, proceeding to load Commerce Layer drop-in.js script...');
        clScriptLoadingRef.current = true;

        const script = document.createElement('script');
        script.id = 'cl-drop-in-script';
        script.src = 'https://cdn.jsdelivr.net/npm/@commercelayer/drop-in.js@2/dist/drop-in/drop-in.esm.js';
        script.type = 'module'; // type="module" implies defer, so async might be redundant but kept for clarity
        script.async = true; 

        script.onload = () => {
          console.log('[AppProvider] CL script loaded successfully (post-config).');
          setClScriptReady(true); // Mark script as ready
          clScriptLoadingRef.current = false;


          
          // Since script is loaded AFTER config, if we reach here and clScriptReady is true,
          // and window.commercelayerConfig is defined, CL should be considered ready.
          // The separate effect for setClReady will also handle this.
        };

        script.onerror = (error) => {
          console.error('[AppProvider] Error loading Commerce Layer drop-in script (post-config):', error);
          toast.error('Failed to load Commerce Layer components.');
          setError('Failed to load essential store components.');
          setClScriptReady(false);
          // setClReady(false); // This will be handled by the dedicated clReady effect
          clScriptLoadingRef.current = false;
        };

        document.head.appendChild(script);
        console.log('[AppProvider] Appended CL script tag to head (post-config).');
      } else if (document.getElementById('cl-drop-in-script')) {
        console.log('[AppProvider] CL script tag already exists (checked post-config). Script might have loaded early or by other means.');
        // If script already exists and clScriptReady is false, it implies it loaded but maybe its onload didn't fire our state update
        // Or, it means it was loaded by the OLD Effect 0 which we are refactoring away.
        // For now, if it exists, we assume it's handled or will be. If issues persist, this path needs review.
        if (!clScriptReady) {
            // This case should ideally not happen with the full refactor if Effect 0 no longer loads the script.
            // If it does, it means something else put the script tag there.
            // We can try to set clScriptReady to true if the script element exists, assuming it loaded.
            // However, this is risky as its onload might not have fired for a reason.
            console.warn("[AppProvider] CL script tag exists but clScriptReady is false. This state is unexpected after refactor.");
            // To be safe, don't assume it's ready. Let its original onload (if any) or error handler manage clScriptReady.
        }
      } else if (clScriptLoadingRef.current) {
        console.log('[AppProvider] CL script is already in the process of loading (post-config check).');
      }

      // CL script itself will now use window.commercelayerConfig when it initializes components
      // We set clReady here if the script is already loaded.
      // This part is a bit redundant now as the main clReady logic is in its own useEffect
      // but it reflects the immediate state after config + potential script load initiation.
      if(clScriptReady) { // if clScriptReady was already true from an earlier load (unlikely with full refactor)
        setClReady(true);
        console.log("[AppProvider] CL config defined and script was already ready. CL is fully initialized (post-config check).");
      }
    } else {
      // Log why config setting is skipped
      let skipReason = [];
      if (!v2ConfigReady) skipReason.push("!v2ConfigReady");
      if (!accessToken) skipReason.push("!accessToken");
      if (!baseUrl) skipReason.push("!baseUrl");
      if (!organization) skipReason.push("!organization");
      if (!clientId) skipReason.push("!clientId"); // Restore check
      if (!currentMarketId) skipReason.push("!currentMarketId");
      if (skipReason.length > 0) {
          console.log(`[AppProvider] Skipping window.commercelayerConfig definition (${skipReason.join(', ')})`);
      }
      // If any condition is false, ensure we don't trigger script load or mark CL as ready
      setClReady(false); // CL is not ready if config isn't set
    }
    // Note: No cleanup needed here as we are just setting a window property and state
  }, [
    v2ConfigReady,
    accessToken,
    baseUrl,
    organization,
    clientId, // Restore dependency
    currentMarketId, // Keep dependency for scope
    market, // For locale
    // isDevelopment, // isDevelopment is a function, if its identity is stable, it's okay.
    // APP_BASE_PATH // APP_BASE_PATH is a constant, typically stable.
    clScriptReady, // ADD clScriptReady as a dependency
    // Effect 4 (Removed)
  ]);

  // --- Effect 4: Load CL Script and CSS (Triggered by shouldLoadClScript) --- //
  // THIS EFFECT IS NOW HANDLED BY THE NEW Effect 0 (early script/css loading)
  // useEffect(() => {
  //   if (shouldLoadClScript) { ... } else { ... } 
  // }, [shouldLoadClScript, setClScriptReady, setClReady, setCartOrderId, toast, setError]);

  // --- Effect to set clReady when both config and script are ready ---
  useEffect(() => {
    if (configReady && v2ConfigReady && clScriptReady && window.commercelayerConfig) {
      console.log("[AppProvider] Config (core & v2) and CL script are ready. Setting clReady.");
      setClReady(true);
    } else {
       // If any of these are not ready, CL is not fully ready.
      if (!clReady) return; // Avoid unnecessary sets if already false
      setClReady(false);
    }
  }, [configReady, v2ConfigReady, clScriptReady, window.commercelayerConfig]); // Re-run if any of these change


  // --- Effect 5: Derive Market ID State ---
  // This hook solely derives the currentMarketId from the map and market state
  useEffect(() => {
    if (marketIdMap && market) {
      const derivedMarketId = marketIdMap[market as keyof typeof marketIdMap] || null;
      setCurrentMarketId(derivedMarketId);
      console.log(`[AppProvider] Derived currentMarketId: ${derivedMarketId} for market: ${market}`);
    } else {
      setCurrentMarketId(null);
    }
  }, [marketIdMap, market]);

  // Removed useEffect for cl-init listener as it wasn't firing for v1.1
  // Configuration attempt now happens directly in the script onload handler.


  undefined

  // 4. Load Cart/Order ID from Local Storage (Fallback or Initial Load)
  // Runs once on mount to check local storage

  // Prepare context value - include error and configReady for AppLayout
  const contextValue = useMemo(() => ({
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clScriptReady, // Add clScriptReady to context value
    clReady, // Add clReady to context value
    currentMarketId,
    market,
    accessToken, // Pass v2 config to context
    organization,
    v2ConfigReady,
    error, // Pass error state to context
    // REMOVED: cartUpdatedAt from context value
  }), [
    clientId,
    baseUrl,
    marketIdMap,
    configReady,
    clScriptReady, // Add clScriptReady to dependencies
    clReady, // Add clReady to dependencies
    currentMarketId,
    market,
    error, // Add error to dependencies
    // Add v2 dependencies
    accessToken,
    organization,
    v2ConfigReady,
    // REMOVED: cartUpdatedAt from dependencies
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {/* <cl-config> removed again, relying on programmatic config via useEffect */}
      {/* Render AppLayout structure */}
      <AppLayout>{children}</AppLayout>
    </AppContext.Provider>
  );
};

// --- Custom Hook ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// --- Main Layout Rendering (Integrated) ---
interface AppLayoutProps {
  children: ReactNode;
}
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => { // Accept children
  const { configReady, error } = useAppContext(); // Get state from context

  // Display loading state or error if config isn't ready (moved from provider)
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 border border-destructive rounded-lg bg-destructive/10">
          <h2 className="text-xl font-semibold text-destructive mb-2">Initialization Error</h2>
          <p className="text-destructive/80">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (!configReady) {
     return (
      <div className="flex items-center justify-center h-screen">
        {/* Minimal Loading Indicator */}
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-muted-foreground">Initializing Store...</span>
      </div>
    );
  }

  // Render the main app layout once config is ready
  return (
      <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-background">
            <SimpleHeader />
            <main className="flex-grow container mx-auto px-4 py-8">
              {/* Render children from AppProvider */}
              {children}
            </main>
            <SimpleFooter />
            <Toaster position="top-right" richColors closeButton />
          </div>
      </TooltipProvider>
  );
};