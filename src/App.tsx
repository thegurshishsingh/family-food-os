import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import InstallPrompt from "@/components/InstallPrompt";
import UpdatePrompt from "@/components/UpdatePrompt";
import PendingSyncIndicator from "@/components/PendingSyncIndicator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth, RequireHousehold, RedirectIfAuthed } from "@/components/RouteGuards";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Planner from "./pages/Planner";
import Guides from "./pages/Guides";
import GuideArticle from "./pages/GuideArticle";
import TheRealWeekProject from "./pages/TheRealWeekProject";
import DinnerPatternReport from "./pages/DinnerPatternReport";
import StudySignupsAdmin from "./pages/StudySignupsAdmin";
import Groceries from "./pages/Groceries";
import FamilyProfile from "./pages/FamilyProfile";
import HouseholdSettings from "./pages/HouseholdSettings";
import Profile from "./pages/Profile";
import PlanHistory from "./pages/PlanHistory";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

import { usePushOpenTracker } from "@/hooks/usePushOpenTracker";

const queryClient = new QueryClient();

const AppRoutes = () => {
  usePushOpenTracker();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/guides/the-dinner-pattern-report" element={<DinnerPatternReport />} />
      <Route path="/real-week-project" element={<TheRealWeekProject />} />
      <Route path="/admin/study-signups" element={<StudySignupsAdmin />} />
      <Route path="/guides/:slug" element={<GuideArticle />} />
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route path="/planner" element={<RequireHousehold><Planner /></RequireHousehold>} />
      <Route path="/groceries" element={<RequireHousehold><Groceries /></RequireHousehold>} />
      <Route path="/memory" element={<Navigate to="/history" replace />} />
      <Route path="/family-profile" element={<RequireHousehold><FamilyProfile /></RequireHousehold>} />
      <Route path="/history" element={<RequireHousehold><PlanHistory /></RequireHousehold>} />
      <Route path="/checkin" element={<Navigate to="/planner" replace />} />
      <Route path="/settings" element={<RequireHousehold><HouseholdSettings /></RequireHousehold>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <UpdatePrompt />
        <PendingSyncIndicator />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
