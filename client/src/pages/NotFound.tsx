import LinkButton from '@src/components/LinkButton';
import { useGlobalContext } from '@src/context/GlobalContext';
import { ROLES } from '@src/services/auth-service';
import { Navigate } from 'react-router';

export default function NotFound() {
  const { user } = useGlobalContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">404 – Sidan hittades inte</h1>
        <LinkButton to={ROLES[user.role]} className="is-primary" icon="home">
          Till startsidan
        </LinkButton>
      </div>
    </section>
  );
}
