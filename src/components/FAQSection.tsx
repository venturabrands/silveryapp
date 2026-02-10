import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does silver-infused fabric keep me cool?",
    answer:
      "Silver is one of the most thermally conductive materials on earth — it conducts heat 400x better than cotton. Our fabric actively moves excess warmth away from your body, rather than just absorbing moisture like traditional cooling sheets.",
  },
  {
    question: "Is the self-cleaning claim really proven?",
    answer:
      "Yes. Our fabric has been independently tested by SGS labs and proven to prevent 99.9% of bacterial growth. This means your sheets stay fresh 3x longer between washes, saving you time and water.",
  },
  {
    question: "Who is Silvery designed for?",
    answer:
      "Silvery is engineered for anyone who sleeps hot — whether from menopause, hormonal changes, medications, or natural temperature sensitivity. If you've tried cooling sheets that didn't work, our real silver technology is the solution.",
  },
  {
    question: "How does the 100-night trial work?",
    answer:
      "We're so confident in our technology that we offer a full 100-night risk-free trial. Sleep on our sheets for up to 100 nights. If you're not sleeping cooler and more comfortably, we'll give you a complete refund — no questions asked.",
  },
  {
    question: "What products do you offer?",
    answer:
      "We offer a complete silver-infused bedding system: bed sheets, a cooling comforter, bed pillows, and a mattress protector. Each product uses our proprietary silver-infused fabric technology for superior cooling and self-cleaning performance.",
  },
  {
    question: "How do I care for Silvery sheets?",
    answer:
      "Simply machine wash in cold water and tumble dry on low heat. The silver-infused technology is woven into the fabric, so it won't wash out. Avoid bleach and fabric softeners to maintain peak performance.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-32 border-t border-border/30">
      <div className="section-container">
        <p className="text-primary text-xs font-semibold tracking-[0.3em] uppercase text-center mb-4">
          FAQ
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-16 tracking-tight">
          Common questions
        </h2>

        <Accordion type="single" collapsible className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glass-card rounded-xl px-6 border border-border/50 data-[state=open]:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
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
