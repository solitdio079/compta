import { useState } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "~/i18n";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { apiUrl } from "~/lib/api";

export function meta() {
    return [
        { title: "Create New Trip - Compta" },
        { name: "description", content: "Create a new trip" },
    ];
}

export default function NewTrip() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        trip_date: "",
        income: "",
        notes: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(apiUrl("/api/trips"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to create trip");
            }

            navigate("/");
        } catch (err) {
            setError(t("createTripError"));
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
                            <span className="icon-[tabler--map-pin] size-6 text-primary"></span>
                            <h5 className="text-xl font-bold">{t("createNewTrip")}</h5>
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
                                    <label className="label-text" htmlFor="trip_date">
                                        {t("tripDate")} <span className="text-error">*</span>
                                    </label>
                                    <input
                                        id="trip_date"
                                        name="trip_date"
                                        type="date"
                                        value={formData.trip_date}
                                        onChange={handleChange}
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label-text" htmlFor="income">
                                        {t("income")} <span className="text-error">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-base-content/50">
                                            $
                                        </span>
                                        <input
                                            id="income"
                                            name="income"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.income}
                                            onChange={handleChange}
                                            className="input input-bordered w-full ps-8"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label-text" htmlFor="notes">
                                        {t("notes")}
                                    </label>
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
                                        onClick={() => navigate("/")}
                                        className="btn btn-outline"
                                    >
                                        <span className="icon-[tabler--x] size-5"></span>
                                        {t("cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <>
                                                <span className="icon-[tabler--check] size-5"></span>
                                                {t("createTrip")}
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