import { useGlobalContext } from '@src/context/GlobalContext';
import { ROLE_ROUTES } from '@src/utils/role-routes';
import { Navigate } from 'react-router';

export default function HomeRedirect() {
  const { user } = useGlobalContext();
  return <Navigate to={user ? ROLE_ROUTES[user.role] : '/login'} replace />;
}
