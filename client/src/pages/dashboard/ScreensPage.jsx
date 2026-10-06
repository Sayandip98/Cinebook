import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Armchair, Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable from '@/components/common/DataTable';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import ScreenFormModal from '@/features/dashboard/ScreenFormModal';
import { useDeactivateScreenMutation, useGetScreensQuery } from '@/features/dashboard/dashboardApi';
import { useGetTheaterQuery } from '@/features/theaters/theatersApi';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from '@/features/dashboard/dashboard.module.css';

export default function ScreensPage() {
  const { id } = useParams();
  const theater = useGetTheaterQuery(id);
  const screens = useGetScreensQuery(id);
  const [formOpen, setFormOpen] = useState(false);
  const [toRemove, setToRemove] = useState(null);
  const [deactivate, { isLoading: isRemoving }] = useDeactivateScreenMutation();

  if (theater.isLoading) return <Loader label="Loading theater" />;
  if (theater.isError) {
    return (
      <EmptyState
        icon={Armchair}
        title="Theater not available"
        message="It may be inactive or not exist."
        action={<Button to="/manage/theaters">Back to theaters</Button>}
      />
    );
  }

  const handleRemove = async () => {
    try {
      await deactivate(toRemove.id).unwrap();
      toast.success('Screen deactivated');
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 6000 });
    } finally {
      setToRemove(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Screen',
      render: (screen) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{screen.name}</span>
          <span className={styles.muted}>{screen.type}</span>
        </div>
      ),
    },
    {
      key: 'layout',
      header: 'Layout',
      render: (screen) => `${screen.seatLayout.rows} rows x ${screen.seatLayout.columns} seats`,
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (screen) => (
        <span className={styles.muted}>
          {screen.seatLayout.categories
            .map((category) => `${category.name} (x${category.priceMultiplier})`)
            .join(', ')}
        </span>
      ),
    },
    { key: 'seats', header: 'Seats', render: (screen) => screen.totalSeats },
    {
      key: 'actions',
      header: '',
      render: (screen) => (
        <Button size="sm" variant="ghost" onClick={() => setToRemove(screen)}>
          Deactivate
        </Button>
      ),
    },
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>{theater.data.name}: screens</h1>
          <p className={styles.sub}>
            <Link to="/manage/theaters">Back to theaters</Link>
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Add screen
        </Button>
      </header>

      <DataTable
        columns={columns}
        rows={screens.data}
        isLoading={screens.isLoading}
        isFetching={screens.isFetching}
        emptyIcon={Armchair}
        emptyTitle="No screens yet"
        emptyMessage="Add a screen so you can schedule shows."
      />

      <ScreenFormModal open={formOpen} theaterId={id} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Deactivate this screen?"
        message="It can no longer host new shows. This only works when it has no upcoming shows."
        confirmLabel="Deactivate"
        loading={isRemoving}
        onConfirm={handleRemove}
        onCancel={() => setToRemove(null)}
      />
    </>
  );
}
