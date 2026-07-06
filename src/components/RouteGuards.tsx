import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import { ReactNode } from "react";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const RequireHousehold = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { household, loading: hhLoading } = useHousehold();
  if (authLoading || hhLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!household) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

export const RedirectIfAuthed = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    const next = new URLSearchParams(window.location.search).get("next");
    return <Navigate to={next && next.startsWith("/") ? next : "/planner"} replace />;
  }
  return <>{children}</>;
};

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);
