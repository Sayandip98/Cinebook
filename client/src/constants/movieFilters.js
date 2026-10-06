export const MOVIE_STATUS_OPTIONS = [
  { value: '', label: 'All movies' },
  { value: 'NOW_SHOWING', label: 'Now showing' },
  { value: 'UPCOMING', label: 'Coming soon' },
  { value: 'ENDED', label: 'Ended' },
];

export const MOVIE_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'rating_desc', label: 'Top rated' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
];

const toOptions = (allLabel, values) => [
  { value: '', label: allLabel },
  ...values.map((value) => ({ value, label: value })),
];

export const MOVIE_GENRE_OPTIONS = toOptions('All genres', [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
]);

export const MOVIE_LANGUAGE_OPTIONS = toOptions('All languages', [
  'English',
  'Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
]);
