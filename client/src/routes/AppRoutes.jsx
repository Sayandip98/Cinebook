import { Route, Routes } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { ROLES, STAFF_ROLES } from '@/constants/roles';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import GuestRoute from './GuestRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<PlaceholderPage title="Movies" phase="Phase 9" />} />
        <Route
          path="movies/:slug"
          element={<PlaceholderPage title="Movie details" phase="Phase 9" />}
        />
        <Route path="theaters" element={<PlaceholderPage title="Theaters" phase="Phase 9" />} />
        <Route path="theaters/:id" element={<PlaceholderPage title="Theater" phase="Phase 9" />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="bookings"
            element={<PlaceholderPage title="My bookings" phase="Phase 9" />}
          />
          <Route path="profile" element={<PlaceholderPage title="Profile" phase="Phase 9" />} />
        </Route>

        <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
          <Route
            path="admin/*"
            element={<PlaceholderPage title="Admin dashboard" phase="Phase 10" />}
          />
        </Route>
        <Route element={<RoleRoute roles={STAFF_ROLES} />}>
          <Route
            path="manage/*"
            element={<PlaceholderPage title="Manager dashboard" phase="Phase 10" />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
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
