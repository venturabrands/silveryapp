import { useState, useEffect } from "react";
import { ArrowLeft, Search, Shield, AlertTriangle, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [user]);

  const searchUsers = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("display_name", `%${searchEmail.trim()}%`);
    setSearchResults(data || []);
    setSearching(false);
  };

  const loadModLogs = async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("moderation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setModerationLogs(data || []);
    setLogsLoading(false);
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="font-serif text-xl text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
          <Link to="/dashboard">
            <Button variant="outline" className="rounded-xl">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center gap-4 h-16">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Admin</span>
          </div>
        </div>
      </header>

      <main className="section-container py-8 space-y-6">
        <Tabs defaultValue="users">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1 gap-2">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex-1 gap-2" onClick={loadModLogs}>
              <AlertTriangle className="w-4 h-4" /> Moderation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="flex gap-3">
              <Input
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Search by name..."
                className="bg-muted border-border/50 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              />
              <Button onClick={searchUsers} disabled={searching} className="rounded-xl">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            {searchResults.map((u) => (
              <div key={u.id} className="glass-card rounded-2xl p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">{u.display_name || "No name"}</p>
                <p className="text-xs text-muted-foreground">ID: {u.user_id}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4 mt-4">
            {logsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : moderationLogs.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No moderation flags yet.</p>
              </div>
            ) : (
              moderationLogs.map((log) => (
                <div key={log.id} className="glass-card rounded-2xl p-4 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-destructive">{log.flag_type}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">User: {log.user_id}</p>
                  {log.payload && (
                    <pre className="text-xs text-muted-foreground bg-muted p-2 rounded-lg overflow-x-auto mt-2">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
