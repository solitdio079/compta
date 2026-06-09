import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import { formatMoney, formatNumber } from "~/lib/format";
import { useI18n } from "~/i18n";

type PerformanceTruck = {
  truck_label: string;
  trips_count: number;
  income_total: string;
  fuel_total: string;
  expense_total: string;
  distance_total: string;
  net: string;
  performance_per_km: string;
};

type PerformanceResponse = {
  period: "week" | "month" | "year";
  from: string;
  to: string;
  summary: {
    trips_count: number;
    income_total: number;
    fuel_total: number;
    expense_total: number;
    distance_total: number;
    net: number;
  };
  trucks: PerformanceTruck[];
};

function getInitialMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getInitialDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function PerformanceReport() {
  const { t, language } = useI18n();
  const { state } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [value, setValue] = useState(getInitialMonth);
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputType = period === "week" ? "date" : period === "month" ? "month" : "number";

  const periodValue = useMemo(() => {
    if (period === "week" && !value.includes("-")) return getInitialDate();
    if (period === "month" && value.length !== 7) return getInitialMonth();
    if (period === "year") return value.slice(0, 4) || String(new Date().getFullYear());
    return value;
  }, [period, value]);

  useEffect(() => {
    if (period === "week") setValue(getInitialDate());
    if (period === "month") setValue(getInitialMonth());
    if (period === "year") setValue(String(new Date().getFullYear()));
  }, [period]);

  useEffect(() => {
    if (state.status !== "ready" || !state.authenticated) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ period, value: periodValue });
        const response = await fetch(`${apiUrl("/api/reports/performance")}?${params.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch performance report");
        setData((await response.json()) as PerformanceResponse);
      } catch {
        setError(t("fetchReportError"));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [state.status, state.authenticated, period, periodValue]);

  if (state.status !== "ready" || !state.authenticated) return null;

  const trucks = data?.trucks ?? [];
  const summary = data?.summary;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
        <div className="bg-base-300/10 rounded-t-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="icon-[tabler--truck] size-6 text-primary"></span>
            <div>
              <h5 className="text-xl font-bold">{t("performanceReport")}</h5>
              <p className="text-sm text-base-content/70">{t("performanceDescription")}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="select select-bordered"
              value={period}
              onChange={(e) => setPeriod(e.target.value as "week" | "month" | "year")}
              aria-label={t("period")}
            >
              <option value="week">{t("week")}</option>
              <option value="month">{t("month")}</option>
              <option value="year">{t("year")}</option>
            </select>
            <input
              className="input input-bordered"
              type={inputType}
              value={periodValue}
              onChange={(e) => setValue(e.target.value)}
              aria-label={t("period")}
            />
          </div>
        </div>

        <div className="p-6">
          {error ? (
            <div className="alert alert-error">
              <span className="icon-[tabler--alert-circle] size-5"></span>
              <span>{error}</span>
            </div>
          ) : null}

          {summary ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-6">
              <div className="rounded-md border border-base-300 p-4">
                <p className="text-sm text-base-content/60">{t("tripsCount")}</p>
                <p className="text-xl font-bold">{formatNumber(summary.trips_count, language, 0)}</p>
              </div>
              <div className="rounded-md border border-base-300 p-4">
                <p className="text-sm text-base-content/60">{t("grossGain")}</p>
                <p className="text-xl font-bold">{formatMoney(summary.income_total, language)}</p>
              </div>
              <div className="rounded-md border border-base-300 p-4">
                <p className="text-sm text-base-content/60">{t("fuelDeduction")}</p>
                <p className="text-xl font-bold">{formatMoney(summary.fuel_total, language)}</p>
              </div>
              <div className="rounded-md border border-base-300 p-4">
                <p className="text-sm text-base-content/60">{t("dailyExpenses")}</p>
                <p className="text-xl font-bold">{formatMoney(summary.expense_total, language)}</p>
              </div>
              <div className="rounded-md border border-base-300 p-4">
                <p className="text-sm text-base-content/60">{t("netGain")}</p>
                <p className={summary.net >= 0 ? "text-xl font-bold text-success" : "text-xl font-bold text-error"}>
                  {formatMoney(summary.net, language)}
                </p>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : trucks.length === 0 ? (
            <div className="text-center py-8">
              <span className="icon-[tabler--truck-off] size-12 text-base-content/50 mb-4"></span>
              <p className="text-base-content/70">{t("noPerformanceFound")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-compact w-full">
                <thead>
                  <tr>
                    <th>{t("truckLabel")}</th>
                    <th>{t("tripsCount")}</th>
                    <th>{t("grossGain")}</th>
                    <th>{t("fuelDeduction")}</th>
                    <th>{t("dailyExpenses")}</th>
                    <th>{t("totalDistance")}</th>
                    <th>{t("netGain")}</th>
                    <th>{t("performancePerKm")}</th>
                  </tr>
                </thead>
                <tbody>
                  {trucks.map((truck) => {
                    const net = Number(truck.net);
                    return (
                      <tr key={truck.truck_label} className="hover">
                        <td className="font-semibold">{truck.truck_label}</td>
                        <td>{formatNumber(truck.trips_count, language, 0)}</td>
                        <td className="font-mono">{formatMoney(truck.income_total, language)}</td>
                        <td className="font-mono">{formatMoney(truck.fuel_total, language)}</td>
                        <td className="font-mono">{formatMoney(truck.expense_total, language)}</td>
                        <td className="font-mono">{formatNumber(truck.distance_total, language)} km</td>
                        <td className={net >= 0 ? "font-mono text-success" : "font-mono text-error"}>
                          {formatMoney(truck.net, language)}
                        </td>
                        <td className="font-mono">{formatMoney(truck.performance_per_km, language)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
