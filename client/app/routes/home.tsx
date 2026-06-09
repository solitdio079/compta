import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import Hero from "~/components/Hero";
import DailyReportTable from "~/components/DailyReportTable";
import PerformanceReport from "~/components/PerformanceReport";
import TripsTable from "~/components/TripsTable";
import { useAuth } from "~/lib/auth";
import { Navigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Compta - Trips, Expenses & Monthly Reports" },
    { name: "description", content: "Track trips income, expenses, and download monthly reports in Excel with Compta." },
  ];
}

export default function Home() {
  const { state } = useAuth();

  if (state.status !== "ready") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1" />
        <Footer />
      </div>
    );
  }

  if (!state.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return ( 
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <Hero />
      <DailyReportTable />
      <PerformanceReport />
      <TripsTable />
      <Footer />
    </div>
  );
}
