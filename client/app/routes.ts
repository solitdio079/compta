import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("trips/new", "routes/trips.new.tsx"),
    route("expenses", "routes/expenses.tsx"),
    route("expenses/new", "routes/expenses.new.tsx"),
    route("about", "routes/about.tsx"),
    route("contact", "routes/contact.tsx"),
    route("careers", "routes/careers.tsx"),
    route("services/accounting", "routes/services.accounting.tsx"),
    route("services/tax-planning", "routes/services.tax-planning.tsx"),
    route("services/consulting", "routes/services.consulting.tsx"),
    route("services/invoice-services", "routes/services.invoice-services.tsx"),
] satisfies RouteConfig;
