import { Link } from "react-router-dom";
import { ChefHat, Target } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import TheStruggle from "@/components/landing/TheStruggle";
import ProductProof from "@/components/landing/ProductProof";
import HowItWorksPlayful from "@/components/landing/HowItWorksPlayful";
import WhyDifferent from "@/components/landing/WhyDifferent";
import InteractiveTagCloud from "@/components/landing/InteractiveTagCloud";
import FamilyVoices from "@/components/landing/FamilyVoices";
import FinalCTA from "@/components/landing/FinalCTA";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Landing = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      {/* Glass Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center justify-between h-16 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center shadow-md">
              <ChefHat className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Family Food OS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-md" asChild>
              <Link to="/signup">Start free <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection />

      {/* Glass Divider */}
      <div className="container max-w-4xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>

      <TheStruggle />

      <ProductProof />

      <HowItWorksPlayful />

      <WhyDifferent />

      {/* Glass Divider */}
      <div className="container max-w-4xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>

      {/* Family situations */}
      <section className="py-12 md:py-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full bg-gradient-to-t from-sky/5 to-transparent blur-3xl" />
        </div>
        <div className="container max-w-3xl text-center relative z-10">
          <motion.div initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={0}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky/15 to-primary/10 mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-3">
              Built for your kind of week
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
              Tap a situation to see how the plan adapts.
            </p>
          </motion.div>

          <InteractiveTagCloud />
        </div>
      </section>

      <FamilyVoices />

      <FinalCTA />

      {/* Glass Footer */}
      <footer className="py-10 border-t border-border/30 glass">
        <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center shadow-sm">
              <ChefHat className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Family Food OS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Family Food OS · Made with care for busy families
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
