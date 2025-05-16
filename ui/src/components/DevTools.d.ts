interface Props {
    children: React.ReactNode;
    shouldRender: boolean;
}
/**
 * Render extra dev tools around the app when in dev mode,
 * but only render the app itself in prod mode
 */
export declare const DevTools: ({ children, shouldRender }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
