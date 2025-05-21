import React from "react";
import { ChevronDown } from "lucide-react";
import { Market, MarketName } from '@/types';
import { MARKETS } from '@/config/constants';

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
    // Use the MARKETS constant for market data
    const newMarket: Market = marketName === 'UK'
      ? {
          name: MARKETS.UK.name,
          region: MARKETS.UK.region,
          id: MARKETS.UK.scope, // Use scope as the ID, matching original logic
          countryCode: MARKETS.UK.countryCode,
          currencyCode: MARKETS.UK.currencyCode
        }
      : {
          name: MARKETS.EU.name,
          region: MARKETS.EU.region,
          id: MARKETS.EU.scope, // Use scope as the ID, matching original logic
          countryCode: MARKETS.EU.countryCode,
          currencyCode: MARKETS.EU.currencyCode
        };
    onMarketChange(newMarket);
  };

  // Ensure display text is consistent with market name from selectedMarket
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