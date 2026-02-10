const stats = [
  { value: "400x", label: "better heat conductivity than cotton" },
  { value: "99.9%", label: "of bacterial growth prevented" },
  { value: "25,000+", label: "happy sleepers worldwide" },
];

const ScienceSection = () => {
  return (
    <section id="science" className="py-32 border-t border-border/30">
      <div className="section-container">
        <p className="text-primary text-xs font-semibold tracking-[0.3em] uppercase text-center mb-4">
          The Science
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-6 tracking-tight">
          Proven, not promised
        </h2>
        <p className="text-muted-foreground text-base text-center max-w-2xl mx-auto mb-20">
          Every claim is validated through rigorous independent testing by SGS labs. We deliver results, not marketing promises.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-5xl md:text-6xl font-bold gradient-text-blue mb-4">
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
