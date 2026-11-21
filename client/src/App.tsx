import Spinner from '@src/components/Spinner';
import { useGlobalContext } from '@src/context/GlobalContext';
import { Outlet } from 'react-router';
import Navbar from './components/Navbar';

export default function App() {
  const { isLoading } = useGlobalContext();

  return (
    <>
      <header>
        <Navbar />
      </header>

      <main className="hero is-fullheight-with-navbar">
        {isLoading ? <Spinner label="Kontrollerar inloggning..." size="large" /> : <Outlet />}
      </main>
    </>
  );
}
