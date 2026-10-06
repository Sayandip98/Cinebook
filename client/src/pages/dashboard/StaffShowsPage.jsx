import { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable from '@/components/common/DataTable';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import Tag from '@/components/common/Tag';
import ShowFormModal from '@/features/dashboard/ShowFormModal';
import { useCancelShowMutation, useGetStaffShowsQuery } from '@/features/dashboard/dashboardApi';
import { useQueryState } from '@/hooks/useQueryState';
import { formatCurrency, formatShowDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from '@/features/dashboard/dashboard.module.css';

const PAGE_SIZE = 10;
const WHEN_OPTIONS = [
  { value: '', label: 'All shows' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const getDisplayStatus = (show) => {
  if (show.status === 'CANCELLED') return { label: 'Cancelled', tone: 'danger' };
  if (new Date(show.endTime) < new Date()) return { label: 'Ended', tone: 'neutral' };
  return { label: 'Scheduled', tone: 'success' };
};

export default function StaffShowsPage() {
  const { params, setParam, page } = useQueryState();
  const when = WHEN_OPTIONS.some((option) => option.value === params.get('when'))
    ? params.get('when')
    : 'upcoming';
  const status = STATUS_OPTIONS.some((option) => option.value === params.get('status'))
    ? params.get('status')
    : '';

  const [form, setForm] = useState({ open: false, show: null });
  const [toCancel, setToCancel] = useState(null);
  const [cancelShow, { isLoading: isCancelling }] = useCancelShowMutation();

  const { data, isLoading, isFetching } = useGetStaffShowsQuery({
    page,
    limit: PAGE_SIZE,
    when: when || undefined,
    status: status || undefined,
  });

  const handleCancel = async () => {
    try {
      await cancelShow(toCancel.id).unwrap();
      toast.success('Show cancelled');
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 6000 });
    } finally {
      setToCancel(null);
    }
  };

  const columns = [
    {
      key: 'movie',
      header: 'Movie',
      render: (show) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{show.movie.title}</span>
          <span className={styles.muted}>
            {show.format} · {show.language}
          </span>
        </div>
      ),
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (show) => (
        <div className={styles.cell}>
          <span>{show.theater.name}</span>
          <span className={styles.muted}>{show.screen.name}</span>
        </div>
      ),
    },
    { key: 'start', header: 'Starts', render: (show) => formatShowDateTime(show.startTime) },
    { key: 'price', header: 'Base price', render: (show) => formatCurrency(show.basePrice) },
    {
      key: 'status',
      header: 'Status',
      render: (show) => {
        const { label, tone } = getDisplayStatus(show);
        return <Tag tone={tone}>{label}</Tag>;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (show) => {
        const editable = show.status === 'SCHEDULED' && new Date(show.startTime) > new Date();
        return (
          <div className={styles.actions}>
            <Button
              size="sm"
              variant="secondary"
              disabled={!editable}
              onClick={() => setForm({ open: true, show })}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!editable}
              onClick={() => setToCancel(show)}
            >
              Cancel
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Shows</h1>
          <p className={styles.sub}>Shows with bookings cannot be edited or cancelled yet.</p>
        </div>
        <Button onClick={() => setForm({ open: true, show: null })}>
          <Plus size={16} /> Add show
        </Button>
      </header>

      <div className={styles.toolbar}>
        <FilterSelect
          label="When"
          value={when}
          options={WHEN_OPTIONS}
          onChange={(v) => setParam('when', v || 'all')}
        />
        <FilterSelect
          label="Status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(v) => setParam('status', v)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.shows}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyIcon={CalendarClock}
        emptyTitle="No shows found"
        emptyMessage="Add a show, or change the filters."
      />
      <Pagination meta={data?.meta} onPageChange={(value) => setParam('page', String(value))} />

      <ShowFormModal
        open={form.open}
        show={form.show}
        onClose={() => setForm({ open: false, show: null })}
      />
      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel this show?"
        message="The show disappears from the site. This only works while it has no bookings."
        confirmLabel="Cancel show"
        loading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setToCancel(null)}
      />
    </>
  );
}
