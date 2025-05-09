import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./lib/protectedRoute";
import { queryClient } from "./lib/queryClient";
import CourseSessionsPage from "./pages/CourseSessionsPage";
import DepartmentCoursesPage from "./pages/DepartmentCoursesPage";
import DashboardPage from "./pages/DashboardPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import SessionSemestersPage from "./pages/SessionSemestersPage";
import SubjectPage from "./pages/SubjectPage";
import SemesterSubjectsPage from "./pages/SemesterSubjectsPage";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/departments" component={DepartmentsPage} />
      <ProtectedRoute
        path="/department-courses/:departmentId"
        component={DepartmentCoursesPage}
      />
      <ProtectedRoute
        path="/course-sessions/:courseId"
        component={CourseSessionsPage}
      />
      <ProtectedRoute
        path="/session-semesters/:sessionId"
        component={SessionSemestersPage}
      />
      <ProtectedRoute
        path="/semester-subjects/:semesterId"
        component={SemesterSubjectsPage}
      />

      <ProtectedRoute path="/subjects" component={SubjectPage} />

      {/* <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} /> */}
      <Route path="/auth" component={LoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
