import { MarketName } from './market';
export interface ShippingOption {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDelivery: string;
    markets: MarketName[];
}
