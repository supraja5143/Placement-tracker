import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertUser, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getToken, setToken, removeToken } from "@/lib/token";

interface AuthResponse {
  token: string;
  user: { id: number; username: string };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;

      const res = await fetch(api.auth.me.path, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        removeToken();
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return (await res.json()) as User;
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: InsertUser): Promise<AuthResponse> => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
      return (await res.json()) as AuthResponse;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ title: "Welcome back!", description: `Logged in as ${data.user.username}` });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser): Promise<AuthResponse> => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return (await res.json()) as AuthResponse;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ title: "Account created!", description: "You are now logged in." });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: () => {
      removeToken();
      queryClient.setQueryData([api.auth.me.path], null);
      queryClient.clear();
      toast({ title: "Logged out" });
    },
  });

  return {
    user,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
