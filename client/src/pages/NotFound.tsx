import LinkButton from '@src/components/generic/LinkButton';
import { useGlobalContext } from '@src/context/global-context';
import { ROLE_ROUTES } from '@src/routes';
import { Navigate } from 'react-router';

export default function NotFound() {
  const { user } = useGlobalContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="hero is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered">
          <p className="title is-1 has-text-primary mb-2">404</p>
          <h1 className="subtitle is-4 mb-5">Sidan hittades inte</h1>
          <LinkButton to={ROLE_ROUTES[user.role]} className="is-primary" icon="home">
            Till startsidan
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
