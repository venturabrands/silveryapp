const stats = [
  { value: "1-2°F", label: "core temperature drop needed to initiate deep, restorative sleep" },
  { value: "99.9%", label: "bacterial growth inhibition with silver-infused bedding technology" },
  { value: "50%", label: "faster sleep onset when you journal worries before bed" },
];

const ScienceSection = () => {
  return (
    <section id="science" className="py-32 border-t border-border/30">
      <div className="section-container">
        <p className="text-primary text-sm font-semibold tracking-[0.25em] uppercase text-center mb-4">
          The Science
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-center mb-6">
          Built on real research
        </h2>
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          During deep sleep, your brain consolidates memories, your muscles repair themselves, your immune system strengthens, and your hormones rebalance. Quality sleep is your body's most powerful recovery tool — and it starts with the right foundation.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-5xl md:text-6xl font-bold gradient-text mb-4">
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScienceSection;
