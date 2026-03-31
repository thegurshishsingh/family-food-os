import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FinalCTA = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container max-w-2xl text-center">
        <motion.div
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <span className="text-5xl mb-4 block">🍽️</span>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-4 leading-tight">
            Tonight's dinner?
            <br />
            <span className="text-primary">Already handled.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Join hundreds of families who stopped stressing about dinner and
            started enjoying it again.
          </p>
          <Button size="lg" className="text-base px-10 h-14 rounded-xl text-lg" asChild>
            <Link to="/signup">
              Start your first week — free <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground/50 mt-4">
            No credit card needed · Set up in 5 minutes · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
