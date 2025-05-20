import React from "react";
import { useMarketStore } from "@/utils/market-store";
import { Market } from '@/types';
import { CommerceLayerProvider } from "@/contexts/CommerceLayerContext";
import { Outlet, useLocation, useRoutes } from "react-router-dom";
import EnvDebug from "@/components/EnvDebug";
import { userRoutes } from "@/user-routes";
import NotFoundPage from "./NotFoundPage";

// Create a type for the context
export type AppContextType = {
  selectedMarket: Market;
};

// Extract the app routes from userRoutes (removing the root route)
const appRoutes = userRoutes.flatMap(route => 
  route.path === '/' && route.children ? route.children : route
);

// Add 404 page as catch-all
const allRoutes = [
  ...appRoutes,
  { path: "*", element: <NotFoundPage /> }
];

export default function App() {
  const location = useLocation();
  // Use the global market store - it already has a default value
  const { market } = useMarketStore();

  // Log route changes
  React.useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);

  // Use useRoutes to handle the routing
  const routes = useRoutes(allRoutes);

  return (
    <CommerceLayerProvider>
      {import.meta.env.DEV && (
        <div style={{ marginBottom: '2rem' }}>
          <EnvDebug />
        </div>
      )}
      {routes}
      <Outlet context={{ selectedMarket: market }} />
    </CommerceLayerProvider>
  );
}
