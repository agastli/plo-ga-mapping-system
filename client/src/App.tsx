import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import CollegeAnalytics from "./pages/CollegeAnalytics";
import DepartmentAnalytics from "./pages/DepartmentAnalytics";
import AnalyticsGuide from "./pages/AnalyticsGuide";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/programs"} component={Programs} />
      <Route path={"/programs/:id"} component={ProgramDetail} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/analytics/guide"} component={AnalyticsGuide} />
      <Route path={"/analytics/college/:id"} component={CollegeAnalytics} />
      <Route path={"/analytics/department/:id"} component={DepartmentAnalytics} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
