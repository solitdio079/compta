import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useI18n } from "~/i18n";

export function meta() {
  return [
    { title: "Careers - Compta" },
    { name: "description", content: "Join Compta and help build a modern way to track trips, expenses, and reports." },
  ];
}

export default function Careers() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm">
            <div className="bg-base-300/10 rounded-t-lg p-4 flex items-center gap-3">
              <span className="icon-[tabler--briefcase] size-6 text-primary"></span>
              <h1 className="text-xl font-bold">{t("careers")}</h1>
            </div>
            <div className="p-6 text-base-content/80">
              <div className="space-y-4">
                <p>
                  We’re building Compta to make personal and small-business accounting easier.
                </p>
                <div className="bg-base-300/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="icon-[tabler--sparkles] size-5 text-primary"></span>
                    What we value
                  </div>
                  <p className="text-sm mt-2 text-base-content/70">
                    Clarity, reliability, and a great user experience.
                  </p>
                </div>
                <p>
                  We’re not hiring right now. Check back soon for openings.
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
