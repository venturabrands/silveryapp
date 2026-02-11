import { Moon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
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
            <span className="font-serif text-lg font-semibold text-foreground">Privacy Policy</span>
          </div>
        </div>
      </header>

      <main className="section-container py-8 prose prose-sm prose-invert max-w-none text-foreground">
        <p className="text-muted-foreground text-sm">Last updated: February 2026</p>

        <h2 className="font-serif text-xl text-foreground">1. Information We Collect</h2>
        <p className="text-muted-foreground">When you use Silvery Sleep Expert, we collect:</p>
        <ul className="text-muted-foreground space-y-1">
          <li><strong className="text-foreground">Account information:</strong> Email address and display name provided during registration.</li>
          <li><strong className="text-foreground">Chat content:</strong> Messages exchanged with the AI Sleep Guide to improve the service.</li>
          <li><strong className="text-foreground">Sleep diary data:</strong> Sleep metrics and habits you voluntarily log.</li>
          <li><strong className="text-foreground">Usage analytics:</strong> Basic event data (e.g., login, message sent) to understand how the app is used. We do not track message content in analytics.</li>
        </ul>

        <h2 className="font-serif text-xl text-foreground">2. How We Use Your Information</h2>
        <ul className="text-muted-foreground space-y-1">
          <li>To provide and improve the AI Sleep Guide service</li>
          <li>To store your chat history and sleep diary for your convenience</li>
          <li>To understand app usage patterns and improve the experience</li>
          <li>To respond to support requests</li>
        </ul>

        <h2 className="font-serif text-xl text-foreground">3. Data Storage & Security</h2>
        <p className="text-muted-foreground">
          Your data is stored securely using industry-standard encryption. We use Supabase for our database infrastructure with row-level security policies ensuring users can only access their own data.
        </p>

        <h2 className="font-serif text-xl text-foreground">4. Data Deletion</h2>
        <p className="text-muted-foreground">
          You can delete individual conversations from your Account page. To delete your entire account and all associated data, please contact us at support@silvery.com.
        </p>

        <h2 className="font-serif text-xl text-foreground">5. Third-Party Services</h2>
        <p className="text-muted-foreground">
          We use AI language models to power the Sleep Guide. Your messages are sent to AI providers for processing but are not used to train their models.
        </p>

        <h2 className="font-serif text-xl text-foreground">6. Contact</h2>
        <p className="text-muted-foreground">
          For privacy questions or data requests, email us at <a href="mailto:support@silvery.com" className="text-primary">support@silvery.com</a>.
        </p>
      </main>
    </div>
  );
};

export default Privacy;
