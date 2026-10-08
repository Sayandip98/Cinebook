import { X } from 'lucide-react';
import Button from '@/components/common/Button';
import { formatCouponValue, formatCurrency } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useGetAvailableCouponsQuery } from './couponsApi';
import styles from './CouponBox.module.css';

export default function CouponBox({ coupon, disabled = false }) {
  const { data: available = [] } = useGetAvailableCouponsQuery();
  const { input, setInput, appliedCode, apply, remove, result, error, isChecking } = coupon;

  const handleSubmit = (event) => {
    event.preventDefault();
    apply();
  };

  return (
    <div className={styles.box}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value.toUpperCase())}
          placeholder="Coupon code"
          aria-label="Coupon code"
          maxLength={20}
          autoComplete="off"
          disabled={disabled || Boolean(appliedCode)}
        />
        {appliedCode ? (
          <Button variant="ghost" size="sm" onClick={remove} disabled={disabled}>
            <X size={14} /> Remove
          </Button>
        ) : (
          <Button type="submit" variant="secondary" size="sm" disabled={!input.trim() || disabled}>
            Apply
          </Button>
        )}
      </form>

      {isChecking && <p className={styles.muted}>Checking coupon...</p>}
      {result && !isChecking && (
        <p className={styles.ok}>
          {result.code} applied. You save {formatCurrency(result.discount)}.
        </p>
      )}
      {error && !isChecking && (
        <p className={styles.bad} role="alert">
          {getErrorMessage(error)} It will not be applied.
        </p>
      )}
      {appliedCode && !result && !error && !isChecking && (
        <p className={styles.muted}>Select seats to apply this coupon.</p>
      )}

      {!appliedCode && available.length > 0 && (
        <ul className={styles.chips}>
          {available.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={styles.chip}
                onClick={() => apply(item.code)}
                disabled={disabled}
              >
                {item.code}
                <small>{formatCouponValue(item)}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
