import { Moon, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center gap-4 h-16">
          <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Disclaimer</span>
          </div>
        </div>
      </header>

      <main className="section-container py-8 prose prose-sm prose-invert max-w-none text-foreground">
        <p className="text-muted-foreground text-sm">Last updated: February 2026</p>

        <div className="glass-card rounded-2xl p-6 space-y-4 not-prose mb-8">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Not Medical Advice</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Silvery Sleep Expert provides <strong className="text-foreground">general sleep hygiene and lifestyle tips only</strong>. 
            It is not a medical device, does not diagnose or treat any medical condition, and should not be used as a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>

        <h2 className="font-serif text-xl text-foreground">AI-Generated Content</h2>
        <p className="text-muted-foreground">
          The Sleep Guide is powered by artificial intelligence. While we strive to provide helpful and accurate information, AI responses may occasionally contain errors or outdated advice. Always verify important health information with a qualified professional.
        </p>

        <h2 className="font-serif text-xl text-foreground">When to Seek Professional Help</h2>
        <p className="text-muted-foreground">Please consult a healthcare provider if you experience:</p>
        <ul className="text-muted-foreground space-y-1">
          <li>Persistent difficulty falling or staying asleep (lasting more than a few weeks)</li>
          <li>Excessive daytime sleepiness that interferes with daily activities</li>
          <li>Loud snoring, gasping, or pauses in breathing during sleep</li>
          <li>Unusual behaviours during sleep (sleepwalking, night terrors)</li>
          <li>Sleep problems accompanied by mood changes, anxiety, or depression</li>
          <li>Use of sleep medications or supplements without medical supervision</li>
        </ul>

        <h2 className="font-serif text-xl text-foreground">Emergency Resources</h2>
        <p className="text-muted-foreground">
          If you are in crisis or having thoughts of self-harm, please contact:
        </p>
        <ul className="text-muted-foreground space-y-1">
          <li><strong className="text-foreground">Emergency services:</strong> Call 911 (US) or your local emergency number</li>
          <li><strong className="text-foreground">988 Suicide & Crisis Lifeline:</strong> Call or text 988 (US)</li>
          <li><strong className="text-foreground">Crisis Text Line:</strong> Text HOME to 741741</li>
        </ul>

        <h2 className="font-serif text-xl text-foreground">Limitation of Liability</h2>
        <p className="text-muted-foreground">
          Silvery and its creators are not liable for any health outcomes resulting from the use of this app. 
          By using Silvery Sleep Expert, you acknowledge that the app is for informational and entertainment purposes only.
        </p>

        <h2 className="font-serif text-xl text-foreground">Contact</h2>
        <p className="text-muted-foreground">
          Questions about this disclaimer? Email us at{" "}
          <a href="mailto:support@silvery.com" className="text-primary">support@silvery.com</a>.
        </p>
      </main>
    </div>
  );
};

export default Disclaimer;
