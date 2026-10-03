import { COUPON_TYPE } from '../../src/constants/couponType.js';

export const coupons = [
  {
    code: 'WELCOME10',
    description: '10% off, up to ₹150',
    type: COUPON_TYPE.PERCENT,
    value: 10,
    maxDiscount: 150,
    minOrderAmount: 200,
    validFromOffsetDays: -1,
    validToOffsetDays: 90,
    usageLimit: 1000,
    perUserLimit: 1,
  },
  {
    code: 'FLAT50',
    description: 'Flat ₹50 off on orders above ₹300',
    type: COUPON_TYPE.FLAT,
    value: 50,
    minOrderAmount: 300,
    validFromOffsetDays: -1,
    validToOffsetDays: 60,
    perUserLimit: 3,
  },
  {
    code: 'EXPIRED20',
    description: 'Expired coupon, used for testing',
    type: COUPON_TYPE.PERCENT,
    value: 20,
    maxDiscount: 200,
    minOrderAmount: 0,
    validFromOffsetDays: -60,
    validToOffsetDays: -30,
    perUserLimit: 1,
  },
];
