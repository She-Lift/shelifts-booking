import Navbar from '@src/components/Navbar';
import GlobalProvider from '@src/context/GlobalProvider';
import { type RootLoaderData } from '@src/loaders/root-loader';
import { Outlet, useLoaderData } from 'react-router';

export default function App() {
  const { user } = useLoaderData<RootLoaderData>();

  return (
    <GlobalProvider initialUser={user}>
      {user && (
        <header>
          <Navbar />
        </header>
      )}

      <main className={`hero ${user ? 'is-fullheight-with-navbar' : 'is-fullheight'}`}>
        <Outlet />
      </main>
    </GlobalProvider>
  );
}
