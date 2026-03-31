import { Link } from "react-router-dom";
import { ChefHat } from "lucide-react";
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
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Family Food OS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Start free <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection />

      {/* Divider */}
      <div className="container max-w-4xl px-4"><hr className="border-border/40" /></div>

      <TheStruggle />

      <ProductProof />

      <HowItWorksPlayful />

      <WhyDifferent />

      {/* Divider */}
      <div className="container max-w-4xl px-4"><hr className="border-border/40" /></div>

      {/* Family situations */}
      <section className="py-12 md:py-20 px-4">
        <div className="container max-w-3xl text-center">
          <motion.div initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={0}>
            <span className="text-3xl mb-3 block">🎯</span>
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

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-card/50">
        <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Family Food OS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Family Food OS · Made with 🫶 for busy families
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
