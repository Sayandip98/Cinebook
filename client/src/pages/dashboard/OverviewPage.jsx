import {
  Banknote,
  Building2,
  CalendarClock,
  RotateCcw,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import RankedList from '@/features/dashboard/RankedList';
import RevenueChart from '@/features/dashboard/RevenueChart';
import StatCard from '@/features/dashboard/StatCard';
import { useGetStatsQuery } from '@/features/dashboard/dashboardApi';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { formatCurrency } from '@/utils/format';
import charts from '@/features/dashboard/charts.module.css';
import styles from '@/features/dashboard/dashboard.module.css';

export default function OverviewPage() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const { data, isLoading, isError } = useGetStatsQuery(undefined, {
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
  });

  if (isLoading) return <Loader label="Loading dashboard" />;
  if (isError) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Could not load the dashboard"
        message="Please check that the API is running and try again."
      />
    );
  }

  const { totals, today, counts, series, topMovies, topTheaters } = data;

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>{isAdmin ? 'Platform overview' : 'Your theaters'}</h1>
          <p className={styles.sub}>Revenue counts confirmed bookings only. Dates are in IST.</p>
        </div>
      </header>

      <div className={charts.stats}>
        <StatCard
          icon={Banknote}
          label="Total revenue"
          value={formatCurrency(totals.revenue)}
          hint={`${totals.bookings} bookings`}
        />
        <StatCard
          icon={TrendingUp}
          label="Today's revenue"
          value={formatCurrency(today.revenue)}
          hint={`${today.bookings} bookings today`}
        />
        <StatCard
          icon={Ticket}
          label="Tickets sold"
          value={totals.tickets}
          hint={`${today.tickets} today`}
        />
        <StatCard icon={CalendarClock} label="Upcoming shows" value={counts.upcomingShows} />
        <StatCard
          icon={Building2}
          label={isAdmin ? 'Active theaters' : 'Your theaters'}
          value={counts.theaters}
        />
        {isAdmin && (
          <StatCard
            icon={Users}
            label="Active users"
            value={counts.activeUsers}
            hint={`${counts.nowShowingMovies} movies now showing`}
          />
        )}
        {isAdmin && (
          <StatCard
            icon={RotateCcw}
            label="Refunds waiting"
            value={counts.pendingRefunds}
            warn={counts.pendingRefunds > 0}
            to="/admin/refunds"
          />
        )}
      </div>

      <section className={charts.panel} style={{ marginTop: 'var(--space-4)' }}>
        <h2 className={charts.panelTitle}>Revenue, last 30 days</h2>
        <RevenueChart series={series} />
      </section>

      <div className={charts.twoCol}>
        <RankedList title="Top movies" items={topMovies} />
        <RankedList title="Top theaters" items={topTheaters} />
      </div>
    </>
  );
}
