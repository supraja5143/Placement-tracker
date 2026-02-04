import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import DsaTracker from "@/pages/DsaTracker";
import CsFundamentals from "@/pages/CsFundamentals";
import Projects from "@/pages/Projects";
import MockInterviews from "@/pages/MockInterviews";
import DailyLog from "@/pages/DailyLog";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route path="/dsa">
        <PrivateRoute component={DsaTracker} />
      </Route>
      <Route path="/cs">
        <PrivateRoute component={CsFundamentals} />
      </Route>
      <Route path="/projects">
        <PrivateRoute component={Projects} />
      </Route>
      <Route path="/mocks">
        <PrivateRoute component={MockInterviews} />
      </Route>
      <Route path="/logs">
        <PrivateRoute component={DailyLog} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
