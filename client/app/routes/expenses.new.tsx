import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useI18n } from "~/i18n";
import { apiUrl } from "~/lib/api";

export function meta() {
  return [
    { title: "Create New Expense - Compta" },
    { name: "description", content: "Add a new expense with date, category, amount, and notes in Compta." },
  ];
}

export default function NewExpense() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    expense_date: "",
    truck_label: "",
    category: "",
    amount: "",
    notes: "",
  });

  const parsedPayload = useMemo(() => {
    return {
      expense_date: formData.expense_date,
      truck_label: formData.truck_label === "" ? null : formData.truck_label,
      category: formData.category === "" ? null : formData.category,
      amount: formData.amount,
      notes: formData.notes === "" ? null : formData.notes,
    };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("/api/expenses"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsedPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create expense");
      }

      navigate("/expenses");
    } catch (err) {
      setError(t("createExpenseError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
            <div className="bg-base-300/10 rounded-t-lg p-4 flex items-center gap-3">
              <span className="icon-[tabler--receipt] size-6 text-primary"></span>
              <h5 className="text-xl font-bold">{t("createNewExpense")}</h5>
            </div>
            <div className="p-6">
              {error && (
                <div className="alert alert-error mb-6">
                  <span className="icon-[tabler--alert-circle] size-5"></span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-6">
                <div>
                  <label className="label-text" htmlFor="expense_date">
                    {t("expenseDate")} <span className="text-error">*</span>
                  </label>
                  <input
                    id="expense_date"
                    name="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div>
                  <label className="label-text" htmlFor="truck_label">
                    {t("truckLabel")}
                  </label>
                  <input
                    id="truck_label"
                    name="truck_label"
                    type="text"
                    value={formData.truck_label}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder={t("truckPlaceholder")}
                  />
                </div>

                <div>
                    <label className="label-text" htmlFor="category">{t("category")}</label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      list="expense-categories"
                      value={formData.category}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder={t("expenseCategoryPlaceholder")}
                    />
                    <datalist id="expense-categories">
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

                <div>
                  <label className="label-text" htmlFor="amount">
                    {t("amount")} <span className="text-error">*</span>
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="label-text" htmlFor="notes">{t("notes")}</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="textarea textarea-bordered w-full min-h-24"
                    placeholder={t("notesPlaceholder")}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/expenses")}
                    className="btn btn-outline"
                  >
                    <span className="icon-[tabler--x] size-5"></span>
                    {t("cancel")}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <span className="icon-[tabler--check] size-5"></span>
                        {t("save")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
