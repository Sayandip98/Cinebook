import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, TicketPercent } from 'lucide-react';
import Button from '@/components/common/Button';
import DataTable from '@/components/common/DataTable';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import SearchField from '@/components/common/SearchField';
import Tag from '@/components/common/Tag';
import CouponFormModal from '@/features/coupons/CouponFormModal';
import { useGetAdminCouponsQuery, useUpdateCouponMutation } from '@/features/coupons/couponsApi';
import { useQueryState } from '@/hooks/useQueryState';
import { formatCouponValue, formatCurrency, formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from '@/features/dashboard/dashboard.module.css';

const PAGE_SIZE = 10;
const ACTIVE_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
];

const getState = (coupon) => {
  const now = Date.now();
  if (!coupon.isActive) return { label: 'Disabled', tone: 'neutral' };
  if (new Date(coupon.validTo).getTime() < now) return { label: 'Expired', tone: 'danger' };
  if (new Date(coupon.validFrom).getTime() > now) return { label: 'Scheduled', tone: 'warning' };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { label: 'Fully used', tone: 'warning' };
  }
  return { label: 'Active', tone: 'success' };
};

export default function AdminCouponsPage() {
  const { params, setParam, page } = useQueryState();
  const search = params.get('search') ?? '';
  const active = ACTIVE_OPTIONS.some((option) => option.value === params.get('active'))
    ? params.get('active')
    : '';

  const [form, setForm] = useState({ open: false, coupon: null });
  const [updateCoupon] = useUpdateCouponMutation();

  const { data, isLoading, isFetching } = useGetAdminCouponsQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    isActive: active || undefined,
  });

  const handleToggle = async (coupon) => {
    try {
      await updateCoupon({ id: coupon.id, isActive: !coupon.isActive }).unwrap();
      toast.success(coupon.isActive ? 'Coupon disabled' : 'Coupon enabled');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Coupon',
      render: (coupon) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{coupon.code}</span>
          <span className={styles.muted}>{coupon.description || formatCouponValue(coupon)}</span>
        </div>
      ),
    },
    { key: 'discount', header: 'Discount', render: (coupon) => formatCouponValue(coupon) },
    {
      key: 'min',
      header: 'Min order',
      render: (coupon) => (coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : '-'),
    },
    {
      key: 'validity',
      header: 'Valid',
      render: (coupon) => (
        <span className={styles.muted}>
          {formatDate(coupon.validFrom)} to {formatDate(coupon.validTo)}
        </span>
      ),
    },
    {
      key: 'usage',
      header: 'Used',
      render: (coupon) =>
        `${coupon.usedCount} / ${coupon.usageLimit ?? 'unlimited'} (${coupon.perUserLimit} per user)`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (coupon) => {
        const { label, tone } = getState(coupon);
        return <Tag tone={tone}>{label}</Tag>;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (coupon) => (
        <div className={styles.actions}>
          <Button size="sm" variant="secondary" onClick={() => setForm({ open: true, coupon })}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleToggle(coupon)}>
            {coupon.isActive ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Coupons</h1>
          <p className={styles.sub}>
            Coupons are disabled, never deleted, so past bookings keep their discount history.
          </p>
        </div>
        <Button onClick={() => setForm({ open: true, coupon: null })}>
          <Plus size={16} /> Add coupon
        </Button>
      </header>

      <div className={styles.toolbar}>
        <SearchField
          value={search}
          onSubmit={(value) => setParam('search', value)}
          placeholder="Search by code"
        />
        <FilterSelect
          label="Status"
          value={active}
          options={ACTIVE_OPTIONS}
          onChange={(value) => setParam('active', value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.coupons}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyIcon={TicketPercent}
        emptyTitle="No coupons found"
        emptyMessage="Create the first coupon."
      />
      <Pagination meta={data?.meta} onPageChange={(value) => setParam('page', String(value))} />

      <CouponFormModal
        open={form.open}
        coupon={form.coupon}
        onClose={() => setForm({ open: false, coupon: null })}
      />
    </>
  );
}
