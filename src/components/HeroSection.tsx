import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-sleep.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Serene night sky"
          className="w-full h-full object-cover opacity-30"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container text-center py-32">
        <p className="text-primary font-semibold text-xs tracking-[0.3em] uppercase mb-8 animate-fade-up">
          Sleep Better · Feel Better
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[1.05] mb-8 tracking-tight animate-fade-up-delay-1">
          Your best days
          <br />
          <span className="gradient-text-blue">start tonight</span>
        </h1>

        <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed mb-12 animate-fade-up-delay-2">
          Understand your sleep patterns, reduce sleep debt, and unlock the energy your body is designed to have.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delay-3">
          <Button variant="hero" size="lg">
            Start Sleeping Better
          </Button>
          <Button variant="outline" size="lg" className="rounded-full border-border/60 text-foreground hover:bg-muted">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
