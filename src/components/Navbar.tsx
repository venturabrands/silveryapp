import { Button } from "@/components/ui/button";
import silveryLogo from "@/assets/silvery-logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="section-container flex items-center justify-between h-16">
        <a href="/" className="flex items-center">
          <img src={silveryLogo} alt="Silvery" className="h-5 invert" />
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#science" className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            The Science
          </a>
          <a href="#faq" className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </div>

        <Button variant="navCta" size="sm">
          Try Free
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
