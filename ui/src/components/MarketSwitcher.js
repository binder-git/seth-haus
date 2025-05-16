import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown } from "lucide-react"; // Import chevron icon
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/extensions/shadcn/components/dropdown-menu";
import { Button } from "@/extensions/shadcn/components/button";
export const MarketSwitcher = ({ className = "", selectedMarket, onMarketChange }) => {
    const handleMarketChange = (marketName) => {
        const newMarket = marketName === 'UK'
            ? {
                name: 'UK',
                region: 'uk',
                id: import.meta.env.COMMERCE_LAYER_MARKET_ID_UK || 'market:vjzmJhvEDo',
                countryCode: 'GB',
                currencyCode: 'GBP'
            }
            : {
                name: 'EU',
                region: 'eu',
                id: import.meta.env.COMMERCE_LAYER_MARKET_ID_EU || 'market:qjANwhQrJg',
                countryCode: 'EU',
                currencyCode: 'EUR'
            };
        onMarketChange(newMarket);
    };
    const displayMarket = selectedMarket.name === "UK" ? "🇬🇧 UK (£)" : "🇪🇺 EU (€)";
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: `flex items-center space-x-1 ${className}`, "aria-label": "Select Market", children: [_jsx("span", { children: displayMarket }), _jsx(ChevronDown, { className: "h-4 w-4 opacity-50" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => handleMarketChange("UK"), disabled: selectedMarket.name === "UK", children: "\uD83C\uDDEC\uD83C\uDDE7 UK (GBP \u00A3)" }), _jsx(DropdownMenuItem, { onClick: () => handleMarketChange("EU"), disabled: selectedMarket.name === "EU", children: "\uD83C\uDDEA\uD83C\uDDFA EU (EUR \u20AC)" })] })] }));
};
