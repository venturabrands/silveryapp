import { Moon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
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
            <span className="font-serif text-lg font-semibold text-foreground">Terms of Service</span>
          </div>
        </div>
      </header>

      <main className="section-container py-8 prose prose-sm prose-invert max-w-none text-foreground">
        <p className="text-muted-foreground text-sm">Last updated: February 2026</p>

        <h2 className="font-serif text-xl text-foreground">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By using Silvery Sleep Expert, you agree to these Terms of Service. If you do not agree, please do not use the app.
        </p>

        <h2 className="font-serif text-xl text-foreground">2. Description of Service</h2>
        <p className="text-muted-foreground">
          Silvery Sleep Expert provides AI-powered sleep coaching tips, a sleep diary, and general lifestyle advice. The service is provided free of charge.
        </p>

        <h2 className="font-serif text-xl text-foreground">3. Not Medical Advice</h2>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Silvery Sleep Expert is not a medical device or service.</strong> It does not diagnose, treat, cure, or prevent any disease or medical condition. The AI Sleep Guide provides general sleep hygiene and lifestyle suggestions only. Always consult a qualified healthcare professional for medical advice.
        </p>

        <h2 className="font-serif text-xl text-foreground">4. User Accounts</h2>
        <p className="text-muted-foreground">
          You must create an account to use the app. You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration.
        </p>

        <h2 className="font-serif text-xl text-foreground">5. Chat Content</h2>
        <p className="text-muted-foreground">
          Your chat messages are stored to maintain conversation history and improve the service. Please avoid sharing sensitive medical or personal information. We reserve the right to review stored conversations for service improvement and safety purposes.
        </p>

        <h2 className="font-serif text-xl text-foreground">6. Acceptable Use</h2>
        <p className="text-muted-foreground">You agree not to:</p>
        <ul className="text-muted-foreground space-y-1">
          <li>Use the service for any unlawful purpose</li>
          <li>Attempt to misuse or abuse the AI system</li>
          <li>Share your account credentials with others</li>
          <li>Use automated tools to access the service excessively</li>
        </ul>

        <h2 className="font-serif text-xl text-foreground">7. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          The service is provided "as is" without warranties. Silvery shall not be liable for any damages arising from your use of the app or reliance on information provided by the AI Sleep Guide.
        </p>

        <h2 className="font-serif text-xl text-foreground">8. Contact</h2>
        <p className="text-muted-foreground">
          Questions about these terms? Contact us at <a href="mailto:support@silvery.com" className="text-primary">support@silvery.com</a>.
        </p>
      </main>
    </div>
  );
};

export default Terms;
