import { useActionState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useGlobalContext } from "../context/GlobalContext";

type LoginState = {
  error: string | null;
};

export default function Login() {
  const navigate = useNavigate();
  const { setUser, user, isLoading } = useGlobalContext();
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  if (isLoading) {
    return <p>Kontrollerar inloggning...</p>;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "customer") {
    return <Navigate to="/customer" replace />;
  }

  async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
    const username = formData.get("username");
    const password = formData.get("password");

    if (typeof username !== "string" || typeof password !== "string") {
      return { error: "Ogiltiga inloggningsuppgifter." };
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        return { error: "Felaktigt användarnamn eller lösenord." };
      }

      const data = await response.json();
      setUser(data.user);

      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (data.user.role === "customer") {
        navigate("/customer", { replace: true });
      }

      return { error: null };
    } catch {
      return { error: "Kunde inte ansluta till servern." };
    }
  }

  return <>
    <section className="section">
      <div className="container" style={{ maxWidth: "420px" }}>
        <h1 className="title">SHE LIFTS</h1>
        <p className="subtitle">Logga in på ditt konto</p>

        <form action={formAction}>
          <div className="field">
            <label className="label" htmlFor="username">
              Användarnamn
            </label>
            <input
              id="username"
              name="username"
              className="input"
              autoComplete="username"
              required
            />
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

          <button
            className={`button is-primary is-fullwidth mt-5 ${isPending ? "is-loading" : ""}`}
            type="submit"
            disabled={isPending}
          >
            Logga in
          </button>
        </form>
      </div>
    </section>
  </>;
}