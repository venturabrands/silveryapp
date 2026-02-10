import { Moon, TrendingDown, Clock, Brain } from "lucide-react";

const features = [
  {
    icon: Moon,
    title: "Sleep Need",
    description:
      "Discover your genetically unique sleep need — the hours your body truly requires, not an arbitrary 8-hour target.",
  },
  {
    icon: TrendingDown,
    title: "Sleep Debt Tracking",
    description:
      "See the running total of sleep you've missed. Reduce it and feel the difference in your energy and focus.",
  },
  {
    icon: Clock,
    title: "Circadian Rhythm",
    description:
      "Know your ideal windows for sleeping, waking, and peak performance based on your internal clock.",
  },
  {
    icon: Brain,
    title: "Smart Routines",
    description:
      "Personalized schedules designed to address the root causes of poor sleep, not just the symptoms.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32">
      <div className="section-container">
        <p className="text-primary text-sm font-semibold tracking-[0.25em] uppercase text-center mb-4">
          How It Works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-center mb-6">
          Science-backed sleep
        </h2>
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          Nearly 100 years of sleep research, distilled into a system that learns your unique biology.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-primary/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-amber transition-shadow duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
