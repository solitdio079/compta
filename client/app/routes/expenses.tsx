import { useEffect, useMemo, useState } from "react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useI18n } from "~/i18n";
import { format, parseISO, isValid } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { apiUrl } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import { formatMoney } from "~/lib/format";

type Expense = {
  id: number;
  expense_date: string;
  truck_label: string | null;
  category: string | null;
  amount: string;
  notes: string | null;
};

export function meta() {
  return [
    { title: "Expenses - Compta" },
    { name: "description", content: "Manage your expenses, filter by date, and keep notes in Compta." },
  ];
}

export default function Expenses() {
  const { t, language } = useI18n();
  const { state } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const locale = useMemo(() => (language === "fr" ? fr : enUS), [language]);

  const formatDate = (dateString: string) => {
    const d = parseISO(dateString);
    if (!isValid(d)) return "";
    return format(d, "PP", { locale });
  };

  const loadExpenses = async (fromDate?: string, toDate?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const url = params.toString()
        ? `${apiUrl("/api/expenses")}?${params.toString()}`
        : apiUrl("/api/expenses");

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (e) {
      setError(t("fetchExpensesError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.status !== "ready") return;
    if (!state.authenticated) return;
    void loadExpenses();
  }, [state.status, state.authenticated]);

  useEffect(() => {
    if (!from || !to) return;
    void loadExpenses(from, to);
  }, [from, to]);

  const handleDelete = async (id: number) => {
    if (!confirm(t("delete") + "?")) return;
    setSaving(true);
    try {
      const response = await fetch(apiUrl(`/api/expenses/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      await loadExpenses(from || undefined, to || undefined);
    } catch (e) {
      setError(t("deleteExpenseError"));
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
      const response = await fetch(apiUrl(`/api/expenses/${editing.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          expense_date: editing.expense_date,
          truck_label: editing.truck_label || null,
          category: editing.category,
          amount: editing.amount,
          notes: editing.notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to update expense");
      setEditing(null);
      await loadExpenses(from || undefined, to || undefined);
    } catch (e) {
      setError(t("updateExpenseError"));
    } finally {
      setSaving(false);
    }
  };

  if (state.status !== "ready") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 py-10 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!state.authenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 py-10 px-4">
          <div className="container mx-auto">
            <div className="alert alert-warning">
              <span className="icon-[tabler--lock] size-5"></span>
              <span>{t("loginRequiredExpenses")}</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAdmin = state.user.isAdmin;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="icon-[tabler--receipt] size-7 text-primary"></span>
              <h1 className="text-2xl font-bold">{t("allExpenses")}</h1>
            </div>
            {isAdmin ? (
              <a href="/expenses/new" className="btn btn-primary">
                <span className="icon-[tabler--plus] size-5"></span>
                {t("addNewExpense")}
              </a>
            ) : null}
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span className="icon-[tabler--alert-circle] size-5"></span>
              <span>{error}</span>
            </div>
          )}

          <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
                <div>
                  <label className="label-text" htmlFor="expenses-from">{t("from")}</label>
                  <input
                    id="expenses-from"
                    type="date"
                    className="input input-bordered"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="expenses-to">{t("to")}</label>
                  <input
                    id="expenses-to"
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
                      void loadExpenses();
                    }}
                  >
                    {t("clear")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void loadExpenses(from || undefined, to || undefined)}
                    disabled={!from || !to}
                  >
                    {t("filter")}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-10">
                  <span className="icon-[tabler--receipt-off] size-12 text-base-content/50 mb-4"></span>
                  <p className="text-base-content/70">{t("noExpensesFound")}</p>
                  {isAdmin ? (
                    <a href="/expenses/new" className="btn btn-primary mt-4">
                      <span className="icon-[tabler--plus] size-5"></span>
                      {t("addNewExpense")}
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-compact w-full">
                    <thead>
                      <tr>
                        <th>{t("expenseDate")}</th>
                        <th>{t("truckLabel")}</th>
                        <th>{t("category")}</th>
                        <th>{t("amount")}</th>
                        <th>{t("notes")}</th>
                        <th>{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((ex) => (
                        <tr key={ex.id} className="hover">
                          <td>{formatDate(ex.expense_date)}</td>
                          <td>{ex.truck_label || <span className="text-base-content/50">—</span>}</td>
                          <td>{ex.category ?? "—"}</td>
                          <td className="font-mono">{formatMoney(ex.amount, language)}</td>
                          <td>{ex.notes ? <span className="line-clamp-2">{ex.notes}</span> : <span className="text-base-content/50 italic">{t("noNotes")}</span>}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {isAdmin ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline"
                                    onClick={() => setEditing(ex)}
                                    disabled={saving}
                                  >
                                    {t("edit")}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline btn-error"
                                    onClick={() => handleDelete(ex.id)}
                                    disabled={saving}
                                  >
                                    {t("delete")}
                                  </button>
                                </>
                              ) : (
                                <span className="text-base-content/50">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {editing && isAdmin && (
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
                    <label className="label-text" htmlFor="expense_date">{t("expenseDate")}</label>
                    <input
                      id="expense_date"
                      type="date"
                      className="input input-bordered w-full"
                      value={editing.expense_date?.slice(0, 10) ?? ""}
                      onChange={(e) => setEditing({ ...editing, expense_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="truck_label">{t("truckLabel")}</label>
                    <input
                      id="truck_label"
                      type="text"
                      className="input input-bordered w-full"
                      value={editing.truck_label ?? ""}
                      onChange={(e) => setEditing({ ...editing, truck_label: e.target.value || null })}
                      placeholder={t("truckPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="category">{t("category")}</label>
                    <input
                      id="category"
                      type="text"
                      list="expense-categories-edit"
                      className="input input-bordered w-full"
                      value={editing.category ?? ""}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value || null })}
                      placeholder={t("expenseCategoryPlaceholder")}
                    />
                    <datalist id="expense-categories-edit">
                      <option value="Achat pneus" />
                      <option value="Achat carburant" />
                      <option value="Vidange" />
                      <option value="Entretien" />
                      <option value="Maintenance" />
                      <option value="Réparation" />
                      <option value="Assurance" />
                      <option value="Péage" />
                    </datalist>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-text" htmlFor="amount">{t("amount")} <span className="text-error">*</span></label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="input input-bordered w-full"
                      value={editing.amount}
                      onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
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
      </main>

      <Footer />
    </div>
  );
}
