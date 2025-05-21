// Application-wide constants and configuration

// Market configurations
export const MARKETS = {
  UK: {
    name: 'UK',
    region: 'uk',
    id: 'vjzmJhvEDo',
    scope: 'market:id:vjzmJhvEDo',
    currency: 'GBP',
    countryCode: 'GB',
    skuListId: 'nVvZIAKxGn',
    currencyCode: 'GBP'
  },
  EU: {
    name: 'EU',
    region: 'eu',
    id: 'qjANwhQrJg',
    scope: 'market:id:qjANwhQrJg',
    currency: 'EUR',
    countryCode: 'EU',
    skuListId: 'JjEpIvwjey',
    currencyCode: 'EUR'
  }
} as const;
