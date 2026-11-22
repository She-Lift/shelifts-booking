import { ROLES, type User } from '@src/services/auth-service';
import { Navigate, Outlet } from 'react-router';
import { useGlobalContext } from '../context/GlobalContext';

type Props = {
  allowedRole: User['role'];
};

export default function ProtectedRoute({ allowedRole }: Props) {
  const { user } = useGlobalContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={ROLES[user.role]} replace />;
  }

  return <Outlet />;
}
