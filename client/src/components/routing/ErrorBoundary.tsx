import { useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="hero is-fullheight">
      <div className="hero-body">
        <div className="container is-max-desktop">
          <div className="box has-text-centered py-6 px-4">
            <p className="title is-5 has-text-danger mb-2">Något gick fel</p>
            <p className="has-text-grey mb-5">
              Ett oväntat fel har inträffat, vänligen kontakta administratör eller försök igen.
            </p>

            <div className="buttons is-centered">
              <button type="button" className="button is-primary is-small" onClick={() => navigate(0)}>
                Försök igen
              </button>
              <button type="button" className="button is-light is-small" onClick={() => navigate('/')}>
                Gå till startsidan
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
