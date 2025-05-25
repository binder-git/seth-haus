import React from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { MarketSwitcher } from './MarketSwitcher';
import { useAppContext } from './AppProvider';
import { ShoppingCart, X } from "lucide-react";

// Remove the interface since we no longer need these props
export default function SimpleHeader() {
  const navigate = useNavigate();
  const { clReady } = useAppContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Inner container that matches main content width */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Left Section - Logo flush to left edge */}
          <Link to="/" className="flex items-center">
            <span className="font-bold text-2xl">Seth's Triathlon Haus</span>
          </Link>

          {/* Center Section - Navigation (takes remaining space and centers) */}
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

          {/* Right Section - Market Switcher and Cart */}
          <div className="flex items-center space-x-4">
            {/* MarketSwitcher now uses global store - no props needed */}
            <MarketSwitcher />

            {/* Commerce Layer Mini-Cart */}
            <div className="relative">
              {/* Commerce Layer Cart Link with Mini-Cart */}
              <cl-cart-link class="relative inline-block">
                <span className="relative inline-flex items-center p-2 hover:bg-accent rounded-md transition-colors cursor-pointer">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="ml-1 text-sm">Cart</span>
                  {/* Cart count in parentheses */}
                  <span className="ml-1 text-sm">(<cl-cart-count></cl-cart-count>)</span>
                </span>
                
                {/* Mini-cart with open-on-add attribute */}
                <cl-cart open-on-add="true" class="absolute right-0 top-full mt-2"></cl-cart>
              </cl-cart-link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
