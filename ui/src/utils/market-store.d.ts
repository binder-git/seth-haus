import { Market } from '@/types';
interface MarketState {
    market: Market | undefined;
    setMarket: (market: Market) => void;
}
export declare const useMarketStore: import("zustand").UseBoundStore<import("zustand").StoreApi<MarketState>>;
export {};
