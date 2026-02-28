import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const primaryFeatures = [
  {
    icon: MessageCircle,
    title: "Sleep Chat",
    description:
      "Chat with Silvery's Sleep Guide for personalised tips, bedding advice, and better nighttime routines.",
    link: "/sleep-chat",
  },
];

const secondaryFeatures = [];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="section-container">
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-center mb-4">
          App Features
        </h2>
        <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          Everything you need to sleep better — completely free with your account.
        </p>

        {/* Primary feature cards */}
        <div className="grid md:grid-cols-1 gap-6 mb-6">
          {primaryFeatures.map((feature) => (
            <Link key={feature.title} to={feature.link} className="no-underline block">
              <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-primary/30 group cursor-pointer h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-amber transition-shadow duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary feature cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {secondaryFeatures.map((feature) => (
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
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
