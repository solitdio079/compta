import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/root";
import "./app.css";

import { useLocation, useNavigate } from "react-router";
import { I18nProvider } from "~/i18n";
import { AuthProvider } from "~/lib/auth";
import { useAuth } from "~/lib/auth";

async function loadFlyonUI() {
  return import('flyonui/flyonui');
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useAuth();

  useEffect(() => {
    const initFlyonUI = async () => {
      await loadFlyonUI();
    };

    initFlyonUI();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (
        window.HSStaticMethods &&
        typeof window.HSStaticMethods.autoInit === 'function'
      ) {
        window.HSStaticMethods.autoInit();
      }
    }, 100);
  }, [location.pathname]);

  useEffect(() => {
    if (state.status !== "ready") return;

    const publicPaths = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);
    const path = location.pathname;

    if (!state.authenticated && !publicPaths.has(path)) {
      const redirectTo = `${path}${location.search || ""}`;
      navigate(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, { replace: true });
    }

    if (state.authenticated && publicPaths.has(path)) {
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get("redirectTo") || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [state.status, state.authenticated, location.pathname, location.search, navigate]);

  return (
    <Outlet />
  );
}

function AppWithProviders() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </I18nProvider>
  );
}

export default AppWithProviders;

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
