import { jsx as _jsx } from "react/jsx-runtime";
import { useMarketStore } from "utils/market-store";
import { CommerceLayerProvider } from "@/contexts/CommerceLayerContext";
import { Outlet } from "react-router-dom";
export default function App() {
    // Use the global market store
    const { market } = useMarketStore();
    // Ensure market is always defined
    const selectedMarket = market || {
        name: 'UK',
        region: 'uk',
        id: 'uk-market',
        countryCode: 'GB',
        currencyCode: 'GBP'
    };
    // Pass the selectedMarket to all child routes
    return (_jsx(CommerceLayerProvider, { children: _jsx(Outlet, { context: { selectedMarket } }) }));
}
