import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Silvery know my sleep need?",
    answer:
      "Silvery uses data from your phone and/or wearable combined with proprietary models rooted in sleep science to learn your unique sleep biology. These models are widely accepted by researchers in the sleep science field, which is nearly 100 years old.",
  },
  {
    question: "Does Silvery track my sleep stages?",
    answer:
      "While we love sleep data, we believe monitoring sleep stages isn't beneficial for becoming a better sleeper. Your brain already optimizes which stages you spend time in. All stages have benefits, so there's no need to stress about REM vs. deep sleep.",
  },
  {
    question: "How does Silvery help me sleep and feel better?",
    answer:
      "We focus on sleep debt — the single metric researchers agree most impacts how you feel and perform. Reduce your sleep debt and you'll feel the difference. We also build personalized routines that address the root causes of poor sleep.",
  },
  {
    question: "Is Silvery backed by science?",
    answer:
      "Absolutely. Our algorithms are built on peer-reviewed sleep science research spanning decades. We work alongside sleep researchers and use clinically validated approaches to understand your sleep biology.",
  },
  {
    question: "What devices does Silvery work with?",
    answer:
      "Silvery works with your phone alone — no wearable required. For enhanced tracking, we integrate with popular wearables and health platforms to give you the most accurate picture of your sleep.",
  },
  {
    question: "How is Silvery different from other sleep apps?",
    answer:
      "Most sleep apps show you data. Silvery tells you what to do about it. We don't just track — we provide actionable guidance based on your unique sleep biology, helping you reduce sleep debt and unlock peak energy.",
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
