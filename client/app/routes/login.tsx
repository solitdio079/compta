import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { apiUrl } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import { useI18n } from "~/i18n";

export function meta() {
  return [
    { title: "Login - Compta" },
    { name: "description", content: "Login to manage trips and expenses." },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh, state } = useAuth();
  const { t } = useI18n();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => username.trim().length > 0 && password.length > 0, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError(t("invalidCredentials"));
        return;
      }

      const user = await res.json();
      await refresh();
      const redirectTo = params.get("redirectTo") || (user?.isAdmin ? "/admin" : "/");
      navigate(redirectTo);
    } catch {
      setError(t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-md">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h1 className="text-2xl font-bold text-base-content">{t("loginTitle")}</h1>
            <p className="text-base-content/70">
              {t("loginSubtitle")}
            </p>

            {state.status === "ready" && state.authenticated ? (
              <div className="alert alert-success mt-2">
                {t("alreadyLoggedInAs")} <strong>{state.user.username}</strong>.
              </div>
            ) : null}

            {error ? <div className="alert alert-error mt-2">{error}</div> : null}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">{t("username")}</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">{t("password")}</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>

              <button className="btn btn-primary w-full" disabled={loading || !canSubmit}>
                {loading ? t("loggingIn") : t("login")}
              </button>

              <div className="text-sm text-base-content/70 text-center space-y-1">
                <div>
                  <a href="/signup" className="link link-primary">{t("createAccount")}</a>
                </div>
                <div>
                  <a href="/forgot-password" className="link link-primary">{t("forgotPassword")}</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
