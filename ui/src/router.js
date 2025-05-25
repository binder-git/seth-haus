import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";
import NotFoundPage from "pages/NotFoundPage";
import SomethingWentWrongPage from "pages/SomethingWentWrongPage";
import { RootLayout } from "./components/RootLayout.tsx";

console.log('[Router] Configuring routes...');

// Debug: Log all user routes
console.log('[Router] User routes:', userRoutes);

const router = createBrowserRouter([
  {
    path: "/",
    element: _jsx(RootLayout, {}),
    errorElement: _jsx(SomethingWentWrongPage, {}),
    children: [
      // User routes
      ...userRoutes,
      // 404 route
      {
        path: "*",
        element: _jsx(NotFoundPage, {})
      }
    ]
  }
]);

// Enhanced route change logging
let currentPathname = window.location.pathname;
const originalPushState = window.history.pushState;
const originalReplaceState = window.history.replaceState;

window.history.pushState = function(...args) {
  const result = originalPushState.apply(this, args);
  handleRouteChange();
  return result;
};

window.history.replaceState = function(...args) {
  const result = originalReplaceState.apply(this, args);
  handleRouteChange();
  return result;
};

window.addEventListener('popstate', handleRouteChange);

function handleRouteChange() {
  if (window.location.pathname !== currentPathname) {
    currentPathname = window.location.pathname;
    console.log('[Router] Route changed to:', currentPathname);
    
    // Debug: Check if route matches any configured routes
    const matchedRoutes = router.routes[0].children?.filter(route => {
      if (route.path === "*") return false;
      if (route.path && route.path.includes(':')) {
        // Handle dynamic routes like /products/:productCode
        const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(currentPathname);
      }
      return route.path === currentPathname;
    });
    
    console.log('[Router] Matched routes:', matchedRoutes?.map(r => r.path) || []);
  }
}

// Initial log
setTimeout(handleRouteChange, 0);

console.log('[Router] Routes configured');

export { router };
