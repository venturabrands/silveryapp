import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="section-container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2 group">
          <Moon className="w-6 h-6 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-serif text-xl font-semibold text-foreground">Dreamwell</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#science" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            The Science
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
