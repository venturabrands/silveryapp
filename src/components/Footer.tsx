import { Moon } from "lucide-react";
const Footer = () => {
  return <footer className="border-t border-border/30 py-16">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            <span className="font-serif text-lg font-semibold text-foreground">Silvery</span>
          </div>

          <div className="flex items-center gap-8">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Support
            </a>
          </div>

          <p className="text-xs text-muted-foreground">© 2026 Silvery. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;