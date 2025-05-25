import React from "react";
import { ChevronDown } from "lucide-react";
import { Market, MarketName } from '@/types';
import { MARKETS } from '@/config/constants';
import { useMarketStore } from '@/utils/market-store';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/extensions/shadcn/components/dropdown-menu";
import { Button } from "@/extensions/shadcn/components/button";

interface MarketSwitcherProps {
  className?: string;
}

export const MarketSwitcher = ({
  className = ""
}: MarketSwitcherProps) => {
  // Use the global market store directly
  const { market: currentMarket, setMarket } = useMarketStore();
  
  // Fallback to UK if no market is set
  const selectedMarket = currentMarket || MARKETS.UK;

  const handleMarketChange = (marketName: MarketName) => {
    console.log('[MarketSwitcher] Changing market to:', marketName);
    console.log('[MarketSwitcher] Current market:', selectedMarket);
    
    // Create new market object based on MARKETS constant
    const newMarket: Market = MARKETS[marketName];
    
    console.log('[MarketSwitcher] New market object:', newMarket);
    
    // Update the global market store directly
    setMarket(newMarket);
    console.log('[MarketSwitcher] Market updated in global store and persisted to localStorage');
    
    // Remove page refresh - let persistence and Commerce Layer handle the update naturally
    // The market will now persist across page refreshes and browser sessions
  };

  // Get display text based on current market
  const getDisplayText = (market: Market) => {
    if (!market) return "🇬🇧 UK (£)";
    
    // Check by name or countryCode to determine display
    if (market.name === "UK" || market.countryCode === "GB") {
      return "🇬🇧 UK (£)";
    } else if (market.name === "EU" || market.countryCode === "EU") {
      return "🇪🇺 EU (€)";
    }
    
    // Fallback
    return "🇬🇧 UK (£)";
  };

  const displayMarket = getDisplayText(selectedMarket);

  // Determine if market is selected for disabled state
  const isMarketSelected = (marketName: MarketName) => {
    if (!selectedMarket) return false;
    
    if (marketName === "UK") {
      return selectedMarket.name === "UK" || 
             selectedMarket.countryCode === "GB";
    } else if (marketName === "EU") {
      return selectedMarket.name === "EU" || 
             selectedMarket.countryCode === "EU";
    }
    
    return false;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center space-x-1 ${className}`} 
          aria-label="Select Market"
        >
          <span>{displayMarket}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleMarketChange("UK")}
          disabled={isMarketSelected("UK")}
          className="cursor-pointer"
        >
          🇬🇧 UK (GBP £)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleMarketChange("EU")}
          disabled={isMarketSelected("EU")}
          className="cursor-pointer"
        >
          🇪🇺 EU (EUR €)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
