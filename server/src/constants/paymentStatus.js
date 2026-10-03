export const PAYMENT_STATUS = Object.freeze({
  CREATED: 'CREATED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

export const PAYMENT_STATUS_VALUES = Object.freeze(Object.values(PAYMENT_STATUS));

export const PAYMENT_PROVIDER = Object.freeze({
  RAZORPAY: 'RAZORPAY',
});

export const PAYMENT_PROVIDER_VALUES = Object.freeze(Object.values(PAYMENT_PROVIDER));
