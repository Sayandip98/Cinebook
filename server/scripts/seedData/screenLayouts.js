export const screenLayouts = {
  STANDARD: {
    rows: 10,
    columns: 12,
    categories: [
      { name: 'SILVER', fromRow: 1, toRow: 3, priceMultiplier: 1 },
      { name: 'GOLD', fromRow: 4, toRow: 8, priceMultiplier: 1.3 },
      { name: 'PREMIUM', fromRow: 9, toRow: 10, priceMultiplier: 1.6 },
    ],
    blockedSeats: [],
  },
  COMPACT: {
    rows: 8,
    columns: 10,
    categories: [
      { name: 'SILVER', fromRow: 1, toRow: 3, priceMultiplier: 1 },
      { name: 'GOLD', fromRow: 4, toRow: 6, priceMultiplier: 1.25 },
      { name: 'PREMIUM', fromRow: 7, toRow: 8, priceMultiplier: 1.5 },
    ],
    blockedSeats: ['H1', 'H10'],
  },
  LARGE: {
    rows: 12,
    columns: 16,
    categories: [
      { name: 'SILVER', fromRow: 1, toRow: 4, priceMultiplier: 1 },
      { name: 'GOLD', fromRow: 5, toRow: 9, priceMultiplier: 1.3 },
      { name: 'PREMIUM', fromRow: 10, toRow: 12, priceMultiplier: 1.7 },
    ],
    blockedSeats: [],
  },
};
