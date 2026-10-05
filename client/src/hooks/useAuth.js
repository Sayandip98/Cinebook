import { useSelector } from 'react-redux';
import { selectAuthReady, selectCurrentUser } from '@/features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isReady = useSelector(selectAuthReady);
  return { user, isReady, isAuthenticated: Boolean(user), role: user?.role };
};
