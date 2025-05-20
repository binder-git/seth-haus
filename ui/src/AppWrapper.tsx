import { useEffect } from 'react';
import { RouterProvider } from "react-router-dom";
import { OuterErrorBoundary } from './components/OuterErrorBoundary';
import { router } from './router';
import { initializeCommerceLayer, updateMarketScope } from './config/commerceLayer';
import { useMarketStore } from './utils/market-store';

export const AppWrapper = () => {
  const { market } = useMarketStore();

  useEffect(() => {
    // Initialize Commerce Layer configuration when the app loads
    const init = async () => {
      try {
        console.log('[AppWrapper] Initializing Commerce Layer...');
        await initializeCommerceLayer();
        
        // Set initial market scope based on the default market
        if (market?.id) {
          console.log(`[AppWrapper] Setting initial market scope to: ${market.id}`);
          await updateMarketScope(market.id);
        }
      } catch (error) {
        console.error('[AppWrapper] Error initializing Commerce Layer:', error);
      }
    };
    
    init();
  }, [market?.id]);

  return (
    <OuterErrorBoundary>
      <RouterProvider router={router} />
    </OuterErrorBoundary>
  );
};
