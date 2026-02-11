import { useState, useEffect } from "react";
import { Moon, ArrowLeft, Gift, Shield, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getUserEntitlement, hasAccess, type Entitlement } from "@/lib/entitlements";
import { toast } from "sonner";

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [ent, profile] = await Promise.all([
        getUserEntitlement(user.id),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
      ]);
      setEntitlement(ent);
      if (profile.data?.display_name) setDisplayName(profile.data.display_name);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setRedeeming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ code: code.trim() }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) {
        toast.error(result.error || "Failed to redeem code");
      } else {
        toast.success(result.message);
        setCode("");
        // Refresh entitlement
        if (user) {
          const ent = await getUserEntitlement(user.id);
          setEntitlement(ent);
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setRedeeming(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const entitled = hasAccess(entitlement);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center gap-4 h-16">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Account</span>
          </div>
        </div>
      </header>

      <main className="section-container py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Profile */}
            <div className="glass-card rounded-2xl p-6 space-y-2">
              <h3 className="font-serif text-lg font-semibold text-foreground">Profile</h3>
              <p className="text-sm text-muted-foreground">Name: {displayName || "Not set"}</p>
              <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
            </div>

            {/* Entitlement Status */}
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Access Status</h3>
              </div>
              {entitled ? (
                <div className="space-y-1">
                  <p className="text-sm text-primary font-medium">
                    ✓ {entitlement?.type === "LIFETIME_SILVERY_CUSTOMER" ? "Lifetime Access" : "Active Subscriber"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Source: {entitlement?.source} • Since {new Date(entitlement!.created_at).toLocaleDateString()}
                  </p>
                  {entitlement?.expires_at && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(entitlement.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription. Redeem a code below or subscribe to access all features.</p>
              )}
            </div>

            {/* Claim Code */}
            {!entitled && (
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold text-foreground">Silvery Customer?</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you purchased a Silvery product, enter your claim code to unlock lifetime access.
                </p>
                <div className="flex gap-3">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code..."
                    className="bg-muted border-border/50 rounded-xl"
                  />
                  <Button onClick={handleRedeem} disabled={redeeming || !code.trim()} className="rounded-xl">
                    {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                  </Button>
                </div>
              </div>
            )}

            {/* Sign Out */}
            <Button variant="outline" onClick={handleSignOut} className="w-full rounded-xl">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </>
        )}
      </main>
    </div>
  );
};

export default Account;
