import { Moon, ArrowLeft, Shield, FileText, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center gap-4 h-16">
          <Link to="/account" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Support</span>
          </div>
        </div>
      </header>

      <main className="section-container py-8 space-y-6">
        {/* Contact */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg font-semibold text-foreground">Contact Us</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Have a question, feedback, or need help? We'd love to hear from you.
          </p>
          <a href="mailto:support@silvery.com">
            <Button variant="outline" className="rounded-xl w-full">
              <Mail className="w-4 h-4 mr-2" /> support@silvery.com
            </Button>
          </a>
        </div>

        {/* Disclaimer */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg font-semibold text-foreground">Medical Disclaimer</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Silvery's Sleep Guide provides general sleep hygiene and lifestyle tips only. It is <strong className="text-foreground">not a medical device</strong> and does not provide medical diagnoses, treatment recommendations, or prescriptions.
          </p>
          <p className="text-sm text-muted-foreground">
            If you have a medical condition, sleep disorder, or mental health concern, please consult a qualified healthcare professional. If you are in crisis, contact emergency services or the 988 Suicide & Crisis Lifeline.
          </p>
        </div>

        {/* Legal links */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg font-semibold text-foreground">Legal</h3>
          </div>
          <div className="space-y-2">
            <Link to="/privacy" className="block text-sm text-primary hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="block text-sm text-primary hover:underline">Terms of Service</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
