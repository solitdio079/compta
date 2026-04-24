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
                  {t("aboutIntro")}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="bg-base-300/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="icon-[tabler--car] size-5 text-primary"></span>
                      {t("aboutTripsTitle")}
                    </div>
                    <p className="text-sm mt-2 text-base-content/70">{t("aboutTripsDesc")}</p>
                  </div>
                  <div className="bg-base-300/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="icon-[tabler--receipt] size-5 text-primary"></span>
                      {t("aboutExpensesTitle")}
                    </div>
                    <p className="text-sm mt-2 text-base-content/70">{t("aboutExpensesDesc")}</p>
                  </div>
                  <div className="bg-base-300/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="icon-[tabler--calendar-stats] size-5 text-primary"></span>
                      {t("aboutReportsTitle")}
                    </div>
                    <p className="text-sm mt-2 text-base-content/70">{t("aboutReportsDesc")}</p>
                  </div>
                </div>

                <p>
                  {t("aboutOutro")}
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
