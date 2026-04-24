import { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useI18n } from "~/i18n";

interface Trip {
  id: number;
  trip_date: string;
  income: number | string;
  notes: string | null;
}

export default function TripsTable() {
  const { t, language } = useI18n();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Trip | null>(null);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadTrips = async (fromDate?: string, toDate?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const url = params.toString()
        ? `http://localhost:3000/api/trips?${params.toString()}`
        : "http://localhost:3000/api/trips";

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      setError(t("fetchTripsError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrips();
  }, []);

  useEffect(() => {
    if (!from || !to) return;
    void loadTrips(from, to);
  }, [from, to]);

  const formatDate = (dateString: string) => {
    const d = parseISO(dateString);
    if (!isValid(d)) return "";
    const locale = language === "fr" ? fr : enUS;
    return format(d, "PP", { locale });
  };

  const formatCurrency = (amount: number | string) => {
    const n = typeof amount === "string" ? Number(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number.isFinite(n) ? n : 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("delete") + "?")) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:3000/api/trips/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trip");
      await loadTrips(from || undefined, to || undefined);
    } catch (e) {
      setError(t("fetchTripsError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:3000/api/trips/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_date: editing.trip_date,
          income: editing.income,
          notes: editing.notes,
        }),
      });
      if (!response.ok) throw new Error("Failed to update trip");
      setEditing(null);
      await loadTrips(from || undefined, to || undefined);
    } catch (e) {
      setError(t("fetchTripsError"));
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
        <div className="bg-base-300/10 rounded-t-lg p-4 flex items-center gap-3">
          <span className="icon-[tabler--list] size-6 text-primary"></span>
          <h5 className="text-xl font-bold">{t("allTrips")}</h5>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
            <div>
              <label className="label-text" htmlFor="trips-from">{t("from")}</label>
              <input
                id="trips-from"
                type="date"
                className="input input-bordered"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text" htmlFor="trips-to">{t("to")}</label>
              <input
                id="trips-to"
                type="date"
                className="input input-bordered"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  void loadTrips();
                }}
              >
                {t("clear")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void loadTrips(from || undefined, to || undefined)}
                disabled={!from || !to}
              >
                {t("filter")}
              </button>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-8">
              <span className="icon-[tabler--map-pin-off] size-12 text-base-content/50 mb-4"></span>
              <p className="text-base-content/70">{t("noTripsFound")}</p>
              <a 
                href="/trips/new" 
                className="btn btn-primary mt-4"
              >
                <span className="icon-[tabler--plus] size-5"></span>
                {t("createFirstTrip")}
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-compact w-full">
                <thead>
                  <tr>
                    <th>{t("date")}</th>
                    <th>{t("income") || "Income"}</th>
                    <th>{t("notes") || "Notes"}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover">
                      <td>{formatDate(trip.trip_date)}</td>
                      <td className="font-mono">{formatCurrency(trip.income)}</td>
                      <td>
                        {trip.notes ? (
                          <span className="line-clamp-2">{trip.notes}</span>
                        ) : (
                          <span className="text-base-content/50 italic">
                            {t("noNotes")}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setEditing(trip)}
                            disabled={saving}
                          >
                            {t("edit")}
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline btn-error"
                            onClick={() => handleDelete(trip.id)}
                            disabled={saving}
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {trips.length > 0 && (
            <div className="mt-6 flex justify-end">
              <a 
                href="/trips/new" 
                className="btn btn-primary"
              >
                <span className="icon-[tabler--plus] size-5"></span>
                {t("addNewTrip")}
              </a>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)}></div>
          <div className="relative w-full max-w-2xl bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
            <div className="bg-base-300/10 rounded-t-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="icon-[tabler--edit] size-6 text-primary"></span>
                <h2 className="text-lg font-bold">{t("edit")}</h2>
              </div>
              <button type="button" className="btn btn-sm btn-ghost btn-square" onClick={() => setEditing(null)}>
                <span className="icon-[tabler--x] size-5"></span>
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-6 grid gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-text" htmlFor="trip_date">{t("tripDate")}</label>
                  <input
                    id="trip_date"
                    type="date"
                    className="input input-bordered w-full"
                    value={editing.trip_date?.slice(0, 10) ?? ""}
                    onChange={(e) => setEditing({ ...editing, trip_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="income">{t("income")}</label>
                  <input
                    id="income"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input input-bordered w-full"
                    value={editing.income}
                    onChange={(e) => setEditing({ ...editing, income: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-text" htmlFor="notes">{t("notes")}</label>
                <textarea
                  id="notes"
                  className="textarea textarea-bordered w-full min-h-24"
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value || null })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)} disabled={saving}>
                  {t("cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="loading loading-spinner loading-sm"></span> : t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
