import { useGlobalContext } from '@src/context/global-context';
import { ROLE_ROUTES } from '@src/routes';
import { Navigate } from 'react-router';

export default function HomeRedirect() {
  const { user } = useGlobalContext();
  return <Navigate to={user ? ROLE_ROUTES[user.role] : '/login'} replace />;
}
