import { Moon, MessageCircle, LogOut, BarChart3, Activity, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.display_name) setDisplayName(data.display_name);
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const greeting = displayName || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Silvery</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="section-container py-10 space-y-10">
        {/* Greeting */}
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Good evening, {greeting} 🌙
          </h1>
          <p className="text-muted-foreground mt-2">Ready for a restful night?</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/sleep-chat" className="block">
            <div className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-amber transition-shadow">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Sleep Chat</h3>
              <p className="text-muted-foreground text-sm">
                Chat with Silvery's Sleep Guide for personalized tips and bedding advice.
              </p>
            </div>
          </Link>

          <Link to="/sleep-diary" className="block">
            <div className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-amber transition-shadow">
                <CalendarClock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Sleep Diary</h3>
              <p className="text-muted-foreground text-sm">
                Track your weekly sleep schedule, habits, and efficiency in your personal diary.
              </p>
            </div>
          </Link>

          <div className="glass-card rounded-2xl p-6 opacity-60 cursor-default">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Sleep Analytics</h3>
            <p className="text-muted-foreground text-sm">
              Deep-dive into trends and insights based on your diary data.
            </p>
            <span className="text-xs text-primary font-medium mt-3 inline-block">Coming Soon</span>
          </div>

          <div className="glass-card rounded-2xl p-6 opacity-60 cursor-default">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Analytics</h3>
            <p className="text-muted-foreground text-sm">
              Deep-dive into weekly and monthly trends with clear, visual insights.
            </p>
            <span className="text-xs text-primary font-medium mt-3 inline-block">Coming Soon</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
