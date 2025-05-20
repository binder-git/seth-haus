import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes.js";
import NotFoundPage from "pages/NotFoundPage";
import SomethingWentWrongPage from "pages/SomethingWentWrongPage";
import { RootLayout } from "./components/RootLayout.js";
import DebugPage from "pages/DebugPage";
import TestPage from "pages/TestPage";

console.log('[Router] Configuring routes...');

const router = createBrowserRouter([
  {
    path: "/",
    element: _jsx(RootLayout, {}),
    errorElement: _jsx(SomethingWentWrongPage, {}),
    children: [
      // Debug routes
      {
        path: "debug",
        element: _jsx(DebugPage, {})
      },
      {
        path: "test",
        element: _jsx(TestPage, {})
      },
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

// Log route changes
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
  }
}

// Initial log
setTimeout(handleRouteChange, 0);

console.log('[Router] Routes configured');

export { router };
