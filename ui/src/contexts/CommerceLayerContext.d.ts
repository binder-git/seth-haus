import React, { FC } from 'react';
import CommerceLayer from '@commercelayer/sdk';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
            button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
            main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
type CommerceLayerClient = ReturnType<typeof CommerceLayer>;
interface Market {
    id: string;
    name: string;
    region: 'eu' | 'uk';
}
type Markets = {
    [key in 'eu' | 'uk']: Market;
};
interface CommerceLayerContextType {
    client: CommerceLayerClient;
    currentMarket: Market;
    markets: Markets;
    switchMarket: (market: Market) => void;
}
export declare const CommerceLayerContext: React.Context<CommerceLayerContextType>;
export declare const CommerceLayerProvider: FC<{
    children: React.ReactNode;
}>;
export { useCommerceLayer } from '../hooks/useCommerceLayer';
