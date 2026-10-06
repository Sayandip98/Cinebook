import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import SearchField from '@/components/common/SearchField';
import Tag from '@/components/common/Tag';
import TheaterFormModal from '@/features/dashboard/TheaterFormModal';
import {
  useGetManageTheatersQuery,
  useUpdateTheaterMutation,
} from '@/features/dashboard/dashboardApi';
import { useAuth } from '@/hooks/useAuth';
import { useQueryState } from '@/hooks/useQueryState';
import { ROLES } from '@/constants/roles';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from '@/features/dashboard/dashboard.module.css';

const PAGE_SIZE = 10;

export default function StaffTheatersPage() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const { params, setParam, page } = useQueryState();
  const search = params.get('search') ?? '';

  const [form, setForm] = useState({ open: false, theater: null });
  const [toggle, setToggle] = useState(null);
  const [updateTheater, { isLoading: isToggling }] = useUpdateTheaterMutation();

  const { data, isLoading, isFetching } = useGetManageTheatersQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  const handleToggle = async () => {
    try {
      await updateTheater({ id: toggle.id, isActive: !toggle.isActive }).unwrap();
      toast.success(toggle.isActive ? 'Theater deactivated' : 'Theater activated');
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 6000 });
    } finally {
      setToggle(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Theater',
      render: (theater) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{theater.name}</span>
          <span className={styles.muted}>
            {theater.address}, {theater.city}
          </span>
        </div>
      ),
    },
    {
      key: 'amenities',
      header: 'Amenities',
      render: (theater) => (
        <span className={styles.muted}>{theater.amenities.slice(0, 3).join(', ') || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (theater) => (
        <Tag tone={theater.isActive ? 'success' : 'danger'}>
          {theater.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (theater) => (
        <div className={styles.actions}>
          <Button size="sm" variant="secondary" to={`/manage/theaters/${theater.id}/screens`}>
            Screens
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setForm({ open: true, theater })}>
            Edit
          </Button>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => setToggle(theater)}>
              {theater.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Theaters</h1>
          <p className={styles.sub}>
            {isAdmin ? 'All theaters on the platform.' : 'Theaters assigned to you.'}{' '}
            <Link to="/manage/shows">Manage shows</Link>
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setForm({ open: true, theater: null })}>
            <Plus size={16} /> Add theater
          </Button>
        )}
      </header>

      <div className={styles.toolbar}>
        <SearchField
          value={search}
          onSubmit={(value) => setParam('search', value)}
          placeholder="Search by name"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.theaters}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyIcon={Building2}
        emptyTitle="No theaters found"
        emptyMessage={isAdmin ? 'Add the first theater.' : 'No theater is assigned to you yet.'}
      />
      <Pagination meta={data?.meta} onPageChange={(value) => setParam('page', String(value))} />

      <TheaterFormModal
        open={form.open}
        theater={form.theater}
        onClose={() => setForm({ open: false, theater: null })}
      />
      <ConfirmDialog
        open={Boolean(toggle)}
        title={toggle?.isActive ? 'Deactivate this theater?' : 'Activate this theater?'}
        message={
          toggle?.isActive
            ? 'It disappears from the site. This only works when it has no upcoming shows.'
            : 'It becomes visible on the site again.'
        }
        confirmLabel={toggle?.isActive ? 'Deactivate' : 'Activate'}
        loading={isToggling}
        onConfirm={handleToggle}
        onCancel={() => setToggle(null)}
      />
    </>
  );
}
