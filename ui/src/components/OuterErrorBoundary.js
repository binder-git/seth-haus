import { jsx as _jsx } from "react/jsx-runtime";
import { ErrorBoundary } from "react-error-boundary";
export const OuterErrorBoundary = ({ children }) => {
    return (_jsx(ErrorBoundary, { fallback: null, onError: (error) => {
            console.error("Caught error in AppWrapper", error.message, error.stack);
        }, children: children }));
};
