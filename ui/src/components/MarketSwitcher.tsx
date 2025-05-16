import React from "react";
import { ChevronDown } from "lucide-react"; // Import chevron icon
import { Market, MarketName } from '@/types';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/extensions/shadcn/components/dropdown-menu";
import { Button } from "@/extensions/shadcn/components/button";

interface MarketSwitcherProps {
  className?: string;
  selectedMarket: Market;
  onMarketChange: (market: Market) => void;
}

export const MarketSwitcher = ({ 
  className = "",
  selectedMarket,
  onMarketChange 
}: MarketSwitcherProps) => {
  const handleMarketChange = (marketName: MarketName) => {
    const newMarket: Market = marketName === 'UK' 
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
          disabled={selectedMarket.name === "UK"}
        >
          🇬🇧 UK (GBP £)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleMarketChange("EU")} 
          disabled={selectedMarket.name === "EU"}
        >
          🇪🇺 EU (EUR €)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};