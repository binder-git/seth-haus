import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/extensions/shadcn/components/tooltip";
import { SimpleFooter } from "./SimpleFooter";
import SimpleHeader from "./SimpleHeader";
import { useMarketStore } from "@/utils/market-store";
import { API } from "@/config";
import { NetlifyBrainProvider } from "@/contexts/NetlifyBrainContext";
const AppContext = createContext(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
export const AppProvider = ({ children }) => {
    const [clientId, setClientId] = useState(null);
    const [baseUrl, setBaseUrl] = useState(null);
    const [marketIdMap, setMarketIdMap] = useState(null);
    const [configReady, setConfigReady] = useState(false);
    const [clScriptReady, setClScriptReady] = useState(false);
    const [clReady, setClReady] = useState(false);
    const [currentMarketId, setCurrentMarketId] = useState(null);
    const [error, setError] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [v2ConfigReady, setV2ConfigReady] = useState(false);
    const clScriptRef = useRef(null);
    const { market = { name: 'UK', region: 'uk', id: 'uk-market', countryCode: 'GB', currencyCode: 'GBP' } } = useMarketStore();
    // Check if we're in development mode
    const isDev = import.meta.env.MODE === 'development';
    // Get core config from environment
    const getCoreConfig = () => {
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
            // Load Commerce Layer script
            if (!clScriptRef.current) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@commercelayer/drop-in.js@2/dist/drop-in/drop-in.esm.js';
                script.type = 'module';
                script.async = true;
                script.onload = () => {
                    setClScriptReady(true);
                    if (isDev) {
                        console.log('[AppProvider] Commerce Layer script loaded');
                    }
                };
                script.onerror = (error) => {
                    setError('Failed to load Commerce Layer script');
                    console.error('[AppProvider] Error loading Commerce Layer script:', error);
                };
                document.head.appendChild(script);
                clScriptRef.current = script;
            }
        }
        catch (error) {
            setError('Failed to initialize Commerce Layer');
            console.error('[AppProvider] Error initializing Commerce Layer:', error);
        }
    };
    // Update market in Commerce Layer
    const setMarket = (newMarket) => {
        if (!marketIdMap)
            return;
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
    const value = useMemo(() => ({
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
    return (_jsx(NetlifyBrainProvider, { children: _jsx(AppContext.Provider, { value: value, children: _jsx(TooltipProvider, { children: _jsxs("div", { className: "flex flex-col min-h-screen", children: [_jsx(SimpleHeader, { selectedMarket: market, onMarketChange: setMarket }), _jsx("main", { className: "flex-grow", children: children }), _jsx(SimpleFooter, {}), _jsx(Toaster, { position: "bottom-right" })] }) }) }) }));
};
