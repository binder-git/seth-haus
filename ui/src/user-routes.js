import { jsx as _jsx } from "react/jsx-runtime";
import App from "pages/App";
import FAQPage from "pages/FAQPage";
import ProductDetailPage from "pages/ProductDetailPage";
import Products from "pages/Products";
import HomePage from "pages/HomePage";
export const userRoutes = [
    {
        path: "/",
        element: _jsx(App, {}),
        children: [
            { index: true, element: _jsx(HomePage, {}) },
            { path: "products", element: _jsx(Products, {}) },
            { path: "faq-page", element: _jsx(FAQPage, {}) },
            { path: "faqpage", element: _jsx(FAQPage, {}) },
            { path: "product-detail-page", element: _jsx(ProductDetailPage, {}) },
            { path: "productdetailpage", element: _jsx(ProductDetailPage, {}) },
        ]
    }
];
