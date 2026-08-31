import { useAuth } from "@/contexts/AuthContext";
import DashboardReference from "./DashboardReference";
import LandingPage from "./LandingPage";
import { Loader2 } from "lucide-react";

export default function HomeRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="h-7 w-7 animate-spin text-blue-400" /></div>;
  return user ? <DashboardReference /> : <LandingPage />;
}
