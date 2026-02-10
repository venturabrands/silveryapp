import silveryLogo from "@/assets/silvery-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-16">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <img src={silveryLogo} alt="Silvery" className="h-4 invert" />

          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 Silvery®. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
