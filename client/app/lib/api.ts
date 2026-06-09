export function getApiBaseUrl() {
  // In production, set VITE_API_BASE_URL in your Coolify client service env.
  // Example: https://api-compta.bysolitdio.com
  const configured = (import.meta as any).env?.VITE_API_BASE_URL;
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "127.0.0.1" || hostname === "localhost") {
      return `${protocol}//${hostname}:3000`;
    }
  }

  return "http://localhost:3000";
}

export function apiUrl(path: string) {
  const base = String(getApiBaseUrl()).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
