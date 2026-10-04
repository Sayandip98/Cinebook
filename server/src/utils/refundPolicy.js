const MS_PER_HOUR = 60 * 60 * 1000;

export const REFUND_TIERS = Object.freeze([
  { minHoursBeforeShow: 24, percent: 100 },
  { minHoursBeforeShow: 4, percent: 50 },
]);

export const MIN_CANCELLATION_HOURS = REFUND_TIERS.at(-1).minHoursBeforeShow;

export const getRefundPercent = (msUntilShow) => {
  const hoursLeft = msUntilShow / MS_PER_HOUR;
  const tier = REFUND_TIERS.find((item) => hoursLeft >= item.minHoursBeforeShow);
  return tier ? tier.percent : null;
};
