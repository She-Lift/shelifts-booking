import Navbar from '@src/components/Navbar';
import Spinner from '@src/components/Spinner';
import { useGlobalContext } from '@src/context/GlobalContext';
import { Outlet } from 'react-router';

export default function App() {
  const { user, isLoading } = useGlobalContext();

  if (isLoading && !user) {
    return (
      <main className="hero is-fullheight">
        <div className="hero-body is-justify-content-center">
          <Spinner label="Kontrollerar inloggning..." size="large" />
        </div>
      </main>
    );
  }

  return (
    <>
      {user && (
        <header>
          <Navbar />
        </header>
      )}

      <main className={`hero ${user ? 'is-fullheight-with-navbar' : 'is-fullheight'}`}>
        <Outlet />
      </main>
    </>
  );
}
