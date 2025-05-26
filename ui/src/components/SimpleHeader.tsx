import React from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { MarketSwitcher } from './MarketSwitcher';
import { useAppContext } from './AppProvider';
import { ShoppingCart, X } from "lucide-react";

export default function SimpleHeader() {
  const navigate = useNavigate();
  const { clReady } = useAppContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Inner container that matches main content width */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo with responsive text */}
          <Link to="/" className="flex items-center flex-shrink-0 min-w-0">
            <span className="font-bold text-lg sm:text-xl md:text-2xl truncate">
              <span className="sm:hidden">Seth's Tri Haus</span>
              <span className="hidden sm:inline md:hidden">Seth's Tri Haus</span>
              <span className="hidden md:inline">Seth's Triathlon Haus</span>
            </span>
          </Link>

          {/* Center Section - Navigation (hidden on mobile, centered on desktop) */}
          <nav className="hidden md:flex items-center justify-center space-x-6 flex-1 mx-8">
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

          {/* Right Section - Market Switcher and Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* MarketSwitcher with responsive sizing */}
            <MarketSwitcher className="text-xs sm:text-sm" />

            {/* Commerce Layer Full Cart Link - No Mini Cart */}
            <div className="relative">
              <cl-cart-link class="relative inline-block">
                <span className="relative inline-flex items-center p-1.5 sm:p-2 hover:bg-accent rounded-md transition-colors cursor-pointer">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {/* Hide "Cart" text on very small screens */}
                  <span className="hidden xs:inline ml-1 text-xs sm:text-sm">Cart</span>
                  {/* Cart count */}
                  <span className="ml-1 text-xs sm:text-sm">(<cl-cart-count></cl-cart-count>)</span>
                </span>
                
                {/* Removed the cl-cart element - now clicking will go to full hosted cart */}
              </cl-cart-link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
