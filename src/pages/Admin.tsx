import { useState, useEffect } from "react";
import { Moon, ArrowLeft, Search, Shield, AlertTriangle, Loader2, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [newCodes, setNewCodes] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const searchUsers = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("display_name", `%${searchEmail.trim()}%`);

    // For each profile, fetch entitlements
    const results = await Promise.all(
      (data || []).map(async (profile: any) => {
        const { data: ent } = await supabase
          .from("entitlements")
          .select("*")
          .eq("user_id", profile.user_id)
          .eq("active", true)
          .maybeSingle();
        return { ...profile, entitlement: ent };
      })
    );
    setSearchResults(results);
    setSearching(false);
  };

  const grantEntitlement = async (userId: string, type: string, source: string) => {
    const { error } = await supabase.from("entitlements").insert({
      user_id: userId,
      type,
      active: true,
      source,
    });
    if (error) {
      toast.error("Failed to grant entitlement");
    } else {
      toast.success("Entitlement granted!");
      searchUsers(); // Refresh
    }
  };

  const revokeEntitlement = async (entitlementId: string) => {
    const { error } = await supabase
      .from("entitlements")
      .update({ active: false })
      .eq("id", entitlementId);
    if (error) {
      toast.error("Failed to revoke");
    } else {
      toast.success("Entitlement revoked");
      searchUsers();
    }
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

  const generateCodes = async () => {
    const count = parseInt(newCodes) || 0;
    if (count < 1 || count > 100) {
      toast.error("Enter a number between 1 and 100");
      return;
    }
    setGenerating(true);
    const codes = Array.from({ length: count }, () =>
      "SILVERY-" + crypto.randomUUID().slice(0, 8).toUpperCase()
    );
    const { error } = await supabase
      .from("claim_codes")
      .insert(codes.map((code) => ({ code, is_redeemed: false })));
    if (error) {
      toast.error("Failed to generate codes");
    } else {
      toast.success(`Generated ${count} codes`);
      // Show codes to admin
      navigator.clipboard.writeText(codes.join("\n"));
      toast.info("Codes copied to clipboard!");
    }
    setNewCodes("");
    setGenerating(false);
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
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex-1 gap-2" onClick={loadModLogs}>
              <AlertTriangle className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Codes
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
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
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.display_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground">ID: {u.user_id}</p>
                  </div>
                  {u.entitlement?.active ? (
                    <div className="text-right">
                      <p className="text-xs text-primary">{u.entitlement.type}</p>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-1 text-xs h-7 rounded-lg"
                        onClick={() => revokeEntitlement(u.entitlement.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="text-xs h-7 rounded-lg"
                        onClick={() => grantEntitlement(u.user_id, "LIFETIME_SILVERY_CUSTOMER", "admin")}
                      >
                        Grant Lifetime
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Moderation Tab */}
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

          {/* Codes Tab */}
          <TabsContent value="codes" className="space-y-4 mt-4">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Generate Claim Codes</h3>
              <p className="text-sm text-muted-foreground">
                Codes will be in format SILVERY-XXXXXXXX and copied to your clipboard.
              </p>
              <div className="flex gap-3">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={newCodes}
                  onChange={(e) => setNewCodes(e.target.value)}
                  placeholder="Number of codes (1-100)"
                  className="bg-muted border-border/50 rounded-xl"
                />
                <Button onClick={generateCodes} disabled={generating} className="rounded-xl">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
