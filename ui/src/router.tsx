import type { ReactNode } from './react-types';
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";
import NotFoundPage from "pages/NotFoundPage";
import SomethingWentWrongPage from "pages/SomethingWentWrongPage";
import { RootLayout } from "./components/RootLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <SomethingWentWrongPage />,
    children: [
      ...userRoutes,
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);