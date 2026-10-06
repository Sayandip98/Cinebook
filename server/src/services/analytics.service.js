import { ROLES } from '../constants/roles.js';
import { MOVIE_STATUS } from '../constants/movieStatus.js';
import { getDayRange } from '../utils/dateRange.js';
import * as analyticsRepository from '../repositories/analytics.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as theaterRepository from '../repositories/theater.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as movieRepository from '../repositories/movie.repository.js';
import * as paymentRepository from '../repositories/payment.repository.js';
import { getTheaterScope } from './staffScope.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SERIES_DAYS = 30;

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });

const toMoney = (value = 0) => Math.round(value * 100) / 100;

const summarize = (row) => ({
  revenue: toMoney(row?.revenue),
  bookings: row?.bookings ?? 0,
  tickets: row?.tickets ?? 0,
});

// Always returns SERIES_DAYS entries, with zeros for days that had no bookings.
const buildSeries = (rows, todayStart) => {
  const byDate = new Map(rows.map((row) => [row._id, row]));

  return Array.from({ length: SERIES_DAYS }, (_, index) => {
    const dayStart = new Date(todayStart.getTime() - (SERIES_DAYS - 1 - index) * MS_PER_DAY);
    const date = dateKeyFormatter.format(dayStart);
    const row = byDate.get(date);
    return { date, revenue: toMoney(row?.revenue), bookings: row?.bookings ?? 0 };
  });
};

const mapRanking = (rows) =>
  rows.map((row) => ({
    id: String(row.id),
    label: row.label,
    revenue: toMoney(row.revenue),
    tickets: row.tickets,
  }));

export const getDashboardStats = async (actor) => {
  const isAdmin = actor.role === ROLES.ADMIN;
  const theaterIds = await getTheaterScope(actor);

  const todayStart = getDayRange(dateKeyFormatter.format(new Date())).start;
  const seriesStart = new Date(todayStart.getTime() - (SERIES_DAYS - 1) * MS_PER_DAY);

  const [[facet], upcomingShows, theaterCount, adminCounts] = await Promise.all([
    analyticsRepository.getBookingStats({ theaterIds, todayStart, seriesStart }),
    showRepository.countUpcoming(theaterIds),
    isAdmin ? theaterRepository.count({ isActive: true }) : theaterIds.length,
    isAdmin
      ? Promise.all([
          userRepository.count({ isActive: true }),
          movieRepository.count({ status: MOVIE_STATUS.NOW_SHOWING }),
          paymentRepository.countPendingRefunds(),
        ])
      : null,
  ]);

  return {
    scope: actor.role,
    totals: summarize(facet.totals[0]),
    today: summarize(facet.today[0]),
    series: buildSeries(facet.daily, todayStart),
    topMovies: mapRanking(facet.topMovies),
    topTheaters: mapRanking(facet.topTheaters),
    counts: {
      upcomingShows,
      theaters: theaterCount,
      activeUsers: adminCounts?.[0],
      nowShowingMovies: adminCounts?.[1],
      pendingRefunds: adminCounts?.[2],
    },
  };
};
