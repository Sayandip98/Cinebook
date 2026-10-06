export const ROUTES = Object.freeze({
  HOME: '/',
  MOVIES: '/movies',
  THEATERS: '/theaters',
  BOOKINGS: '/bookings',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ADMIN: '/admin',
  MANAGE: '/manage',
});

export const movieDetailsPath = (slug) => `${ROUTES.MOVIES}/${slug}`;
export const theaterDetailsPath = (id) => `${ROUTES.THEATERS}/${id}`;

export const showSeatsPath = (showId) => `/shows/${showId}/seats`;
export const checkoutPath = (bookingId) => `/checkout/${bookingId}`;
export const bookingDetailsPath = (bookingId) => `${ROUTES.BOOKINGS}/${bookingId}`;