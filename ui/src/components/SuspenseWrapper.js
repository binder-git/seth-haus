import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from "react";
export const SuspenseWrapper = ({ children }) => {
    return _jsx(Suspense, { children: children });
};
