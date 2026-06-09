import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import { Loader2, Download, Trash2, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Signup = {
  id: string;
  name: string | null;
  email: string;
  household_type: string | null;
  consent: boolean;
  created_at: string;
};

const StudySignupsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("study_signups")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Could not load signups");
    } else {
      setSignups((data as Signup[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("study_signups").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete this signup");
      return;
    }
    setSignups((prev) => prev.filter((s) => s.id !== id));
    toast.success("Signup removed");
  };

  const exportCsv = () => {
    const header = ["Email", "Household type", "Consent", "Submitted at"];
    const rows = signups.map((s) => [
      s.email,
      s.household_type ?? "",
      s.consent ? "Yes" : "No",
      new Date(s.created_at).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Study Signups | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="container mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Study Signups
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The Real Week Project — {signups.length} submission{signups.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/real-week-project">Back to project</Link>
            </Button>
            <Button onClick={exportCsv} disabled={signups.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : signups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/50 py-20 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">No signups yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Household type</TableHead>
                  <TableHead>Consent</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-foreground">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.household_type ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.consent ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(s.id)}
                        aria-label="Delete signup"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudySignupsAdmin;
