import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";
import NotFoundPage from "pages/NotFoundPage";
import SomethingWentWrongPage from "pages/SomethingWentWrongPage";
import { RootLayout } from "./components/RootLayout";
export const router = createBrowserRouter([
    {
        element: _jsx(RootLayout, {}),
        errorElement: _jsx(SomethingWentWrongPage, {}),
        children: [
            ...userRoutes,
            {
                path: "*",
                element: _jsx(NotFoundPage, {}),
            },
        ],
    },
]);
