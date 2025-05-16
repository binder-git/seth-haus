import React from "react";
import { ProductResponse } from "../brain/data-contracts";
export interface Props {
    product: ProductResponse;
    className?: string;
    onViewDetailsClick?: () => void;
}
export declare const ProductItemCard: React.MemoExoticComponent<({ product, className, onViewDetailsClick }: Props) => import("react/jsx-runtime").JSX.Element>;
