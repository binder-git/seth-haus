import React from "react";
import { ChevronDown } from "lucide-react"; // Import chevron icon
import { useMarketStore } from "../utils/market-store"; // Import store
import { Market, MarketName } from '@/types';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/extensions/shadcn/components/dropdown-menu";
import { Button } from "@/extensions/shadcn/components/button";

export const MarketSwitcher = ({ className = "" }: { className?: string }) => {
  const { market = { name: 'UK', region: 'uk', id: 'uk-market', countryCode: 'GB', currencyCode: 'GBP' }, setMarket } = useMarketStore();

  const handleMarketChange = (marketName: MarketName) => {
    const newMarket: Market = marketName === 'UK' 
      ? { name: 'UK', region: 'uk', id: process.env.VITE_COMMERCE_LAYER_MARKET_ID_UK || '', countryCode: 'GB', currencyCode: 'GBP' }
      : { name: 'EU', region: 'eu', id: process.env.VITE_COMMERCE_LAYER_MARKET_ID_EU || '', countryCode: 'EU', currencyCode: 'EUR' };
    setMarket(newMarket);
  };

  const displayMarket = market.name === "UK" ? "🇬🇧 UK (£)" : "🇪🇺 EU (€)";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Change trigger to show selected market text and chevron */}
        <Button variant="outline" className={`flex items-center space-x-1 ${className}`} aria-label="Select Market">
          <span>{displayMarket}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleMarketChange("UK")} 
          disabled={market.name === "UK"}
        >
          🇬🇧 UK (GBP £)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleMarketChange("EU")} 
          disabled={market.name === "EU"}
        >
          🇪🇺 EU (EUR €)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};