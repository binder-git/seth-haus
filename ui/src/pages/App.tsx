import React from "react";
import { useMarketStore } from "@/utils/market-store";
import { Market } from '@/types';
import { Outlet, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  // Use the global market store - it already has a default value
  const { market } = useMarketStore();

  // Update Commerce Layer configuration when market changes
  React.useEffect(() => {
    // Use the full scope format FIRST, then fallback to ID
    const marketScope = market.scope || market.id || "market:id:vjzmJhvEDo";

    console.log('[App] Original market object:', market);
    console.log('[App] Market scope being used:', marketScope);
    console.log('[App] Market scope character check:', {
      length: marketScope.length,
      includes_market_prefix: marketScope.startsWith('market:id:'),
      actual_chars: marketScope.split('')
    });
    
    // Enhanced Commerce Layer v2 configuration with proper authentication
    (window as any).commercelayerConfig = {
      clientId: "3uRXduKWJ8qr4G7lUBdrC1GFormL5Qa-RbFy-eCIGtA",
      scope: marketScope, // Now uses full scope format
      domain: "commercelayer.io",
      defaultAttributes: {
        orders: {
          return_url: window.location.origin
        }
      }
    };
  
    console.log('[App] Commerce Layer config updated for market:', market.name, 'scope:', marketScope);

    // Force Commerce Layer components to reinitialize when market changes
    setTimeout(() => {
      const clPriceElements = document.querySelectorAll('cl-price');
      
      console.log(`[App] Found ${clPriceElements.length} cl-price elements to refresh`);
      
      clPriceElements.forEach((element, index) => {
        const currentCode = element.getAttribute('code');
        console.log(`[App] Refreshing cl-price ${index} with code: ${currentCode}`);
        
        // Force complete re-initialization by removing and re-adding
        const parent = element.parentNode;
        const nextSibling = element.nextSibling;
        const clonedElement = element.cloneNode(true);
        
        if (parent) {
          // Remove old element
          parent.removeChild(element);
          
          // Add new element after a brief delay
          setTimeout(() => {
            parent.insertBefore(clonedElement, nextSibling);
            console.log(`[App] Re-inserted cl-price element for ${currentCode}`);
          }, 100);
        }
      });
      
      console.log('[App] Forced Commerce Layer price components to refresh for market:', market.name);
    }, 200);

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
  }, [market]); // Re-run when market changes

  // Log route changes
  React.useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);

  return <Outlet context={{ selectedMarket: market }} />;
}
