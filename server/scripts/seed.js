/* eslint-disable no-console */
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import * as models from '../src/models/index.js';
import { MOVIE_STATUS } from '../src/constants/movieStatus.js';
import { SCREEN_TYPE } from '../src/constants/screenType.js';
import { adminUser, managerUsers, regularUsers, DEFAULT_USER_PASSWORD } from './seedData/users.js';
import { movies } from './seedData/movies.js';
import { theaters } from './seedData/theaters.js';
import { screenLayouts } from './seedData/screenLayouts.js';
import { coupons } from './seedData/coupons.js';
import { generateSeatList, calculateSeatPrice } from '../src/utils/seatLayout.js';

const { User, Movie, Theater, Screen, Show, Coupon, ShowSeat } = models;

const FRESH = process.argv.includes('--fresh');
const DAYS_AHEAD = 3;
const SLOT_START_TIMES = [
  [10, 0],
  [13, 30],
  [17, 0],
  [20, 30],
];
const BASE_PRICE_BY_FORMAT = {
  [SCREEN_TYPE.TWO_D]: 200,
  [SCREEN_TYPE.THREE_D]: 280,
  [SCREEN_TYPE.IMAX]: 350,
};
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

const summary = {};

const track = (collection, created) => {
  summary[collection] ??= { created: 0, existing: 0 };
  summary[collection][created ? 'created' : 'existing'] += 1;
};

const findOrCreate = async (collection, Model, filter, data) => {
  const existing = await Model.findOne(filter);
  if (existing) {
    track(collection, false);
    return existing;
  }
  const document = await Model.create(data);
  track(collection, true);
  return document;
};

const daysFromNow = (offsetDays) => new Date(Date.now() + offsetDays * MS_PER_DAY);

const clearAllCollections = async () => {
  await Promise.all(Object.values(models).map((Model) => Model.deleteMany({})));
  console.log('Cleared all collections (--fresh).');
};

const seedUsers = async () => {
  const usersByEmail = {};
  for (const userData of [adminUser, ...managerUsers, ...regularUsers]) {
    usersByEmail[userData.email] = await findOrCreate(
      'User',
      User,
      { email: userData.email },
      userData,
    );
  }
  return usersByEmail;
};

const seedMovies = async () => {
  const seeded = [];
  for (const { releaseOffsetDays, ...movieData } of movies) {
    seeded.push(
      await findOrCreate(
        'Movie',
        Movie,
        { title: movieData.title },
        {
          ...movieData,
          releaseDate: daysFromNow(releaseOffsetDays),
        },
      ),
    );
  }
  return seeded;
};

const seedTheatersAndScreens = async (usersByEmail) => {
  const seededScreens = [];

  for (const { managerEmail, coordinates, screens, ...theaterData } of theaters) {
    const theater = await findOrCreate(
      'Theater',
      Theater,
      { name: theaterData.name, city: theaterData.city },
      {
        ...theaterData,
        manager: usersByEmail[managerEmail]._id,
        location: { type: 'Point', coordinates },
      },
    );

    for (const screenData of screens) {
      const screen = await findOrCreate(
        'Screen',
        Screen,
        { theater: theater._id, name: screenData.name },
        {
          theater: theater._id,
          name: screenData.name,
          type: screenData.type,
          seatLayout: structuredClone(screenLayouts[screenData.layout]),
        },
      );
      seededScreens.push(screen);
    }
  }

  return seededScreens;
};

const ensureSeats = async (show, screen) => {
  if (await ShowSeat.exists({ show: show._id })) return;

  const seats = generateSeatList(screen.seatLayout).map((seat) => ({
    show: show._id,
    seatLabel: seat.seatLabel,
    row: seat.row,
    column: seat.column,
    category: seat.category,
    price: calculateSeatPrice(show.basePrice, seat.priceMultiplier),
  }));
  await ShowSeat.insertMany(seats);

  summary.ShowSeat ??= { created: 0, existing: 0 };
  summary.ShowSeat.created += seats.length;
};

const seedShows = async (seededMovies, seededScreens) => {
  const nowShowing = seededMovies.filter((movie) => movie.status === MOVIE_STATUS.NOW_SHOWING);
  if (nowShowing.length === 0) return;

  for (let screenIndex = 0; screenIndex < seededScreens.length; screenIndex += 1) {
    const screen = seededScreens[screenIndex];

    for (let day = 1; day <= DAYS_AHEAD; day += 1) {
      for (let slotIndex = 0; slotIndex < SLOT_START_TIMES.length; slotIndex += 1) {
        const [hours, minutes] = SLOT_START_TIMES[slotIndex];
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + day);
        startTime.setHours(hours, minutes, 0, 0);

        const movie = nowShowing[(screenIndex + day + slotIndex) % nowShowing.length];
        const endTime = new Date(startTime.getTime() + movie.durationMinutes * MS_PER_MINUTE);

        const show = await findOrCreate(
          'Show',
          Show,
          { screen: screen._id, startTime },
          {
            movie: movie._id,
            screen: screen._id,
            theater: screen.theater,
            startTime,
            endTime,
            language: movie.languages[0],
            format: screen.type,
            basePrice: BASE_PRICE_BY_FORMAT[screen.type],
          },
        );

        await ensureSeats(show, screen);
      }
    }
  }
};

const seedCoupons = async () => {
  for (const { validFromOffsetDays, validToOffsetDays, ...couponData } of coupons) {
    await findOrCreate(
      'Coupon',
      Coupon,
      { code: couponData.code },
      {
        ...couponData,
        validFrom: daysFromNow(validFromOffsetDays),
        validTo: daysFromNow(validToOffsetDays),
      },
    );
  }
};

const printSummary = () => {
  console.log('\nSeed summary');
  console.table(summary);
  console.log('Admin login:   ', adminUser.email, '/', adminUser.password);
  console.log('Manager login: ', managerUsers[0].email, '/', DEFAULT_USER_PASSWORD);
  console.log('User login:    ', regularUsers[0].email, '/', DEFAULT_USER_PASSWORD);
};

const run = async () => {
  if (env.isProduction) {
    console.error('Refusing to seed: NODE_ENV is production.');
    process.exit(1);
  }

  await connectDB();

  try {
    if (FRESH) await clearAllCollections();

    const usersByEmail = await seedUsers();
    const seededMovies = await seedMovies();
    const seededScreens = await seedTheatersAndScreens(usersByEmail);
    await seedShows(seededMovies, seededScreens);
    await seedCoupons();

    printSummary();
  } finally {
    await disconnectDB();
  }
};

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
