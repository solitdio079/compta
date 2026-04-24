import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "~/lib/api";

type AuthUser = {
  id: number;
  username: string;
  isAdmin: boolean;
};

type AuthState =
  | { status: "loading"; authenticated: false; user?: undefined }
  | { status: "ready"; authenticated: false; user?: undefined }
  | { status: "ready"; authenticated: true; user: AuthUser };

type AuthContextValue = {
  state: AuthState;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", authenticated: false });

  const refresh = async () => {
    try {
      const res = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
      const json = await res.json();

      if (json?.authenticated && json?.user) {
        setState({ status: "ready", authenticated: true, user: json.user });
      } else {
        setState({ status: "ready", authenticated: false });
      }
    } catch {
      setState({ status: "ready", authenticated: false });
    }
  };

  const logout = async () => {
    await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
    await refresh();
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(() => ({ state, refresh, logout }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
