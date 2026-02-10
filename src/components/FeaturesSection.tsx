import { Thermometer, Shield, Droplets, Sparkles } from "lucide-react";

const features = [
  {
    icon: Thermometer,
    title: "Self-Cooling Fabric",
    description:
      "Silver conducts heat 400x better than cotton, actively moving excess warmth away from your body so you stay cool all night.",
  },
  {
    icon: Shield,
    title: "Self-Cleaning Technology",
    description:
      "Lab-tested to prevent 99.9% of bacterial growth. Your sheets stay fresh 3x longer, meaning fewer washes and better hygiene.",
  },
  {
    icon: Droplets,
    title: "Advanced Moisture Wicking",
    description:
      "Breathable fabric instantly pulls away moisture, keeping you dry and sweat-free throughout the entire night.",
  },
  {
    icon: Sparkles,
    title: "Luxuriously Soft",
    description:
      "Silky-soft texture that feels as smooth as 5-star hotel sheets while maintaining peak cooling performance.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32">
      <div className="section-container">
        <p className="text-primary text-xs font-semibold tracking-[0.3em] uppercase text-center mb-4">
          Our Technology
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-6 tracking-tight">
          Real material science
        </h2>
        <p className="text-muted-foreground text-base text-center max-w-2xl mx-auto mb-20">
          NASA-inspired silver-infused fabric that adapts to your body's rhythms and keeps you at your ideal temperature.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-primary/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-shadow duration-300 group-hover:glow-blue">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
