import { ShippingOption, Market } from "./types"; // Import types used by shippingOptions

export const shippingOptions: ShippingOption[] = [
  {
    id: "uk-standard",
    name: "UK Standard Delivery",
    description: "Delivery within 3-5 working days",
    price: 4.99,
    estimatedDelivery: "3-5 business days",
    markets: ["UK"],
  },
  {
    id: "uk-express",
    name: "UK Express Delivery",
    description: "Next day delivery for orders placed before 2pm",
    price: 7.99,
    estimatedDelivery: "1 business day",
    markets: ["UK"],
  },
  {
    id: "eu-standard",
    name: "EU Standard Delivery",
    description: "Delivery within 5-7 working days",
    price: 9.99,
    estimatedDelivery: "5-7 business days",
    markets: ["EU"],
  },
  {
    id: "eu-express",
    name: "EU Express Delivery",
    description: "Delivery within 2-3 working days",
    price: 14.99,
    estimatedDelivery: "2-3 business days",
    markets: ["EU"],
  },
  {
    id: "international",
    name: "International Delivery",
    description: "Worldwide delivery where available",
    price: 19.99,
    estimatedDelivery: "7-14 business days",
    markets: ["UK", "EU"],
  },
];