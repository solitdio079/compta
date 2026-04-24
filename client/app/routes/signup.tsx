import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { apiUrl } from "~/lib/api";
import { useI18n } from "~/i18n";

export function meta() {
  return [
    { title: "Sign up - Compta" },
    { name: "description", content: "Create an account for Compta." },
  ];
}

export default function Signup() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => username.trim().length > 0 && password.length >= 6, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? t("signupFailed"));
        return;
      }

      setSuccess(t("accountCreated"));
      setTimeout(() => navigate("/login"), 400);
    } catch {
      setError(t("signupFailed"));
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
            <h1 className="text-2xl font-bold text-base-content">{t("signupTitle")}</h1>
            <p className="text-base-content/70">{t("signupSubtitle")}</p>

            {error ? <div className="alert alert-error mt-2">{error}</div> : null}
            {success ? <div className="alert alert-success mt-2">{success}</div> : null}

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
                  <span className="label-text-alt">{t("minChars")}</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              <button className="btn btn-primary w-full" disabled={loading || !canSubmit}>
                {loading ? t("creating") : t("createAccountButton")}
              </button>

              <div className="text-sm text-base-content/70 text-center">
                <a href="/login" className="link link-primary">{t("alreadyHaveAccount")}</a>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
