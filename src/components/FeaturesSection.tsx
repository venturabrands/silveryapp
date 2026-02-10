import { Activity, CalendarClock, MessageCircle, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
const features = [{
  icon: Activity,
  title: "Track Everything",
  description: "Monitor your sleep duration, quality, and patterns over time. See the data that matters — from time in bed to restfulness scores."
}, {
  icon: CalendarClock,
  title: "Personalized Sleep Schedules",
  description: "Get a custom wind-down and wake-up plan built around your lifestyle, chronotype, and goals. No more one-size-fits-all advice."
}, {
  icon: MessageCircle,
  title: "Sleep Chat",
  description: "Chat with Silvery's Sleep Guide — your friendly AI companion for sleep tips, bedding advice, and building better nighttime routines.",
  link: "/sleep-chat"
}, {
  icon: BarChart3,
  title: "Analytics",
  description: "Deep-dive into weekly and monthly trends. Understand what's helping and what's hurting your sleep with clear, visual insights."
}];
const FeaturesSection = () => {
  return <section id="features" className="py-32">
      <div className="section-container">
        <p className="text-primary text-sm font-semibold tracking-[0.25em] uppercase text-center mb-4">
      </p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-center mb-6">
      </h2>
        

        <div className="grid md:grid-cols-2 gap-6">
          {features.map(feature => {
          const Card = <div key={feature.title} className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-primary/30 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-amber transition-shadow duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>;
          if (feature.link) {
            return <Link key={feature.title} to={feature.link} className="no-underline">
                  {Card}
                </Link>;
          }
          return Card;
        })}
        </div>
      </div>
    </section>;
};
export default FeaturesSection;