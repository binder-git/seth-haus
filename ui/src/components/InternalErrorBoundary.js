import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export class InternalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Internal Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded", children: [_jsx("h2", { className: "text-red-800 font-semibold", children: "Internal Error" }), _jsx("pre", { className: "mt-2 text-sm text-red-600 whitespace-pre-wrap", children: this.state.error?.message })] }));
        }
        return this.props.children;
    }
}
export default InternalErrorBoundary;
