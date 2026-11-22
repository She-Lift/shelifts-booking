import { useGlobalContext } from '@src/context/GlobalContext';
import { type User } from '@src/services/auth-service';
import { ROLE_ROUTES } from '@src/utils/role-routes';
import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
  allowedRole: User['role'];
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { user } = useGlobalContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={ROLE_ROUTES[user.role]} replace />;
  }

  return <Outlet />;
}
