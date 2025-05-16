import React from 'react';
interface Props {
    children: React.ReactNode;
}
interface State {
    hasError: boolean;
    error: Error | null;
}
export declare class InternalErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    render(): string | number | boolean | Iterable<React.ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
export default InternalErrorBoundary;
