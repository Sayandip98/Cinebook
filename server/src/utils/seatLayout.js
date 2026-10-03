const ROW_LABEL_OFFSET = 64;

export const getRowLabel = (rowNumber) => String.fromCharCode(ROW_LABEL_OFFSET + rowNumber);

const findCategoryForRow = (categories, rowNumber) =>
  categories.find((category) => rowNumber >= category.fromRow && rowNumber <= category.toRow);

export const calculateSeatPrice = (basePrice, priceMultiplier) =>
  Math.round(basePrice * priceMultiplier);

export const generateSeatList = (seatLayout) => {
  const { rows, columns, categories, blockedSeats = [] } = seatLayout;
  const blocked = new Set(blockedSeats);
  const seats = [];

  for (let row = 1; row <= rows; row += 1) {
    const category = findCategoryForRow(categories, row);
    if (!category) {
      throw new Error(`No seat category covers row ${row}`);
    }

    for (let column = 1; column <= columns; column += 1) {
      const seatLabel = `${getRowLabel(row)}${column}`;
      if (blocked.has(seatLabel)) continue;

      seats.push({
        seatLabel,
        row,
        column,
        category: category.name,
        priceMultiplier: category.priceMultiplier,
      });
    }
  }

  return seats;
};
