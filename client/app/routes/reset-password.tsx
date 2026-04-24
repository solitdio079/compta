import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { apiUrl } from "~/lib/api";
import { useI18n } from "~/i18n";

export function meta() {
  return [
    { title: "Reset password - Compta" },
    { name: "description", content: "Set a new password for your Compta account." },
  ];
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { t } = useI18n();

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => token.length > 0 && newPassword.length >= 6, [token, newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? t("resetFailed"));
        return;
      }

      setSuccess(t("passwordUpdated"));
      setTimeout(() => navigate("/login"), 600);
    } catch {
      setError(t("resetFailed"));
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
            <h1 className="text-2xl font-bold text-base-content">{t("resetPasswordTitle")}</h1>

            {!token ? (
              <div className="alert alert-error mt-2">
                {t("missingResetToken")}
              </div>
            ) : null}

            {error ? <div className="alert alert-error mt-2">{error}</div> : null}
            {success ? <div className="alert alert-success mt-2">{success}</div> : null}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">{t("newPassword")}</span>
                  <span className="label-text-alt">{t("minChars")}</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              <button className="btn btn-primary w-full" disabled={loading || !canSubmit}>
                {loading ? t("updating") : t("updatePassword")}
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
