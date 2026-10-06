import { Ticket } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import SearchField from '@/components/common/SearchField';
import Tag from '@/components/common/Tag';
import StatusBadge from '@/features/bookings/StatusBadge';
import { useGetStaffBookingsQuery } from '@/features/dashboard/dashboardApi';
import { useQueryState } from '@/hooks/useQueryState';
import { BOOKING_STATUS_OPTIONS } from '@/constants/booking';
import { formatCurrency, formatShowDateTime } from '@/utils/format';
import styles from '@/features/dashboard/dashboard.module.css';

const PAGE_SIZE = 10;

export default function StaffBookingsPage() {
  const { params, setParam, page } = useQueryState();
  const status = BOOKING_STATUS_OPTIONS.some((option) => option.value === params.get('status'))
    ? params.get('status')
    : '';
  const search = params.get('search') ?? '';

  const { data, isLoading, isFetching } = useGetStaffBookingsQuery({
    page,
    limit: PAGE_SIZE,
    status: status || undefined,
    search: search || undefined,
  });

  const columns = [
    {
      key: 'code',
      header: 'Booking',
      render: (booking) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{booking.bookingCode}</span>
          <span className={styles.muted}>{formatShowDateTime(booking.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (booking) => (
        <div className={styles.cell}>
          <span>{booking.user?.name}</span>
          <span className={styles.muted}>{booking.user?.email}</span>
        </div>
      ),
    },
    {
      key: 'show',
      header: 'Show',
      render: (booking) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{booking.show.movie.title}</span>
          <span className={styles.muted}>
            {booking.show.theater.name} · {formatShowDateTime(booking.show.startTime)}
          </span>
        </div>
      ),
    },
    {
      key: 'seats',
      header: 'Seats',
      render: (booking) => booking.seats.map((seat) => seat.seatLabel).join(', '),
    },
    { key: 'amount', header: 'Amount', render: (booking) => formatCurrency(booking.totalAmount) },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: 'used',
      header: 'Entry',
      render: (booking) =>
        booking.checkedInAt ? (
          <Tag tone="success">Used</Tag>
        ) : (
          <span className={styles.muted}>-</span>
        ),
    },
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Bookings</h1>
          <p className={styles.sub}>{data ? `${data.meta.total} in total` : 'Loading'}</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <SearchField
          value={search}
          onSubmit={(value) => setParam('search', value)}
          placeholder="Booking code (e.g. CB4K)"
        />
        <FilterSelect
          label="Status"
          value={status}
          options={BOOKING_STATUS_OPTIONS}
          onChange={(value) => setParam('status', value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.bookings}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyIcon={Ticket}
        emptyTitle="No bookings found"
        emptyMessage="Try a different filter or code."
      />
      <Pagination meta={data?.meta} onPageChange={(value) => setParam('page', String(value))} />
    </>
  );
}
