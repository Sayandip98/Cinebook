export const MOVIE_SORT_OPTIONS = Object.freeze({
  newest: { releaseDate: -1, _id: 1 },
  oldest: { releaseDate: 1, _id: 1 },
  title_asc: { title: 1, _id: 1 },
  title_desc: { title: -1, _id: 1 },
  rating_desc: { ratingAverage: -1, ratingCount: -1, _id: 1 },
});

export const THEATER_SORT_OPTIONS = Object.freeze({
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
});

export const SHOW_SORT_OPTIONS = Object.freeze({
  time_asc: { startTime: 1, _id: 1 },
  time_desc: { startTime: -1, _id: 1 },
  price_asc: { basePrice: 1, startTime: 1, _id: 1 },
  price_desc: { basePrice: -1, startTime: 1, _id: 1 },
});

export const MOVIE_SORT_KEYS = Object.freeze(Object.keys(MOVIE_SORT_OPTIONS));
export const THEATER_SORT_KEYS = Object.freeze(Object.keys(THEATER_SORT_OPTIONS));
export const SHOW_SORT_KEYS = Object.freeze(Object.keys(SHOW_SORT_OPTIONS));
