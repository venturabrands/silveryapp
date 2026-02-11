import { useState, useEffect } from "react";
import { Moon, ArrowLeft, Shield, LogOut, Loader2, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string | null;
  updated_at: string;
}

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile?.display_name) setDisplayName(profile.display_name);
      setLoading(false);
    };
    load();
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setLoadingConvos(true);
    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setConversations((data || []) as Conversation[]);
    setLoadingConvos(false);
  };

  const deleteConversation = async (convId: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", convId);
    if (error) {
      toast.error("Failed to delete conversation");
    } else {
      toast.success("Conversation deleted");
      setConversations((prev) => prev.filter((c) => c.id !== convId));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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

            {/* Access Status */}
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Access Status</h3>
              </div>
              <p className="text-sm text-primary font-medium">✓ Lifetime Access</p>
            </div>

            {/* Chat History Notice */}
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Chat History</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your chat history is stored to help us improve the Sleep Guide. Please avoid sharing sensitive medical or personal information.
              </p>
              
              {/* Conversation list */}
              <div className="space-y-2 pt-2">
                {loadingConvos ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No conversations yet.</p>
                ) : (
                  conversations.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{c.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(c.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => deleteConversation(c.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

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
