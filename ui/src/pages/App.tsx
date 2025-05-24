import React from "react";
import { useMarketStore } from "@/utils/market-store";
import { Market } from '@/types';
import { Outlet, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  // Use the global market store - it already has a default value
  const { market } = useMarketStore();

  // Initialize Commerce Layer Drop-in v2 configuration
  React.useEffect(() => {
    // Enhanced Commerce Layer v2 configuration
    (window as any).commercelayerConfig = {
      clientId: "3uRXduKWJ8qr4G7lUBdrC1GFormL5Qa-RbFy-eCIGtA",
      scope: "market:id:vjzmJhvEDo",
      defaultAttributes: {
        orders: {
          return_url: window.location.origin
        }
      }
    };

    console.log('[App] Enhanced Commerce Layer v2 config set:', (window as any).commercelayerConfig);

    // Debug Commerce Layer components
    setTimeout(() => {
      const clPrices = document.querySelectorAll('cl-price');
      const clAddToCarts = document.querySelectorAll('cl-add-to-cart');
      const clCarts = document.querySelectorAll('cl-cart');
      
      console.log('[App] cl-price elements found (2s):', clPrices.length);
      console.log('[App] cl-add-to-cart elements found (2s):', clAddToCarts.length);
      console.log('[App] cl-cart elements found (2s):', clCarts.length);
      
      // Check if components are properly initialized
      clAddToCarts.forEach((element, index) => {
        console.log(`[App] cl-add-to-cart ${index}:`, {
          code: element.getAttribute('code'),
          innerHTML: element.innerHTML
        });
      });
      
      // Try to manually trigger the Drop-in library
      if ((window as any).commercelayerConfig && clPrices.length > 0) {
        console.log('[App] Attempting to manually initialize cl-price elements');
        clPrices.forEach((element, index) => {
          console.log(`[App] cl-price ${index}:`, {
            code: element.getAttribute('code'),
            className: element.className,
            innerHTML: element.innerHTML
          });
        });
      }
    }, 2000);

    // Extended delay check
    setTimeout(() => {
      const clPrices = document.querySelectorAll('cl-price');
      console.log('[App] cl-price elements found (5s):', clPrices.length);
      
      // Check if Drop-in library is actually loaded
      console.log('[App] Window object keys containing "commerce":', 
        Object.keys(window).filter(key => key.toLowerCase().includes('commerce'))
      );
    }, 5000);
  }, []);

  // Log route changes
  React.useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);

  return <Outlet context={{ selectedMarket: market }} />;
}
