import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { HelpCircle } from "lucide-react";
import { IconTile } from "./primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How does the weekly plan get created?",
    answer:
      "You answer a few quick questions about your household — who's picky, any allergies, your weekly budget, and how much energy you have for cooking. Our AI then builds a realistic 7-day plan mixing cook nights, leftovers, takeout, and dine-out evenings based on your actual life, not a fantasy version of it.",
  },
  {
    question: "What if I don't like a meal in the plan?",
    answer:
      "Tap any day and swap it out. You can browse alternatives that fit the same slot, or let the system suggest something based on what your family has loved before. Your grocery list updates automatically the moment you make a change.",
  },
  {
    question: "How does the grocery list work?",
    answer:
      "Your list is auto-generated from your weekly plan. Shared ingredients across meals are merged so you don't buy three bunches of cilantro. Items are organized by aisle, and if you swap a meal, the list recalculates instantly. You can also mark pantry staples you already own so they never appear.",
  },
  {
    question: "Can I plan for different schedules each week?",
    answer:
      "Absolutely. The system learns your patterns — late meetings on Tuesdays, kids' sports on Thursdays — and adapts each week's plan accordingly. You can also add one-off events anytime and the plan will flex around them.",
  },
  {
    question: "What happens after dinner?",
    answer:
      "A quick check-in takes 10 seconds. Tap how it went — loved it, fine, or nope — and the system learns. Over time it gets sharper at picking meals your family actually wants to eat, and surfaces weekly insights so you can see the trends.",
  },
  {
    question: "Is there a free version?",
    answer:
      "Yes. You can build weekly plans, use the grocery list, and track check-ins on the free plan. Premium unlocks unlimited plan history, advanced family insights, and the time-saved recap — but the core experience is designed to be useful at no cost.",
  },
];

const FAQSection = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section id="faq" className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-r from-sage/5 via-primary/5 to-sky/5 blur-3xl" />
      </div>

      <div className="container max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <IconTile size="xl" gradient="from-primary/15 to-sage/10" className="mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
          </IconTile>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-3 tracking-tight leading-[1.1]">
            Questions, answered
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Everything you need to know about planning, swapping, and shopping.
          </p>
        </motion.div>

        <motion.div
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={1}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm px-5 md:px-6 overflow-hidden data-[state=open]:shadow-lg transition-shadow"
              >
                <AccordionTrigger className="text-left text-[15px] md:text-base font-semibold text-foreground py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-[15px] text-muted-foreground/85 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export { FAQS };
export default FAQSection;
