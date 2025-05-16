import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { MessageEmitter } from "./Beacon";
import { InternalErrorBoundary } from "./InternalErrorBoundary";
import { UserErrorBoundary } from "./UserErrorBoundary";
function logReason(event) {
    console.error(event?.reason);
}
/**
 * Render extra dev tools around the app when in dev mode,
 * but only render the app itself in prod mode
 */
export const DevTools = ({ children, shouldRender }) => {
    useEffect(() => {
        if (shouldRender) {
            window.addEventListener("unhandledrejection", logReason);
            return () => {
                window.removeEventListener("unhandledrejection", logReason);
            };
        }
    }, [shouldRender]);
    if (shouldRender) {
        return (_jsx(InternalErrorBoundary, { children: _jsx(UserErrorBoundary, { children: _jsx(MessageEmitter, { children: children }) }) }));
    }
    return _jsx(_Fragment, { children: children });
};
