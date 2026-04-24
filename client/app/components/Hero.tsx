import { useI18n } from "~/i18n";
import { Link } from "react-router";

export default function Hero() {
    const { t } = useI18n();

    return (
        <section className="relative isolate overflow-hidden bg-base-200/50 py-20 px-4">
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url(https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=2400&q=80)",
                }}
            />
            <div className="absolute inset-0 -z-10 bg-white/85"></div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
            <div className="container mx-auto max-w-4xl text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-base-content mb-6">
                    <span className="inline-block animate-[hero-slide-up_700ms_ease-out_both]">
                        {t("heroTitle")}{" "}
                    </span>
                    <span className="inline-block text-primary animate-[hero-slide-up_700ms_ease-out_120ms_both]">
                        {t("heroTitleAccent")}
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-base-content/70 mb-8 max-w-2xl mx-auto animate-[hero-fade-in_800ms_ease-out_220ms_both]">
                    {t("heroDescription")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/trips/new" className="btn btn-primary btn-lg">
                        <span className="icon-[tabler--plus] size-5"></span>
                        {t("createTrip")}
                    </Link>
                    <button className="btn btn-outline btn-lg">
                        {t("learnMore")}
                        <span className="icon-[tabler--arrow-right] size-5"></span>
                    </button>
                </div>
                <div className="mt-12 flex flex-wrap justify-center gap-8 text-base-content/60">
                    <div className="flex items-center gap-2">
                        <span className="icon-[tabler--check] size-5 text-primary"></span>
                        <span>{t("freeToStart")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="icon-[tabler--check] size-5 text-primary"></span>
                        <span>{t("noCreditCard")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="icon-[tabler--check] size-5 text-primary"></span>
                        <span>{t("cancelAnytime")}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}