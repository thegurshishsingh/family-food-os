import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth, RequireHousehold, RedirectIfAuthed } from "@/components/RouteGuards";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Planner from "./pages/Planner";
import Groceries from "./pages/Groceries";
import MealMemory from "./pages/MealMemory";
import FamilyProfile from "./pages/FamilyProfile";
import HouseholdSettings from "./pages/HouseholdSettings";
import Profile from "./pages/Profile";
import PlanHistory from "./pages/PlanHistory";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
            <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/planner" element={<RequireHousehold><Planner /></RequireHousehold>} />
            <Route path="/groceries" element={<RequireHousehold><Groceries /></RequireHousehold>} />
            <Route path="/memory" element={<RequireHousehold><MealMemory /></RequireHousehold>} />
            <Route path="/family-profile" element={<RequireHousehold><FamilyProfile /></RequireHousehold>} />
            <Route path="/history" element={<RequireHousehold><PlanHistory /></RequireHousehold>} />
            <Route path="/checkin" element={<RequireHousehold><CheckIn /></RequireHousehold>} />
            <Route path="/settings" element={<RequireHousehold><HouseholdSettings /></RequireHousehold>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
