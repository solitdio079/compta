import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useAuth } from "~/lib/auth";
import { useI18n, type Language } from "~/i18n";
import { apiUrl } from "~/lib/api";
import { formatMoney, formatNumber } from "~/lib/format";

type Trip = {
  id: number;
  trip_date: string;
  truck_label: string | null;
  route_label: string | null;
  distance_km: number | string;
  fuel_consumed: number | string;
  income: number | string;
  notes: string | null;
};

type Expense = {
  id: number;
  expense_date: string;
  truck_label: string | null;
  category: string | null;
  amount: number | string;
  notes: string | null;
};

const copy = {
  en: {
    metaTitle: "Admin Dashboard - Compta",
    metaDescription: "Daily statistics, exports, quick actions, and the Compta administrator guide.",
    eyebrow: "ADMIN CONTROL CENTER",
    title: "Good day, administrator",
    subtitle: "Review today's activity, export your data, and follow the guide to manage Compta safely.",
    today: "Today's overview",
    todayHint: "Statistics for",
    trips: "Trips",
    income: "Gross income",
    fuel: "Fuel deductions",
    expenses: "Expenses",
    net: "Net result",
    distance: "Distance",
    loading: "Loading today's statistics…",
    loadError: "Today's statistics could not be loaded.",
    quickActions: "Quick actions",
    quickActionsHint: "Jump straight to the most common administration tasks.",
    createTrip: "Create a trip",
    createExpense: "Create an expense",
    manageTrips: "Manage trips",
    manageExpenses: "Manage expenses",
    downloads: "Downloads & exports",
    downloadsHint: "Choose a month for the Excel report. CSV exports contain today's detailed records.",
    reportMonth: "Report month",
    monthlyExcel: "Monthly report (Excel)",
    todayTripsCsv: "Today's trips (CSV)",
    todayExpensesCsv: "Today's expenses (CSV)",
    noTripsToDownload: "There are no trips to export today.",
    noExpensesToDownload: "There are no expenses to export today.",
    downloadError: "The file could not be downloaded.",
    guide: "Administrator guide",
    guideIntro: "Compta stores trips and expenses. Reports and dashboard statistics are calculated from those records automatically.",
    startTitle: "1. Start here",
    startSteps: [
      "Use the Dashboard link in the navigation bar whenever you need the daily summary, exports, or this guide.",
      "Create records as activity happens. Accurate dates and truck labels are essential for reliable reports.",
      "Use the language button in the navigation bar to switch the whole interface and exported Excel headings between English and French.",
    ],
    tripTitle: "2. Trips: create, read, update, delete",
    tripBody: "A trip records money earned and operational information for one journey.",
    tripFields: "Fields: date, truck/plate, route, distance, fuel deduction, income, and optional notes.",
    tripCrud: [
      "Create: select Create a trip, complete the required date, truck, and income fields, then save.",
      "Read: open Home and scroll to All Trips. Use From and To to filter a date range.",
      "Update: select Edit on a trip row, change the values, then save.",
      "Delete: select Delete on a trip row and confirm. Deletion is permanent.",
    ],
    expenseTitle: "3. Expenses: create, read, update, delete",
    expenseBody: "An expense records money spent. Use the same truck label as its trips so truck performance remains accurate.",
    expenseFields: "Fields: date, truck/plate, category, amount, and optional notes.",
    expenseCrud: [
      "Create: select Create an expense, enter the date and amount, add a truck and category when relevant, then save.",
      "Read: open Expenses. Use From and To to filter a date range.",
      "Update: select Edit on an expense row, make the correction, then save.",
      "Delete: select Delete and confirm. Deletion is permanent.",
    ],
    reportsTitle: "4. Reports and exports",
    reportsSteps: [
      "The Daily Report on Home groups income, fuel, distance, expenses, and net result by day.",
      "Truck Performance compares results by truck for a week, month, or year.",
      "Use Monthly report (Excel) here or on Home to download the selected month.",
      "Use the CSV buttons above for a detailed backup of today's trips or expenses.",
    ],
    usersTitle: "5. Users and administrator access",
    usersSteps: [
      "A normal account can view data but cannot create, edit, delete, or export protected reports.",
      "Administrator accounts can perform every CRUD action and access this dashboard.",
      "Keep administrator credentials private. Anyone with administrator access can change or permanently delete operational data.",
    ],
    rulesTitle: "6. Data-quality checklist",
    rules: [
      "Use one consistent spelling for each truck or plate number.",
      "Record fuel deducted from a trip in the trip's Fuel consumed field; record other costs under Expenses.",
      "Check the record date before saving because reports are grouped by date.",
      "Add notes when a value may need explanation later.",
      "Download a monthly Excel report regularly as an external backup.",
    ],
    warningTitle: "Before deleting",
    warningBody: "Deletion cannot be undone from the interface. Export your data first if you may need the record later.",
    accessDenied: "This page is reserved for administrators.",
    backHome: "Return to Home",
  },
  fr: {
    metaTitle: "Tableau de bord administrateur - Compta",
    metaDescription: "Statistiques du jour, exports, actions rapides et guide administrateur Compta.",
    eyebrow: "CENTRE DE CONTRÔLE ADMIN",
    title: "Bonjour, administrateur",
    subtitle: "Consultez l'activité du jour, exportez vos données et suivez le guide pour gérer Compta correctement.",
    today: "Aperçu du jour",
    todayHint: "Statistiques du",
    trips: "Voyages",
    income: "Revenu brut",
    fuel: "Déductions carburant",
    expenses: "Dépenses",
    net: "Résultat net",
    distance: "Distance",
    loading: "Chargement des statistiques du jour…",
    loadError: "Impossible de charger les statistiques du jour.",
    quickActions: "Actions rapides",
    quickActionsHint: "Accédez directement aux tâches d'administration les plus fréquentes.",
    createTrip: "Créer un voyage",
    createExpense: "Créer une dépense",
    manageTrips: "Gérer les voyages",
    manageExpenses: "Gérer les dépenses",
    downloads: "Téléchargements et exports",
    downloadsHint: "Choisissez un mois pour le rapport Excel. Les exports CSV contiennent les enregistrements détaillés du jour.",
    reportMonth: "Mois du rapport",
    monthlyExcel: "Rapport mensuel (Excel)",
    todayTripsCsv: "Voyages du jour (CSV)",
    todayExpensesCsv: "Dépenses du jour (CSV)",
    noTripsToDownload: "Aucun voyage à exporter aujourd'hui.",
    noExpensesToDownload: "Aucune dépense à exporter aujourd'hui.",
    downloadError: "Impossible de télécharger le fichier.",
    guide: "Guide de l'administrateur",
    guideIntro: "Compta enregistre les voyages et les dépenses. Les rapports et les statistiques du tableau de bord sont calculés automatiquement à partir de ces données.",
    startTitle: "1. Bien démarrer",
    startSteps: [
      "Utilisez le lien Tableau de bord dans la navigation pour retrouver le résumé du jour, les exports et ce guide.",
      "Créez les enregistrements au moment de l'activité. Les dates et matricules de camion doivent être exacts pour obtenir des rapports fiables.",
      "Utilisez le bouton de langue dans la navigation pour afficher l'interface et les titres du fichier Excel en français ou en anglais.",
    ],
    tripTitle: "2. Voyages : créer, consulter, modifier, supprimer",
    tripBody: "Un voyage enregistre le revenu et les informations opérationnelles d'un trajet.",
    tripFields: "Champs : date, camion/matricule, trajet, distance, déduction carburant, revenu et notes facultatives.",
    tripCrud: [
      "Créer : sélectionnez Créer un voyage, renseignez la date, le camion et le revenu obligatoires, puis enregistrez.",
      "Consulter : ouvrez Accueil et descendez jusqu'à Tous les voyages. Utilisez Du et Au pour filtrer une période.",
      "Modifier : sélectionnez Modifier sur la ligne du voyage, corrigez les valeurs, puis enregistrez.",
      "Supprimer : sélectionnez Supprimer et confirmez. La suppression est définitive.",
    ],
    expenseTitle: "3. Dépenses : créer, consulter, modifier, supprimer",
    expenseBody: "Une dépense enregistre une sortie d'argent. Utilisez le même matricule que dans les voyages afin de préserver l'exactitude des performances par camion.",
    expenseFields: "Champs : date, camion/matricule, catégorie, montant et notes facultatives.",
    expenseCrud: [
      "Créer : sélectionnez Créer une dépense, renseignez la date et le montant, ajoutez le camion et la catégorie si nécessaire, puis enregistrez.",
      "Consulter : ouvrez Dépenses. Utilisez Du et Au pour filtrer une période.",
      "Modifier : sélectionnez Modifier sur une ligne, apportez la correction, puis enregistrez.",
      "Supprimer : sélectionnez Supprimer et confirmez. La suppression est définitive.",
    ],
    reportsTitle: "4. Rapports et exports",
    reportsSteps: [
      "Le Rapport quotidien de l'accueil regroupe par jour les revenus, le carburant, la distance, les dépenses et le résultat net.",
      "La Performance par camion compare les résultats par camion sur une semaine, un mois ou une année.",
      "Utilisez Rapport mensuel (Excel) ici ou sur l'accueil pour télécharger le mois sélectionné.",
      "Utilisez les boutons CSV ci-dessus pour sauvegarder le détail des voyages ou dépenses du jour.",
    ],
    usersTitle: "5. Utilisateurs et accès administrateur",
    usersSteps: [
      "Un compte normal peut consulter les données, mais ne peut pas créer, modifier, supprimer ou exporter les rapports protégés.",
      "Un administrateur peut effectuer toutes les opérations CRUD et accéder à ce tableau de bord.",
      "Gardez les identifiants administrateur confidentiels. Un administrateur peut modifier ou supprimer définitivement les données.",
    ],
    rulesTitle: "6. Liste de contrôle qualité",
    rules: [
      "Utilisez toujours la même écriture pour un camion ou un numéro de plaque.",
      "Saisissez le carburant déduit d'un voyage dans Carburant consommé ; saisissez les autres coûts dans Dépenses.",
      "Vérifiez la date avant d'enregistrer, car les rapports sont regroupés par date.",
      "Ajoutez une note lorsqu'une valeur pourrait nécessiter une explication plus tard.",
      "Téléchargez régulièrement le rapport Excel mensuel comme sauvegarde externe.",
    ],
    warningTitle: "Avant de supprimer",
    warningBody: "Une suppression ne peut pas être annulée depuis l'interface. Exportez d'abord vos données si l'enregistrement peut être utile plus tard.",
    accessDenied: "Cette page est réservée aux administrateurs.",
    backHome: "Retour à l'accueil",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

function localDateValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function saveCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function GuideSection({
  icon,
  title,
  intro,
  items,
}: {
  icon: string;
  title: string;
  intro?: string;
  items: string[];
}) {
  return (
    <section className="rounded-xl border border-base-300 bg-base-100 p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className={`${icon} mt-0.5 size-6 shrink-0 text-primary`}></span>
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          {intro ? <p className="mt-1 text-sm leading-6 text-base-content/70">{intro}</p> : null}
        </div>
      </div>
      <ol className="ml-9 list-decimal space-y-2 text-sm leading-6 text-base-content/80">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ol>
    </section>
  );
}

export function meta() {
  return [
    { title: "Admin Dashboard - Compta" },
    { name: "description", content: "Compta administrator dashboard and operating guide." },
  ];
}

export default function AdminDashboard() {
  const { state } = useAuth();
  const { language } = useI18n();
  const text = copy[language];
  const today = useMemo(() => localDateValue(new Date()), []);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (state.status !== "ready" || !state.authenticated || !state.user.isAdmin) return;
    let active = true;

    async function loadToday() {
      setLoading(true);
      setError("");
      try {
        const query = `from=${encodeURIComponent(today)}&to=${encodeURIComponent(today)}`;
        const [tripResponse, expenseResponse] = await Promise.all([
          fetch(`${apiUrl("/api/trips")}?${query}`, { credentials: "include" }),
          fetch(`${apiUrl("/api/expenses")}?${query}`, { credentials: "include" }),
        ]);
        if (!tripResponse.ok || !expenseResponse.ok) throw new Error("Dashboard request failed");
        const [tripData, expenseData] = await Promise.all([tripResponse.json(), expenseResponse.json()]);
        if (active) {
          setTrips(tripData);
          setExpenses(expenseData);
        }
      } catch {
        if (active) setError(text.loadError);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadToday();
    return () => {
      active = false;
    };
  }, [state.status, state.authenticated, state.status === "ready" && state.authenticated ? state.user.isAdmin : false, today, text.loadError]);

  if (state.status !== "ready") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!state.authenticated) {
    return <Navigate to="/login?redirectTo=%2Fadmin" replace />;
  }

  if (!state.user.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
          <div className="card max-w-lg border border-warning/30 bg-base-100 shadow-sm">
            <div className="card-body items-center text-center">
              <span className="icon-[tabler--shield-lock] size-12 text-warning"></span>
              <h1 className="card-title">{text.accessDenied}</h1>
              <a href="/" className="btn btn-primary mt-2">{text.backHome}</a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const income = trips.reduce((sum, trip) => sum + Number(trip.income ?? 0), 0);
  const fuel = trips.reduce((sum, trip) => sum + Number(trip.fuel_consumed ?? 0), 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
  const distance = trips.reduce((sum, trip) => sum + Number(trip.distance_km ?? 0), 0);
  const net = income - fuel - expenseTotal;
  const displayDate = new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "long",
  }).format(new Date(`${today}T12:00:00`));

  const downloadMonthlyExcel = async () => {
    setDownloading(true);
    setNotice("");
    try {
      const response = await fetch(
        `${apiUrl("/api/reports/daily.xlsx")}?month=${encodeURIComponent(month)}&lang=${encodeURIComponent(language)}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `monthly-report-${month}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setNotice(text.downloadError);
    } finally {
      setDownloading(false);
    }
  };

  const downloadTripsCsv = () => {
    setNotice("");
    if (!trips.length) {
      setNotice(text.noTripsToDownload);
      return;
    }
    saveCsv(
      `trips-${today}.csv`,
      language === "fr"
        ? ["ID", "Date", "Camion", "Trajet", "Distance (km)", "Carburant", "Revenu", "Notes"]
        : ["ID", "Date", "Truck", "Route", "Distance (km)", "Fuel", "Income", "Notes"],
      trips.map((trip) => [
        trip.id, trip.trip_date, trip.truck_label, trip.route_label, trip.distance_km,
        trip.fuel_consumed, trip.income, trip.notes,
      ])
    );
  };

  const downloadExpensesCsv = () => {
    setNotice("");
    if (!expenses.length) {
      setNotice(text.noExpensesToDownload);
      return;
    }
    saveCsv(
      `expenses-${today}.csv`,
      language === "fr"
        ? ["ID", "Date", "Camion", "Catégorie", "Montant", "Notes"]
        : ["ID", "Date", "Truck", "Category", "Amount", "Notes"],
      expenses.map((expense) => [
        expense.id, expense.expense_date, expense.truck_label, expense.category, expense.amount, expense.notes,
      ])
    );
  };

  const stats = [
    { label: text.trips, value: formatNumber(trips.length, language, 0), icon: "icon-[tabler--route]", color: "text-primary" },
    { label: text.income, value: formatMoney(income, language), icon: "icon-[tabler--cash]", color: "text-success" },
    { label: text.fuel, value: formatMoney(fuel, language), icon: "icon-[tabler--gas-station]", color: "text-warning" },
    { label: text.expenses, value: formatMoney(expenseTotal, language), icon: "icon-[tabler--receipt]", color: "text-error" },
    { label: text.net, value: formatMoney(net, language), icon: "icon-[tabler--chart-line]", color: net >= 0 ? "text-success" : "text-error" },
    { label: text.distance, value: `${formatNumber(distance, language)} km`, icon: "icon-[tabler--road]", color: "text-info" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-base-200/30">
      <Navbar />
      <main className="flex-1">
        <section className="border-y border-base-300 bg-base-100">
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-2 text-xs font-bold tracking-[0.22em] text-primary">{text.eyebrow}</p>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{text.title}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-base-content/70">{text.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="/trips/new" className="btn btn-primary">
                  <span className="icon-[tabler--plus] size-5"></span>
                  {text.createTrip}
                </a>
                <a href="/expenses/new" className="btn btn-outline">
                  <span className="icon-[tabler--receipt] size-5"></span>
                  {text.createExpense}
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto space-y-8 px-4 py-8">
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{text.today}</h2>
                <p className="text-sm text-base-content/60">{text.todayHint} {displayDate}</p>
              </div>
              <span className="badge badge-soft badge-primary">{state.user.username}</span>
            </div>

            {error ? (
              <div className="alert alert-error mb-4">
                <span className="icon-[tabler--alert-circle] size-5"></span>
                <span>{error}</span>
              </div>
            ) : null}

            {loading ? (
              <div className="flex min-h-40 items-center justify-center rounded-xl border border-base-300 bg-base-100">
                <span className="loading loading-spinner loading-lg"></span>
                <span className="ml-3 text-base-content/60">{text.loading}</span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
                    <span className={`${stat.icon} ${stat.color} size-7`}></span>
                    <p className="mt-4 text-sm text-base-content/60">{stat.label}</p>
                    <p className="mt-1 break-words text-xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="icon-[tabler--bolt] size-7 text-primary"></span>
                <div>
                  <h2 className="text-xl font-bold">{text.quickActions}</h2>
                  <p className="mt-1 text-sm text-base-content/60">{text.quickActionsHint}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a href="/trips/new" className="btn btn-primary justify-start">
                  <span className="icon-[tabler--route] size-5"></span>{text.createTrip}
                </a>
                <a href="/expenses/new" className="btn btn-primary justify-start">
                  <span className="icon-[tabler--receipt] size-5"></span>{text.createExpense}
                </a>
                <a href="/#trips" className="btn btn-outline justify-start">
                  <span className="icon-[tabler--table] size-5"></span>{text.manageTrips}
                </a>
                <a href="/expenses" className="btn btn-outline justify-start">
                  <span className="icon-[tabler--list-details] size-5"></span>{text.manageExpenses}
                </a>
              </div>
            </section>

            <section className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="icon-[tabler--download] size-7 text-primary"></span>
                <div>
                  <h2 className="text-xl font-bold">{text.downloads}</h2>
                  <p className="mt-1 text-sm text-base-content/60">{text.downloadsHint}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label className="form-control sm:col-span-2">
                  <span className="label-text mb-1">{text.reportMonth}</span>
                  <input
                    type="month"
                    className="input input-bordered w-full"
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                  />
                </label>
                <button type="button" className="btn btn-primary" onClick={downloadMonthlyExcel} disabled={downloading || !month}>
                  {downloading ? <span className="loading loading-spinner loading-sm"></span> : <span className="icon-[tabler--file-spreadsheet] size-5"></span>}
                  {text.monthlyExcel}
                </button>
                <button type="button" className="btn btn-outline" onClick={downloadTripsCsv}>
                  <span className="icon-[tabler--file-type-csv] size-5"></span>{text.todayTripsCsv}
                </button>
                <button type="button" className="btn btn-outline sm:col-span-2" onClick={downloadExpensesCsv}>
                  <span className="icon-[tabler--file-type-csv] size-5"></span>{text.todayExpensesCsv}
                </button>
              </div>
              {notice ? <div className="alert alert-warning mt-4 py-3 text-sm">{notice}</div> : null}
            </section>
          </div>

          <section>
            <div className="rounded-2xl bg-primary p-6 text-primary-content sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] opacity-70">COMPTA</p>
                  <h2 className="mt-2 text-3xl font-black">{text.guide}</h2>
                  <p className="mt-3 max-w-3xl leading-7 opacity-85">{text.guideIntro}</p>
                </div>
                <span className="icon-[tabler--book-2] size-12 shrink-0 opacity-70"></span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <GuideSection icon="icon-[tabler--flag]" title={text.startTitle} items={text.startSteps} />
              <GuideSection
                icon="icon-[tabler--route]"
                title={text.tripTitle}
                intro={`${text.tripBody} ${text.tripFields}`}
                items={text.tripCrud}
              />
              <GuideSection
                icon="icon-[tabler--receipt]"
                title={text.expenseTitle}
                intro={`${text.expenseBody} ${text.expenseFields}`}
                items={text.expenseCrud}
              />
              <GuideSection icon="icon-[tabler--chart-bar]" title={text.reportsTitle} items={text.reportsSteps} />
              <GuideSection icon="icon-[tabler--users]" title={text.usersTitle} items={text.usersSteps} />
              <GuideSection icon="icon-[tabler--checklist]" title={text.rulesTitle} items={text.rules} />
            </div>

            <div className="alert alert-warning mt-5 items-start">
              <span className="icon-[tabler--alert-triangle] mt-0.5 size-6 shrink-0"></span>
              <div>
                <h3 className="font-bold">{text.warningTitle}</h3>
                <p className="mt-1 text-sm">{text.warningBody}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
