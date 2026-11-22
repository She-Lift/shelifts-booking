import Navbar from '@src/components/routing/Navbar';
import { useGlobalContext } from '@src/context/global-context';
import { Navigate, Outlet } from 'react-router';

export default function ProtectedRoute() {
  const { user } = useGlobalContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header>
        <Navbar />
      </header>

      <main className="hero is-fullheight-with-navbar">
        <Outlet />
      </main>
    </>
  );
}
