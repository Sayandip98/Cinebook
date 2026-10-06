import Booking from '../models/booking.model.js';
import Show from '../models/show.model.js';
import Movie from '../models/movie.model.js';
import Theater from '../models/theater.model.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

const TIMEZONE = 'Asia/Kolkata';

const totalsGroup = {
  $group: {
    _id: null,
    revenue: { $sum: '$totalAmount' },
    bookings: { $sum: 1 },
    tickets: { $sum: { $size: '$seats' } },
  },
};

const ranking = ({ groupBy, from, labelField }) => [
  {
    $group: {
      _id: groupBy,
      revenue: { $sum: '$totalAmount' },
      tickets: { $sum: { $size: '$seats' } },
    },
  },
  { $sort: { revenue: -1 } },
  { $limit: 5 },
  { $lookup: { from, localField: '_id', foreignField: '_id', as: 'entity' } },
  { $unwind: '$entity' },
  { $project: { _id: 0, id: '$_id', label: `$entity.${labelField}`, revenue: 1, tickets: 1 } },
];

// theaterIds: array to restrict to a manager's theaters, or null for everything.
export const getBookingStats = ({ theaterIds, todayStart, seriesStart }) => {
  const pipeline = [
    { $match: { status: BOOKING_STATUS.CONFIRMED } },
    {
      $lookup: {
        from: Show.collection.name,
        localField: 'show',
        foreignField: '_id',
        as: 'showDoc',
      },
    },
    { $unwind: '$showDoc' },
  ];

  if (theaterIds) pipeline.push({ $match: { 'showDoc.theater': { $in: theaterIds } } });

  pipeline.push({
    $facet: {
      totals: [totalsGroup],
      today: [{ $match: { createdAt: { $gte: todayStart } } }, totalsGroup],
      daily: [
        { $match: { createdAt: { $gte: seriesStart } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TIMEZONE },
            },
            revenue: { $sum: '$totalAmount' },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ],
      topMovies: ranking({
        groupBy: '$showDoc.movie',
        from: Movie.collection.name,
        labelField: 'title',
      }),
      topTheaters: ranking({
        groupBy: '$showDoc.theater',
        from: Theater.collection.name,
        labelField: 'name',
      }),
    },
  });

  return Booking.aggregate(pipeline);
};
