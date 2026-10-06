import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CalendarX } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Skeleton from '@/components/common/Skeleton';
import { selectCity } from '@/features/ui/uiSlice';
import { movieDetailsPath, showSeatsPath, theaterDetailsPath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { buildDateOptions, formatCurrency, formatDuration, formatShowTime } from '@/utils/format';
import { useGetShowsQuery } from './showsApi';
import styles from './ShowsBrowser.module.css';

const MAX_SHOWS = 50;

const GROUPERS = {
  theater: (show) => ({
    key: show.theater.id,
    title: show.theater.name,
    subtitle: `${show.theater.address}, ${show.theater.city}`,
    to: theaterDetailsPath(show.theater.id),
  }),
  movie: (show) => ({
    key: show.movie.id,
    title: show.movie.title,
    subtitle: `${show.movie.certificate} · ${formatDuration(show.movie.durationMinutes)}`,
    to: movieDetailsPath(show.movie.slug),
  }),
};

const groupShows = (shows, groupBy) => {
  const groups = new Map();
  shows.forEach((show) => {
    const info = GROUPERS[groupBy](show);
    if (!groups.has(info.key)) groups.set(info.key, { ...info, shows: [] });
    groups.get(info.key).shows.push(show);
  });
  return [...groups.values()];
};

function DateTabs({ dates, value, onChange }) {
  return (
    <div className={styles.dates} role="group" aria-label="Choose a date">
      {dates.map((item) => (
        <button
          key={item.value}
          type="button"
          className={cx(styles.date, item.value === value && styles.dateActive)}
          onClick={() => onChange(item.value)}
          aria-pressed={item.value === value}
        >
          <small>{item.weekday}</small>
          <strong>{item.day}</strong>
          <small>{item.month}</small>
        </button>
      ))}
    </div>
  );
}

export default function ShowsBrowser({ filters, groupBy, applyCity = false }) {
  const city = useSelector(selectCity);
  const dates = useMemo(() => buildDateOptions(7), []);
  const [date, setDate] = useState(dates[0].value);
  const activeCity = applyCity && city ? city : undefined;

  const { data, isLoading, isFetching, isError } = useGetShowsQuery({
    ...filters,
    city: activeCity,
    date,
    limit: MAX_SHOWS,
    sort: 'time_asc',
  });

  const groups = useMemo(() => groupShows(data?.shows ?? [], groupBy), [data, groupBy]);

  let content;
  if (isLoading) {
    content = (
      <div className={styles.groups}>
        <Skeleton style={{ height: '7rem' }} />
        <Skeleton style={{ height: '7rem' }} />
      </div>
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={CalendarX}
        title="Could not load showtimes"
        message="Please check that the API is running and try again."
      />
    );
  } else if (groups.length === 0) {
    content = (
      <EmptyState
        icon={CalendarX}
        title="No shows on this date"
        message={
          activeCity
            ? `Nothing scheduled in ${activeCity}. Try another date or choose All cities in the top bar.`
            : 'Try another date.'
        }
      />
    );
  } else {
    content = (
      <div className={cx(styles.groups, isFetching && styles.busy)}>
        {groups.map((group) => (
          <article key={group.key} className={styles.group}>
            <header>
              <h3 className={styles.groupTitle}>
                <Link to={group.to}>{group.title}</Link>
              </h3>
              <p className={styles.groupSub}>{group.subtitle}</p>
            </header>
            <ul className={styles.times}>
              {group.shows.map((show) => (
                <li key={show.id}>
                  <Link to={showSeatsPath(show.id)} className={styles.pill}>
                    <span className={styles.time}>{formatShowTime(show.startTime)}</span>
                    <span className={styles.pillMeta}>
                      {show.format} · {show.language}
                    </span>
                    <span className={styles.pillMeta}>{formatCurrency(show.basePrice)}+</span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
        {data?.meta?.total > MAX_SHOWS && (
          <p className={styles.groupSub}>Showing the first {MAX_SHOWS} shows of the day.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <DateTabs dates={dates} value={date} onChange={setDate} />
      {content}
    </div>
  );
}
