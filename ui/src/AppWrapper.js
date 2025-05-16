import { jsx as _jsx } from "react/jsx-runtime";
import { RouterProvider } from "react-router-dom";
import { OuterErrorBoundary } from './components/OuterErrorBoundary';
import { router } from "./router";
export const AppWrapper = () => {
    return (_jsx(OuterErrorBoundary, { children: _jsx(RouterProvider, { router: router }) }));
};
