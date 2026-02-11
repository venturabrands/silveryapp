import { Moon, Lock, ArrowLeft, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Paywall = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Unlock Full Access
        </h2>
        <p className="text-muted-foreground">
          Enter your Silvery activation code to unlock all features — including the AI Sleep Expert, Sleep Diary, and personalised insights.
        </p>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Full access includes:</p>
            <ul className="text-sm text-muted-foreground space-y-1.5 text-left">
              <li className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary flex-shrink-0" />
                Unlimited AI Sleep Expert conversations
              </li>
              <li className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary flex-shrink-0" />
                Full Sleep Diary with analytics
              </li>
              <li className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary flex-shrink-0" />
                Personalised sleep habit tracking
              </li>
            </ul>
          </div>

          <div className="border-t border-border/50 pt-4 space-y-3">
            <Link to="/account">
              <Button className="w-full rounded-xl gap-2" size="lg">
                <Gift className="w-4 h-4" />
                Enter Silvery Code
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Silvery mattress customers get free lifetime access. Enter your activation code on the Account page.
            </p>
          </div>
        </div>

        <Link to="/dashboard">
          <Button variant="ghost" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Paywall;
