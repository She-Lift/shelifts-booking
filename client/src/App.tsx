import GlobalProvider from '@src/context/GlobalProvider';
import type { User } from '@src/services/auth-service';
import { Outlet, useLoaderData } from 'react-router';

export default function App() {
  const { user } = useLoaderData<{ user: User | null }>();

  return (
    <GlobalProvider initialUser={user}>
      <Outlet />
    </GlobalProvider>
  );
}
