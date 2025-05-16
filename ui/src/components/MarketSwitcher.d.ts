import { Market } from '@/types';
interface MarketSwitcherProps {
    className?: string;
    selectedMarket: Market;
    onMarketChange: (market: Market) => void;
}
export declare const MarketSwitcher: ({ className, selectedMarket, onMarketChange }: MarketSwitcherProps) => import("react/jsx-runtime").JSX.Element;
export {};
