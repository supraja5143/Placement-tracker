import { useState, useCallback } from "react";
import { getToken, setToken, removeToken } from "@/lib/token";
import { queryClient } from "@/lib/queryClient";

interface AuthUser {
  id: number;
  username: string;
}

export function useAuth() {
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

  return {
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };
}
