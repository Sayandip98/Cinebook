import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { ROLES, STAFF_ROLES } from '@/constants/roles';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import GuestRoute from './GuestRoute';

import MoviesPage from '@/pages/MoviesPage';
import MovieDetailsPage from '@/pages/MovieDetailsPage';
import TheatersPage from '@/pages/TheatersPage';
import TheaterDetailsPage from '@/pages/TheaterDetailsPage';
import SeatSelectionPage from '@/pages/SeatSelectionPage';
import CheckoutPage from '@/pages/CheckoutPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import BookingDetailsPage from '@/pages/BookingDetailsPage';
import ProfilePage from '@/pages/ProfilePage';

import { ROUTES } from '@/constants/routes';
import DashboardLayout from '@/layouts/DashboardLayout';
import OverviewPage from '@/pages/dashboard/OverviewPage';
import StaffBookingsPage from '@/pages/dashboard/StaffBookingsPage';
import StaffShowsPage from '@/pages/dashboard/StaffShowsPage';
import StaffTheatersPage from '@/pages/dashboard/StaffTheatersPage';
import ScreensPage from '@/pages/dashboard/ScreensPage';
import CheckInPage from '@/pages/dashboard/CheckInPage';
import AdminUsersPage from '@/pages/dashboard/AdminUsersPage';
import AdminMoviesPage from '@/pages/dashboard/AdminMoviesPage';
import AdminRefundsPage from '@/pages/dashboard/AdminRefundsPage';

import NotificationsPage from '@/pages/NotificationsPage';
import AdminCouponsPage from '@/pages/dashboard/AdminCouponsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/:slug" element={<MovieDetailsPage />} />
        <Route path="theaters" element={<TheatersPage />} />
        <Route path="theaters/:id" element={<TheaterDetailsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="shows/:id/seats" element={<SeatSelectionPage />} />
          <Route path="checkout/:id" element={<CheckoutPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<RoleRoute roles={STAFF_ROLES} />}>
        <Route element={<DashboardLayout />}>
          <Route path="manage" element={<OverviewPage />} />
          <Route path="manage/bookings" element={<StaffBookingsPage />} />
          <Route path="manage/shows" element={<StaffShowsPage />} />
          <Route path="manage/theaters" element={<StaffTheatersPage />} />
          <Route path="manage/theaters/:id/screens" element={<ScreensPage />} />
          <Route path="manage/check-in" element={<CheckInPage />} />

          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route path="admin" element={<Navigate to={ROUTES.MANAGE} replace />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/movies" element={<AdminMoviesPage />} />
            <Route path="admin/refunds" element={<AdminRefundsPage />} />
            <Route path="admin/coupons" element={<AdminCouponsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
    </Routes>
  );
}
