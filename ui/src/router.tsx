import type { ReactNode } from './react-types';
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";
import { CommerceLayerLogin } from "./components/CommerceLayerLogin";

import NotFoundPage from "pages/NotFoundPage";
import SomethingWentWrongPage from "pages/SomethingWentWrongPage";

export const router = createBrowserRouter(
  [
    ...userRoutes,
    {
      path: "*",
      element: <NotFoundPage />,
      errorElement: <SomethingWentWrongPage />,
    },
  ]
);