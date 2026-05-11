import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FinalCTA = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-20 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full bg-sage/10 blur-3xl" />
      </div>

      <div className="container max-w-3xl text-center relative z-10">
        <motion.div
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary/80">
              For your family
            </span>
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-foreground mb-6 leading-[1.02] tracking-[-0.02em]">
            Dinner, handled<br />
            <span className="italic text-primary">for your family.</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Set up in five minutes. Better every week after that.
          </p>
          <Button
            size="lg"
            className="text-base px-10 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)] transition-all hover:-translate-y-0.5"
            asChild
          >
            <Link to="/signup">
              Start your first week <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground/60 mt-5">
            Free to start · No credit card · Cancel anytime
          </p>
          <p className="text-sm text-muted-foreground/50 mt-6">
            Questions? Reach us at{" "}
            <a href="mailto:hello@familyfoodOS.com" className="text-primary/80 hover:text-primary underline underline-offset-4 transition-colors">
              hello@familyfoodOS.com
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
