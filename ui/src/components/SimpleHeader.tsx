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
        <div className="flex h-16 items-center">
          {/* Left Section - Logo with responsive text */}
          <Link to="/" className="flex items-center flex-shrink-0">
            {/* Mobile: Show shorter version */}
            <span className="font-bold text-lg sm:text-xl md:text-2xl">
              <span className="sm:hidden">Seth.Haus</span>
              <span className="hidden sm:inline md:hidden">Seth.Haus</span>
              <span className="hidden md:inline">Seth's Triathlon Haus</span>
            </span>
          </Link>

          {/* Center Section - Navigation (takes remaining space and centers) */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-6 mx-4">
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
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* MarketSwitcher with responsive sizing */}
            <div className="flex-shrink-0">
              <MarketSwitcher className="text-sm" />
            </div>

            {/* Commerce Layer Mini-Cart with responsive sizing */}
            <div className="relative flex-shrink-0">
              <cl-cart-link class="relative inline-block">
                <span className="relative inline-flex items-center p-1 sm:p-2 hover:bg-accent rounded-md transition-colors cursor-pointer">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {/* Hide "Cart" text on very small screens */}
                  <span className="hidden xs:inline ml-1 text-sm">Cart</span>
                  {/* Cart count */}
                  <span className="ml-1 text-sm">(<cl-cart-count></cl-cart-count>)</span>
                </span>
                
                {/* Mini-cart positioned responsively */}
                <cl-cart open-on-add="true" class="absolute right-0 top-full mt-2 w-80 max-w-[90vw]"></cl-cart>
              </cl-cart-link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
