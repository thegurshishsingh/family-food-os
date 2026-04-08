import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import Logo from "@/components/Logo";
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
            <Logo size="md" />
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

      <TheStruggle />

      <ProductProof />

      <HowItWorksPlayful />

      <WhyDifferent />

      

      {/* Family situations */}
      <section className="py-10 md:py-14 px-4 relative">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full bg-gradient-to-t from-sky/5 to-transparent blur-3xl" />
        </div>
        <div className="container max-w-3xl text-center relative z-10">
          <motion.div initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={0}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky/15 to-primary/10 mb-3">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl md:text-3xl font-serif font-semibold text-foreground mb-2">
              Built for your kind of week
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Tap a situation to see how the plan adapts.
            </p>
          </motion.div>

          <InteractiveTagCloud />
        </div>
      </section>

      <FamilyVoices />

      <FinalCTA />

      {/* Footer */}
      <footer className="py-10 border-t border-border/30 glass">
        <div className="container px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand + founding story */}
            <div className="space-y-3">
              <Logo size="sm" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built by parents who were tired of 5 pm chaos. We created the dinner system we wished existed — so every family can reclaim their evenings.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Product</p>
                <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">How it works</a>
                <a href="#why-different" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">Why we're different</a>
                <Link to="/signup" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">Get started</Link>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Support</p>
                <a href="mailto:hello@familyfoodOS.com" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">Contact us</a>
                <a href="#faq" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">FAQ</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">About</a>
              </div>
            </div>

            {/* Legal + trust */}
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Legal</p>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">Privacy Policy</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-xs">Terms of Service</a>
              <p className="text-[11px] text-muted-foreground/50 pt-2 text-green-700">
                Your family's data is never sold. Ever.
              </p>
            </div>
          </div>

          <div className="border-t border-border/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Family Food OS · Made with care for busy families
            </p>
            <p className="text-[11px] text-muted-foreground/40">
              Dinner doesn't have to be stressful. 💚
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
