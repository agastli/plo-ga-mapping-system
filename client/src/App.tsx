import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import EditorDashboard from "./pages/EditorDashboard";
import ViewerDashboard from "./pages/ViewerDashboard";
import Upload from "./pages/Upload";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import AddProgram from "./pages/AddProgram";
import AdminDashboard from "./pages/AdminDashboard";
import DeleteProgram from "./pages/DeleteProgram";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import CollegeAnalytics from "./pages/CollegeAnalytics";
import DepartmentAnalytics from "./pages/DepartmentAnalytics";
import AnalyticsGuide from "./pages/AnalyticsGuide";
import GAAnalytics from "./pages/GAAnalytics";
import GAAnalyticsGuide from "./pages/GAAnalyticsGuide";
import CompetencyAnalytics from "./pages/CompetencyAnalytics";
import CompetencyAnalyticsGuide from "./pages/CompetencyAnalyticsGuide";
import UnifiedAnalytics from "./pages/UnifiedAnalytics";
import ReportTemplates from "./pages/ReportTemplates";
import ClusterManagement from "./pages/ClusterManagement";
import DataCompletenessDashboard from "./pages/DataCompletenessDashboard";
import DataValidationTool from "./pages/DataValidationTool";
import OrganizationalStructure from "./pages/OrganizationalStructure";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import RecoverUsername from "./pages/RecoverUsername";
import ProgramBrowser from "./pages/ProgramBrowser";
import UserProfile from "./pages/UserProfile";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/recover-username"} component={RecoverUsername} />
      <Route path={"/profile"}>
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      </Route>
      <Route path={"/"}>  
        <RoleBasedRedirect />
      </Route>
      <Route path={"/admin-dashboard"}>
        <ProtectedRoute requireRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/editor-dashboard"}>
        <ProtectedRoute requireRole="editor">
          <EditorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/viewer-dashboard"}>
        <ProtectedRoute requireRole="viewer">
          <ViewerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/program-browser"}>
        <ProtectedRoute>
          <ProgramBrowser />
        </ProtectedRoute>
      </Route>
      <Route path={"/upload"} component={Upload} />
      <Route path={"/programs"} component={Programs} />
      <Route path={"/programs/new"} component={AddProgram} />
      <Route path={"/programs/delete"} component={DeleteProgram} />
      <Route path={"/programs/:id"} component={ProgramDetail} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/analytics"}>
        <ProtectedRoute>
          <UnifiedAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path={"/analytics/guide"}>
        <ProtectedRoute>
          <AnalyticsGuide />
        </ProtectedRoute>
      </Route>
      <Route path={"/analytics/ga"}>
        <ProtectedRoute>
          <GAAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path={"/analytics/ga/guide"}>
        <ProtectedRoute>
          <GAAnalyticsGuide />
        </ProtectedRoute>
      </Route>
      <Route path={"/analytics/competencies"}>
        <ProtectedRoute>
          <CompetencyAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path={"/analytics/competencies/guide"}>
        <ProtectedRoute>
          <CompetencyAnalyticsGuide />
        </ProtectedRoute>
      </Route>
      <Route path={"/analytics/college/:id"}>
        <ProtectedRoute>
          <CollegeAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path={"/analytics/department/:id"}>
        <ProtectedRoute>
          <DepartmentAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path={"/templates"} component={ReportTemplates} />
      <Route path={"/admin/clusters"} component={ClusterManagement} />
      <Route path={"/admin/completeness"} component={DataCompletenessDashboard} />
      <Route path={"/admin/validation"} component={DataValidationTool} />
      <Route path={"/admin/structure"} component={OrganizationalStructure} />
      <Route path={"/admin/users"} component={UserManagement} />
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
