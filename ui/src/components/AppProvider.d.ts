import React from "react";
import { Market } from "@/types";
export interface AppContextProps {
    clientId: string | null;
    baseUrl: string | null;
    marketIdMap: Record<string, string> | null;
    configReady: boolean;
    clScriptReady: boolean;
    clReady: boolean;
    currentMarketId: string | null;
    market: Market;
    error: string | null;
    accessToken: string | null;
    organization: string | null;
    v2ConfigReady: boolean;
    setMarket: (market: Market) => void;
}
interface AppProviderProps {
    children: React.ReactNode;
}
export declare const useAppContext: () => AppContextProps;
export declare const AppProvider: ({ children }: AppProviderProps) => React.ReactElement;
export {};
