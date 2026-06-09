import { useMemo, useState } from "react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { apiUrl } from "~/lib/api";
import { useI18n } from "~/i18n";

export function meta() {
  return [
    { title: "Forgot password - Compta" },
    { name: "description", content: "Reset your Compta password." },
  ];
}

export default function ForgotPassword() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const canSubmit = useMemo(() => username.trim().length > 0, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setResetUrl(null);

    try {
      const res = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? t("requestFailed"));
        return;
      }

      if (json?.resetUrl) {
        setResetUrl(json.resetUrl);
      } else {
        setSuccess(t("resetRequestHandled"));
      }
    } catch {
      setError(t("requestFailed"));
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
            <h1 className="text-2xl font-bold text-base-content">{t("forgotPasswordTitle")}</h1>
            <p className="text-base-content/70">{t("forgotPasswordSubtitle")}</p>

            {error ? <div className="alert alert-error mt-2">{error}</div> : null}
            {success ? <div className="alert alert-success mt-2">{success}</div> : null}

            {resetUrl ? (
              <div className="alert alert-success mt-2 break-words">
                <div>
                  <div className="font-semibold">{t("resetLink")}</div>
                  <a className="link link-primary" href={resetUrl}>
                    {resetUrl}
                  </a>
                </div>
              </div>
            ) : null}

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

              <button className="btn btn-primary w-full" disabled={loading || !canSubmit}>
                {loading ? t("sending") : t("sendResetLink")}
              </button>

              <div className="text-sm text-base-content/70 text-center">
                <a href="/login" className="link link-primary">{t("backToLogin")}</a>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
