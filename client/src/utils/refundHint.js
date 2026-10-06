const MS_PER_HOUR = 60 * 60 * 1000;

export const getRefundHint = (startTime, now) => {
  const hoursLeft = (new Date(startTime).getTime() - now) / MS_PER_HOUR;
  if (hoursLeft >= 24) return { percent: 100, text: 'Cancelling now refunds 100% of the amount.' };
  if (hoursLeft >= 4) return { percent: 50, text: 'Cancelling now refunds 50% of the amount.' };
  return { percent: null, text: 'Paid bookings cannot be cancelled within 4 hours of the show.' };
};
