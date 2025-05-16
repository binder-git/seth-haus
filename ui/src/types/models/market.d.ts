export type MarketName = "UK" | "EU";
export type MarketRegion = "uk" | "eu";
export interface MarketConfig {
    name: MarketName;
    region: MarketRegion;
    id: string;
    countryCode?: string;
    currencyCode?: string;
}
export type Market = MarketConfig;
