import { RouteObject } from "react-router-dom";
import DebugPage from "pages/DebugPage";
import TestPage from "pages/TestPage";

export const debugRoutes: RouteObject[] = [
  {
    path: '/debug',
    element: <DebugPage />
  },
  {
    path: '/test',
    element: <TestPage />
  }
];
