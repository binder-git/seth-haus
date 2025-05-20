export type MarketName = "UK" | "EU";
export type MarketRegion = "uk" | "eu";

export interface MarketConfig {
  name: MarketName;
  region: MarketRegion;
  id: string;
  scope: string;
  countryCode?: string;
  currencyCode?: string;
  skuListId?: string;
}

export type Market = MarketConfig;

export interface Markets {
  [key: string]: Market;
}
