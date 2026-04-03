import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FinalCTA = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-12 md:py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-r from-primary/8 via-sky/5 to-violet/6 blur-3xl" />
      </div>

      <div className="container max-w-2xl text-center relative z-10">
        <motion.div
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-primary via-sky to-primary mb-5 shadow-xl">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-3 leading-tight">
            Tonight's dinner?
            <br />
            <span className="bg-gradient-to-r from-primary via-sage-dark to-primary bg-clip-text text-transparent">Already handled.</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto mb-6 leading-relaxed">
            Join hundreds of families who stopped stressing about dinner and
            started enjoying it again.
          </p>
          <Button size="lg" className="text-base px-10 h-14 rounded-xl text-lg bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.5)]" asChild>
            <Link to="/signup">
              Start your first week — free <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground/50 mt-3">
            No credit card needed · Set up in 5 minutes · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
