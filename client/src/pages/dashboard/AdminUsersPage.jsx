import { useState } from 'react';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable from '@/components/common/DataTable';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import SearchField from '@/components/common/SearchField';
import Tag from '@/components/common/Tag';
import {
  useChangeUserRoleMutation,
  useChangeUserStatusMutation,
  useGetAdminUsersQuery,
} from '@/features/dashboard/dashboardApi';
import { useAuth } from '@/hooks/useAuth';
import { useQueryState } from '@/hooks/useQueryState';
import { ROLES } from '@/constants/roles';
import { formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from '@/features/dashboard/dashboard.module.css';

const PAGE_SIZE = 10;
const ROLE_OPTIONS = [
  { value: ROLES.USER, label: 'User' },
  { value: ROLES.THEATER_MANAGER, label: 'Theater manager' },
  { value: ROLES.ADMIN, label: 'Admin' },
];
const ROLE_FILTER = [{ value: '', label: 'All roles' }, ...ROLE_OPTIONS];
const ACTIVE_FILTER = [
  { value: '', label: 'Any status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Disabled' },
];

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { params, setParam, page } = useQueryState();
  const search = params.get('search') ?? '';
  const role = ROLE_FILTER.some((o) => o.value === params.get('role')) ? params.get('role') : '';
  const isActive = ACTIVE_FILTER.some((o) => o.value === params.get('active'))
    ? params.get('active')
    : '';

  const [pending, setPending] = useState(null);
  const [changeRole, { isLoading: isChangingRole }] = useChangeUserRoleMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeUserStatusMutation();

  const { data, isLoading, isFetching } = useGetAdminUsersQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role: role || undefined,
    isActive: isActive || undefined,
  });

  const handleConfirm = async () => {
    try {
      if (pending.type === 'role') {
        await changeRole({ id: pending.user.id, role: pending.value }).unwrap();
        toast.success('Role updated');
      } else {
        await changeStatus({ id: pending.user.id, isActive: pending.value }).unwrap();
        toast.success(pending.value ? 'Account activated' : 'Account disabled');
      }
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 6000 });
    } finally {
      setPending(null);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className={styles.cell}>
          <span className={styles.cellMain}>{user.name}</span>
          <span className={styles.muted}>{user.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) =>
        user.id === me.id ? (
          <Tag tone="warning">{user.role} (you)</Tag>
        ) : (
          <FilterSelect
            label={`Role for ${user.name}`}
            value={user.role}
            options={ROLE_OPTIONS}
            onChange={(value) => value !== user.role && setPending({ type: 'role', user, value })}
          />
        ),
    },
    {
      key: 'verified',
      header: 'Email',
      render: (user) => (
        <Tag tone={user.isVerified ? 'success' : 'warning'}>
          {user.isVerified ? 'Verified' : 'Unverified'}
        </Tag>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <Tag tone={user.isActive ? 'success' : 'danger'}>
          {user.isActive ? 'Active' : 'Disabled'}
        </Tag>
      ),
    },
    { key: 'joined', header: 'Joined', render: (user) => formatDate(user.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (user) => (
        <Button
          size="sm"
          variant="ghost"
          disabled={user.id === me.id}
          onClick={() => setPending({ type: 'status', user, value: !user.isActive })}
        >
          {user.isActive ? 'Disable' : 'Enable'}
        </Button>
      ),
    },
  ];

  const message =
    pending?.type === 'role'
      ? `${pending.user.name} becomes ${pending.value}. They are signed out everywhere and see their new access on the next login.`
      : pending?.value
        ? `${pending?.user.name} will be able to sign in again.`
        : `${pending?.user.name} is signed out everywhere and cannot sign in until re-enabled.`;

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.sub}>{data ? `${data.meta.total} accounts` : 'Loading'}</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <SearchField
          value={search}
          onSubmit={(v) => setParam('search', v)}
          placeholder="Name or email"
        />
        <FilterSelect
          label="Role"
          value={role}
          options={ROLE_FILTER}
          onChange={(v) => setParam('role', v)}
        />
        <FilterSelect
          label="Status"
          value={isActive}
          options={ACTIVE_FILTER}
          onChange={(v) => setParam('active', v)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.users}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyIcon={Users}
        emptyTitle="No users found"
      />
      <Pagination meta={data?.meta} onPageChange={(value) => setParam('page', String(value))} />

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.type === 'role' ? 'Change role?' : 'Change account status?'}
        message={message}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        loading={isChangingRole || isChangingStatus}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
