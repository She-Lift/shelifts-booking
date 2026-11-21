import Button from '@src/components/Button';
import { useGlobalContext } from '@src/context/GlobalContext';
import { AuthService, type User } from '@src/services/auth-service';
import { HttpError } from '@src/services/http-service';
import { useActionState } from 'react';
import { Navigate, useNavigate } from 'react-router';

type LoginState = {
  error: string | undefined;
};

const ROLES: Record<User['role'], string> = {
  admin: '/admin',
  customer: '/customer',
};

export default function Login() {
  const navigate = useNavigate();
  const { setUser, user } = useGlobalContext();
  const [state, formAction, isPending] = useActionState(loginAction, { error: undefined });

  if (user) {
    return <Navigate to={ROLES[user.role]} replace />;
  }

  async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
    const username = formData.get('username');
    const password = formData.get('password');

    if (typeof username !== 'string' || typeof password !== 'string') {
      return { error: 'Ogiltiga inloggningsuppgifter.' };
    }

    try {
      const loggedInUser = await AuthService.login({ username, password });
      setUser(loggedInUser);

      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser.role === 'customer') {
        navigate('/customer', { replace: true });
      }

      return { error: undefined };
    } catch (err) {
      if (err instanceof HttpError) {
        return { error: 'Felaktigt användarnamn eller lösenord.' };
      }

      return { error: 'Kunde inte ansluta till servern.' };
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '420px' }}>
        <>
          <h1 className="title">SHE LIFTS</h1>
          <p className="subtitle">Logga in på ditt konto</p>

          <form action={formAction}>
            <div className="field">
              <label className="label" htmlFor="username">
                Användarnamn
              </label>
              <input id="username" name="username" className="input" autoComplete="username" required />
            </div>

            <div className="field">
              <label className="label" htmlFor="password">
                Lösenord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                autoComplete="current-password"
                required
              />
            </div>

            {state.error && (
              <p className="help is-danger" role="alert">
                {state.error}
              </p>
            )}

            <Button type="submit" className="is-primary is-fullwidth mt-5" isLoading={isPending}>
              Logga in
            </Button>
          </form>
        </>
      </div>
    </section>
  );
}
