import Button from '@src/components/generic/Button';
import { useGlobalContext } from '@src/context/global-context';
import { ROLE_ROUTES } from '@src/routes';
import { AuthService } from '@src/services/auth-service';
import { HttpError } from '@src/services/http-service';
import { useActionState } from 'react';
import { Navigate } from 'react-router';

type LoginState = {
  error: string | undefined;
  username: string;
};

export default function Login() {
  const { setUser, user } = useGlobalContext();
  const [state, formAction, isPending] = useActionState(loginAction, { error: undefined, username: '' });

  if (user) {
    return <Navigate to={ROLE_ROUTES[user.role]} replace />;
  }

  async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
    const username = formData.get('username');
    const password = formData.get('password');

    if (typeof username !== 'string' || typeof password !== 'string') {
      return { error: 'Ogiltiga inloggningsuppgifter.', username: '' };
    }

    try {
      const loggedInUser = await AuthService.login({ username, password });
      setUser(loggedInUser);
      return { error: undefined, username };
    } catch (err) {
      if (err instanceof HttpError) {
        return { error: 'Felaktigt användarnamn eller lösenord.', username };
      }

      return { error: 'Kunde inte ansluta till servern.', username };
    }
  }

  return (
    <section className="section is-fullheight is-flex is-flex-direction-column is-justify-content-center is-align-items-center">
      <div className="is-fullwidth" style={{ maxWidth: '420px' }}>
        <h1 className="title has-text-centered">SHE LIFTS</h1>
        <p className="subtitle has-text-centered">Logga in på ditt konto</p>

        <form action={formAction}>
          <div className="field">
            <label className="label" htmlFor="username">
              Användarnamn
            </label>
            <div className="control">
              <input
                id="username"
                name="username"
                className="input"
                autoComplete="username"
                defaultValue={state.username}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Lösenord
            </label>
            <div className="control">
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {state.error && (
            <p className="help is-danger" role="alert">
              {state.error}
            </p>
          )}

          <div className="field mt-5">
            <div className="control">
              <Button type="submit" className="is-primary is-fullwidth" isLoading={isPending}>
                Logga in
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
