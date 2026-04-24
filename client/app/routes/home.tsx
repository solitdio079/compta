import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import Hero from "~/components/Hero";
import DailyReportTable from "~/components/DailyReportTable";
import TripsTable from "~/components/TripsTable";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Compta - Trips, Expenses & Monthly Reports" },
    { name: "description", content: "Track trips income, expenses, and download monthly reports in Excel with Compta." },
  ];
}

export default function Home() {
  return ( 
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <Hero />
      <DailyReportTable />
      <TripsTable />
      <Footer />
    </div>
  );
}
