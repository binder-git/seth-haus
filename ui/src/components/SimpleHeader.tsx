import React from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { MarketSwitcher } from "./MarketSwitcher";
import { useAppContext } from "./AppProvider";
import { Market } from "@/types";

interface SimpleHeaderProps {
  selectedMarket: Market;
  onMarketChange: (market: Market) => void;
}

export default function SimpleHeader({ selectedMarket, onMarketChange }: SimpleHeaderProps) {
  const navigate = useNavigate();
  const { clReady } = useAppContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl">Seth's Triathlon Haus</span>
          </Link>
        </div>

        <nav className="hidden md:flex flex-1 items-center justify-center space-x-6">
          <Link
            to="/products?category=swim"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Swim
          </Link>
          <Link
            to="/products?category=bike"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Bike
          </Link>
          <Link
            to="/products?category=run"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Run
          </Link>
          <Link
            to="/products?category=triathlon"
            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Triathlon
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <MarketSwitcher selectedMarket={selectedMarket} onMarketChange={onMarketChange} />

          {clReady && (
            <div className="relative ml-4 flex items-center">
              {/* SVG Cart Icon */}
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
                <path d="M27 6H5C4.44772 6 4 6.44772 4 7V25C4 25.5523 4.44772 26 5 26H27C27.5523 26 28 25.5523 28 25V7C28 6.44772 27.5523 6 27 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M4 10H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M21 14C21 15.3261 20.4732 16.5979 19.5355 17.5355C18.5979 18.4732 17.3261 19 16 19C14.6739 19 13.4021 18.4732 12.4645 17.5355C11.5268 16.5979 11 15.3261 11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              {/* The cart component */}
              <cl-cart></cl-cart>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
