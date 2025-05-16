import { Market } from "@/types";
interface SimpleHeaderProps {
    selectedMarket: Market;
    onMarketChange: (market: Market) => void;
}
export default function SimpleHeader({ selectedMarket, onMarketChange }: SimpleHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
