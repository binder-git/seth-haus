import React from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { MarketSwitcher } from './MarketSwitcher';
import { useAppContext } from './AppProvider';
import { ShoppingCart, X } from "lucide-react";
import { AnalyticsService } from "@/utils/analytics";

export default function SimpleHeader() {
  const navigate = useNavigate();
  const { clReady } = useAppContext();

  // Tracking functions
  const trackLogoClick = () => {
    AnalyticsService.trackClick('header', 'logo', {
      event_category: 'navigation',
      destination: 'home'
    });
  };

  const trackNavigationClick = (category: string) => {
    AnalyticsService.trackClick('header', `nav_${category}`, {
      event_category: 'navigation',
      destination: `products_${category}`
    });
  };

  const trackCartClick = () => {
    AnalyticsService.trackClick('header', 'cart_open', {
      event_category: 'ecommerce',
      action: 'view_cart'
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo with tracking */}
          <Link 
            to="/" 
            className="flex items-center flex-shrink-0 min-w-0"
            onClick={trackLogoClick}
            data-gtm="header_logo_link_click_home"
          >
            <span 
              className="text-lg sm:text-xl md:text-2xl truncate"
              style={{ 
                fontFamily: "'Young Serif', serif",
                fontWeight: "bold"
              }}
            >
              <span className="sm:hidden">Seth's Tri Haus</span>
              <span className="hidden sm:inline md:hidden">Seth's Tri Haus</span>
              <span className="hidden md:inline">Seth's Triathlon Haus</span>
            </span>
          </Link>

          {/* Center Section - Navigation with tracking */}
          <nav className="hidden md:flex items-center justify-center space-x-6 flex-1 mx-8">
            <Link
              to="/products?category=swim"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => trackNavigationClick('swim')}
              data-gtm="header_nav_link_click_swim"
            >
              Swim
            </Link>
            <Link
              to="/products?category=bike"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => trackNavigationClick('bike')}
              data-gtm="header_nav_link_click_bike"
            >
              Bike
            </Link>
            <Link
              to="/products?category=run"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => trackNavigationClick('run')}
              data-gtm="header_nav_link_click_run"
            >
              Run
            </Link>
            <Link
              to="/products?category=triathlon"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => trackNavigationClick('triathlon')}
              data-gtm="header_nav_link_click_triathlon"
            >
              Triathlon
            </Link>
          </nav>

          {/* Right Section - Market Switcher and Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <MarketSwitcher className="text-xs sm:text-sm" />

            {/* Commerce Layer Mini Cart - MUST be inside cl-cart-link */}
            <div className="relative z-50">
              <cl-cart-link>
                <span 
                  className="relative inline-flex items-center p-1.5 sm:p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
                  onClick={trackCartClick}
                  data-gtm="header_cart_btn_click_open_mini_cart"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden xs:inline ml-1 text-xs sm:text-sm">Cart</span>
                  <span className="ml-1 text-xs sm:text-sm">(<cl-cart-count></cl-cart-count>)</span>
                </span>
                <cl-cart type="mini">
                  <cl-cart-count></cl-cart-count>
                </cl-cart>
              </cl-cart-link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
