import { useState } from 'react';
import toast from 'react-hot-toast';
import { CircleCheck } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/features/bookings/StatusBadge';
import { useGetRefundsQuery, useRetryRefundMutation } from '@/features/dashboard/dashboardApi';
import { useQueryState } from '@/hooks/useQueryState';
import { formatCurrency, formatShowDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from '@/features/dashboard/dashboard.module.css';

const PAGE_SIZE = 10;

// A cancelled paid booking refunds its recorded amount; every other case refunds the full payment.
const getRefundRupees = (payment) =>
  payment.booking?.status === 'CANCELLED' && payment.booking.refundAmount > 0
    ? payment.booking.refundAmount
    : payment.amount / 100;

export default function AdminRefundsPage() {
  const { setParam, page } = useQueryState();
  const [target, setTarget] = useState(null);
  const [retryRefund, { isLoading: isRetrying }] = useRetryRefundMutation();

  const { data, isLoading, isFetching } = useGetRefundsQuery({ page, limit: PAGE_SIZE });

  const handleRetry = async () => {
    try {
      await retryRefund(target.id).unwrap();
      toast.success('Refund processed');
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 8000 });
    } finally {
      setTarget(null);
    }
  };

  const columns = [
    {
      key: 'booking',
      header: 'Booking',
      render: (payment) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{payment.booking?.bookingCode ?? 'Unknown'}</span>
          {payment.booking && <StatusBadge status={payment.booking.status} />}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (payment) => (
        <div className={styles.cell}>
          <span>{payment.user?.name}</span>
          <span className={styles.muted}>{payment.user?.email}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'To refund',
      render: (payment) => formatCurrency(getRefundRupees(payment)),
    },
    {
      key: 'reason',
      header: 'Last failure',
      render: (payment) => <span className={styles.muted}>{payment.failureReason}</span>,
    },
    { key: 'when', header: 'Updated', render: (payment) => formatShowDateTime(payment.updatedAt) },
    {
      key: 'actions',
      header: '',
      render: (payment) => (
        <Button size="sm" onClick={() => setTarget(payment)}>
          Retry refund
        </Button>
      ),
    },
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Refunds waiting</h1>
          <p className={styles.sub}>
            Automatic refunds that failed. Retrying sends the refund to Razorpay again.
          </p>
        </div>
      </header>

      <DataTable
        columns={columns}
        rows={data?.payments}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyIcon={CircleCheck}
        emptyTitle="No refunds waiting"
        emptyMessage="Every automatic refund went through."
      />
      <Pagination meta={data?.meta} onPageChange={(value) => setParam('page', String(value))} />

      <ConfirmDialog
        open={Boolean(target)}
        title="Retry this refund?"
        message={`${formatCurrency(target ? getRefundRupees(target) : 0)} will be refunded to ${target?.user?.name ?? 'the customer'}'s original payment method.`}
        confirmLabel="Refund now"
        cancelLabel="Not now"
        loading={isRetrying}
        onConfirm={handleRetry}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
