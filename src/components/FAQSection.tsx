import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the ideal bedroom temperature for sleep?",
    answer:
      "The optimal sleep temperature is 60–67°F (15–19°C). Your body must drop its core temperature by 1–2°F to initiate sleep. A cool bedroom facilitates this natural decline and promotes deeper, more restorative sleep that supports skin repair and cellular regeneration.",
  },
  {
    question: "How does the 10-3-2-1-0 rule work?",
    answer:
      "10 hours before bed: no more caffeine. 3 hours before bed: no more food or alcohol. 2 hours before bed: no more work. 1 hour before bed: no more screens. 0: the number of times you hit snooze. This simple framework eliminates common sleep disruptors and dramatically improves sleep quality.",
  },
  {
    question: "Why is sleep regularity more important than duration?",
    answer:
      "Research on 300,000+ individuals shows that regularity — keeping sleep-wake times within 15–20 minutes daily — is a stronger predictor of longevity than sleep duration alone. Irregular sleepers who vary by 2+ hours face significantly higher disease and mortality rates.",
  },
  {
    question: "How does silver-infused bedding improve sleep?",
    answer:
      "Silver is one of the most thermally conductive materials on earth. Woven into fabric, it pulls excess body heat away from your skin and disperses it across the sheet surface. It also naturally inhibits bacterial growth by up to 99.9%, reducing allergens, dust mites, and odors that fragment sleep.",
  },
  {
    question: "What should I include in a wind-down ritual?",
    answer:
      "Start 60–90 minutes before bed. Dim all lights, take a warm bath or shower (the post-bath temperature drop mimics your body's natural pre-sleep decline), write down worries or tomorrow's to-do list, and prepare a cool, fresh sleep surface. This signals your brain to shift from fight-or-flight to rest-and-digest mode.",
  },
  {
    question: "How does light exposure affect my sleep?",
    answer:
      "Light is the most powerful external regulator of your circadian rhythm. Get bright outdoor sunlight within 30 minutes of waking to set your internal clock. Then dim all lights 2–3 hours before bed and create complete darkness for sleep — even small amounts of light can suppress melatonin and reduce deep sleep quality.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-32 border-t border-border/30">
      <div className="section-container">
        <p className="text-primary text-sm font-semibold tracking-[0.25em] uppercase text-center mb-4">
          FAQ
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-center mb-16">
          Common questions
        </h2>

        <Accordion type="single" collapsible className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glass-card rounded-xl px-6 border border-border/50 data-[state=open]:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left font-serif text-lg font-medium text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
