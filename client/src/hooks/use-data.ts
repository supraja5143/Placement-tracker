import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertDsaTopic, InsertCsTopic, InsertProject, InsertMockInterview, InsertDailyLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/token";

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// === DSA Hooks ===
export function useDsaTopics() {
  return useQuery({
    queryKey: [api.dsa.list.path],
    queryFn: async () => {
      const res = await fetch(api.dsa.list.path, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch DSA topics");
      return api.dsa.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDsaTopic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertDsaTopic, "userId">) => {
      const res = await fetch(api.dsa.create.path, {
        method: api.dsa.create.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create topic");
      return api.dsa.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dsa.list.path] });
      toast({ title: "Success", description: "DSA Topic added" });
    },
  });
}

export function useUpdateDsaTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertDsaTopic>) => {
      const url = buildUrl(api.dsa.update.path, { id });
      const res = await fetch(url, {
        method: api.dsa.update.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update topic");
      return api.dsa.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.dsa.list.path] }),
  });
}

// === CS Hooks ===
export function useCsTopics() {
  return useQuery({
    queryKey: [api.cs.list.path],
    queryFn: async () => {
      const res = await fetch(api.cs.list.path, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch CS topics");
      return api.cs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCsTopic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertCsTopic, "userId">) => {
      const res = await fetch(api.cs.create.path, {
        method: api.cs.create.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create topic");
      return api.cs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cs.list.path] });
      toast({ title: "Success", description: "CS Topic added" });
    },
  });
}

export function useUpdateCsTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertCsTopic>) => {
      const url = buildUrl(api.cs.update.path, { id });
      const res = await fetch(url, {
        method: api.cs.update.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update topic");
      return api.cs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cs.list.path] }),
  });
}

// === Projects Hooks ===
export function useProjects() {
  return useQuery({
    queryKey: [api.projects.list.path],
    queryFn: async () => {
      const res = await fetch(api.projects.list.path, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return api.projects.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertProject, "userId">) => {
      const res = await fetch(api.projects.create.path, {
        method: api.projects.create.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return api.projects.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      toast({ title: "Success", description: "Project added" });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertProject>) => {
      const url = buildUrl(api.projects.update.path, { id });
      const res = await fetch(url, {
        method: api.projects.update.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return api.projects.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.projects.list.path] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.projects.delete.path, { id });
      const res = await fetch(url, { method: api.projects.delete.method, headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.projects.list.path] });
      toast({ title: "Deleted", description: "Project removed" });
    },
  });
}

// === Mocks Hooks ===
export function useMockInterviews() {
  return useQuery({
    queryKey: [api.mocks.list.path],
    queryFn: async () => {
      const res = await fetch(api.mocks.list.path, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch mock interviews");
      const data = await res.json();
      return api.mocks.list.responses[200].parse(data).map(m => ({
        ...m,
        date: new Date(m.date)
      }));
    },
  });
}

export function useCreateMockInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertMockInterview, "userId">) => {
      const res = await fetch(api.mocks.create.path, {
        method: api.mocks.create.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to log interview");
      return api.mocks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.mocks.list.path] });
      toast({ title: "Success", description: "Mock interview logged" });
    },
  });
}

export function useDeleteMockInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.mocks.delete.path, { id });
      const res = await fetch(url, { method: api.mocks.delete.method, headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to delete interview");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.mocks.list.path] });
      toast({ title: "Deleted", description: "Mock interview removed" });
    },
  });
}

// === Logs Hooks ===
export function useDailyLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertDailyLog, "userId">) => {
      const res = await fetch(api.logs.create.path, {
        method: api.logs.create.method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create log");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      toast({ title: "Logged", description: "Daily activity saved" });
    },
  });
}
