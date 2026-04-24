import { useEffect, useMemo, useState } from "react";
import { useI18n } from "~/i18n";
import { format, parseISO, isValid } from "date-fns";
import { enUS, fr } from "date-fns/locale";

type ReportDay = {
  day: string;
  income_total: string;
  expense_total: string;
  net: string;
};

type ReportResponse = {
  from: string;
  to: string;
  days: ReportDay[];
};

export default function DailyReportTable() {
  const { t, language } = useI18n();
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const locale = useMemo(() => (language === "fr" ? fr : enUS), [language]);

  const formatDay = (iso: string) => {
    const d = parseISO(iso);
    if (!isValid(d)) return "";
    return format(d, "PP", { locale });
  };

  const formatMoney = (value: string) => {
    const n = Number(value);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      Number.isFinite(n) ? n : 0
    );
  };

  const load = async (m: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3000/api/reports/daily?month=${encodeURIComponent(m)}`);
      if (!response.ok) throw new Error("Failed to fetch report");
      const json = (await response.json()) as ReportResponse;
      setData(json);
    } catch (e) {
      setError(t("fetchReportError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(month);
  }, [month]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
          <div className="p-6">
            <div className="alert alert-error">
              <span className="icon-[tabler--alert-circle] size-5"></span>
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const days = data?.days ?? [];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/reports/daily.xlsx?month=${encodeURIComponent(month)}&lang=${encodeURIComponent(language)}`
      );
      if (!response.ok) throw new Error("Failed to download");
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `monthly-report-${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
        <div className="bg-base-300/10 rounded-t-lg p-4 flex items-center gap-3">
          <span className="icon-[tabler--calendar-stats] size-6 text-primary"></span>
          <h5 className="text-xl font-bold">{t("dailyReport")}</h5>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
            <div>
              <label className="label-text" htmlFor="report-month">{t("date")}</label>
              <input
                id="report-month"
                type="month"
                className="input input-bordered"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>

          {days.length === 0 ? (
            <div className="text-center py-8">
              <span className="icon-[tabler--calendar-off] size-12 text-base-content/50 mb-4"></span>
              <p className="text-base-content/70">{t("noExpensesFound")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-compact w-full">
                <thead>
                  <tr>
                    <th>{t("date")}</th>
                    <th>{t("dailyIncome")}</th>
                    <th>{t("dailyExpenses")}</th>
                    <th>{t("dailyNet")}</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d) => {
                    const net = Number(d.net);
                    return (
                      <tr key={d.day} className="hover">
                        <td>{formatDay(d.day)}</td>
                        <td className="font-mono">{formatMoney(d.income_total)}</td>
                        <td className="font-mono">{formatMoney(d.expense_total)}</td>
                        <td className={net >= 0 ? "font-mono text-success" : "font-mono text-error"}>
                          {formatMoney(d.net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {days.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <span className="icon-[tabler--download] size-5"></span>
                    {t("downloadExcel")}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
