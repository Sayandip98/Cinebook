const roundMoney = (value) => Math.round(value * 100) / 100;

export const calculateBookingTotals = (seats, { convenienceFeePerSeat, discount = 0 }) => {
  const subtotal = seats.reduce((sum, seat) => sum + seat.price, 0);
  const convenienceFee = roundMoney(seats.length * convenienceFeePerSeat);
  const totalAmount = roundMoney(Math.max(0, subtotal - discount) + convenienceFee);

  return { subtotal, discount, convenienceFee, totalAmount };
};

export const toPaise = (rupees) => Math.round(rupees * 100);