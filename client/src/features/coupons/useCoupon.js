import { useState } from 'react';
import { useValidateCouponQuery } from './couponsApi';

export const useCoupon = (subtotal) => {
  const [input, setInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  const query = useValidateCouponQuery(
    { code: appliedCode, subtotal },
    { skip: !appliedCode || subtotal <= 0 },
  );

  const apply = (code) => {
    const clean = (code ?? input).trim().toUpperCase();
    if (!clean) return;
    setInput(clean);
    setAppliedCode(clean);
  };

  const remove = () => {
    setInput('');
    setAppliedCode('');
  };

  const result = query.currentData;

  return {
    input,
    setInput,
    appliedCode,
    apply,
    remove,
    result,
    error: query.isError ? query.error : null,
    isChecking: Boolean(appliedCode) && subtotal > 0 && query.isFetching,
    code: result ? appliedCode : undefined,
    discount: result?.discount ?? 0,
  };
};
