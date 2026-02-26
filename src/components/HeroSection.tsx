import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-sleep.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16 mb-0">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Serene night sky"
          className="w-full h-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container text-center py-32">
        <p className="text-primary font-sans text-sm font-semibold tracking-[0.25em] uppercase mb-6 animate-fade-up">
          Sleep Better · Feel Better
        </p>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[1.1] mb-8 animate-fade-up-delay-1">
          Your best days
          <br />
          <span className="gradient-text">start tonight</span>
        </h1>

        <p className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 animate-fade-up-delay-2">
          Free AI Sleep Expert and personalised insights — all included.
        </p>
        <p className="text-sm text-muted-foreground mb-12 animate-fade-up-delay-2">
          Start improving your sleep tonight.
        </p>

        <div className="flex justify-center animate-fade-up-delay-3">
          <Button variant="hero" size="lg" onClick={() => navigate("/sleep-chat")}>
            Start Sleeping Better
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
