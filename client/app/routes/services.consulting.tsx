import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useI18n } from "~/i18n";

export function meta() {
  return [
    { title: "Consulting - Compta" },
    { name: "description", content: "Consulting services" },
  ];
}

export default function ConsultingService() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
            <div className="bg-base-300/10 rounded-t-lg p-4 flex items-center gap-3">
              <span className="icon-[tabler--briefcase] size-6 text-primary"></span>
              <h1 className="text-xl font-bold">{t("consulting")}</h1>
            </div>
            <div className="p-6 text-base-content/80">
              <p>
                Consulting service page.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
