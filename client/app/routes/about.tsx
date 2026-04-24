import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useI18n } from "~/i18n";

export function meta() {
  return [
    { title: "About Us - Compta" },
    { name: "description", content: "Learn what Compta is and how it helps you track income, expenses, and monthly reports." },
  ];
}

export default function About() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
            <div className="bg-base-300/10 rounded-t-lg p-4 flex items-center gap-3">
              <span className="icon-[tabler--info-circle] size-6 text-primary"></span>
              <h1 className="text-xl font-bold">{t("about")}</h1>
            </div>
            <div className="p-6 text-base-content/80">
              <div className="space-y-4">
                <p>
                  Compta is a simple accounting companion built to help you keep control of your day-to-day activity.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="bg-base-300/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="icon-[tabler--car] size-5 text-primary"></span>
                      Trips
                    </div>
                    <p className="text-sm mt-2 text-base-content/70">Track trip income by date and keep useful notes.</p>
                  </div>
                  <div className="bg-base-300/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="icon-[tabler--receipt] size-5 text-primary"></span>
                      Expenses
                    </div>
                    <p className="text-sm mt-2 text-base-content/70">Record expenses, categorize them, and filter by dates.</p>
                  </div>
                  <div className="bg-base-300/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="icon-[tabler--calendar-stats] size-5 text-primary"></span>
                      Reports
                    </div>
                    <p className="text-sm mt-2 text-base-content/70">See daily net results and export monthly reports to Excel.</p>
                  </div>
                </div>

                <p>
                  Designed with a modern UI and built for speed, Compta lets you focus on decisions—not spreadsheets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
