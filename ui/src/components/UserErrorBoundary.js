import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export class UserErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('User Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded", children: [_jsx("h2", { className: "text-yellow-800 font-semibold", children: "Something went wrong" }), _jsx("p", { className: "mt-2 text-sm text-yellow-600", children: "Please try again later or contact support if the issue persists." })] }));
        }
        return this.props.children;
    }
}
export default UserErrorBoundary;
