import { useState, useCallback, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { getToken, setToken, removeToken } from "@/lib/token";
import { queryClient } from "@/lib/queryClient";

interface AuthUser {
  id: number;
  username: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "Login failed";
      try { message = JSON.parse(text).message || message; } catch { message = text || message; }
      throw new Error(message);
    }

    const data: { token: string; user: AuthUser } = await res.json();
    setToken(data.token);
    setTokenState(data.token);
    return data.user;
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth?action=register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "Registration failed";
      try { message = JSON.parse(text).message || message; } catch { message = text || message; }
      throw new Error(message);
    }

    const data: { token: string; user: AuthUser } = await res.json();
    setToken(data.token);
    setTokenState(data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    queryClient.clear();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
