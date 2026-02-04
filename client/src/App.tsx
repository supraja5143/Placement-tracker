import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";

// Pages
import Dashboard from "@/pages/Dashboard";
import DsaTracker from "@/pages/DsaTracker";
import CsFundamentals from "@/pages/CsFundamentals";
import Projects from "@/pages/Projects";
import MockInterviews from "@/pages/MockInterviews";
import DailyLog from "@/pages/DailyLog";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dsa" component={DsaTracker} />
        <Route path="/cs" component={CsFundamentals} />
        <Route path="/projects" component={Projects} />
        <Route path="/mocks" component={MockInterviews} />
        <Route path="/logs" component={DailyLog} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
