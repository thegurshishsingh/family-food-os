import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import Logo from "@/components/Logo";
import LandingHeader from "@/components/landing/LandingHeader";
import footerScene from "@/assets/footer-dinner-scene.jpg";
import HeroSection from "@/components/landing/HeroSection";
import TheStruggle from "@/components/landing/TheStruggle";
import ProductProof from "@/components/landing/ProductProof";
import HowItWorksPlayful from "@/components/landing/HowItWorksPlayful";
import WhyDifferent from "@/components/landing/WhyDifferent";

import InteractiveTagCloud from "@/components/landing/InteractiveTagCloud";
import FamilyVoices from "@/components/landing/FamilyVoices";
import FinalCTA from "@/components/landing/FinalCTA";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Landing = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      <LandingHeader />

      <HeroSection />

      <TheStruggle />

      <ProductProof />

      <HowItWorksPlayful />

      <WhyDifferent />

      

      {/* Family situations */}
      <section className="py-14 md:py-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full bg-gradient-to-t from-sky/5 to-transparent blur-3xl" />
        </div>
        <div className="container max-w-3xl text-center relative z-10">
          <motion.div initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={0}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky/15 to-primary/10 mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-3 tracking-tight leading-[1.15]">
              Built for your kind of week
            </h2>
            <p className="text-muted-foreground/80 text-base max-w-md mx-auto mb-8 leading-relaxed">
              Tap a situation to see how the plan adapts.
            </p>
          </motion.div>

          <InteractiveTagCloud />
        </div>
      </section>

      <FamilyVoices />

      <FinalCTA />

      {/* Footer — full-bleed illustrated */}
      <footer className="relative mt-12">
        {/* Illustrated scene with overlaid headline */}
        <div className="relative w-full overflow-hidden" style={{ backgroundColor: "#1a3d2e" }}>
          <img
            src={footerScene}
            alt="A family sharing a warm dinner together at the kitchen table"
            loading="lazy"
            width={1920}
            height={1080}
            className="w-full h-auto block select-none"
          />
          {/* Gradient fade into the dark green base */}
          <div
            className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(26,61,46,0.2) 40%, rgba(26,61,46,0.85) 80%, #1a3d2e 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Dark base with all link content */}
        <div className="text-cream/90" style={{ backgroundColor: "#1a3d2e" }}>
          {/* Headline between image and footer content */}
          <div className="container px-4 max-w-5xl pt-10 md:pt-16">
            <h2 className="font-serif font-semibold text-white text-3xl md:text-5xl lg:text-6xl leading-tight max-w-3xl">
              Dinner doesn't have to be stressful. <span aria-hidden="true">💚</span>
            </h2>
          </div>
          <div className="container px-4 max-w-5xl py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              {/* Brand + founding story */}
              <div className="space-y-3">
                <div className="[&_*]:text-cream">
                  <Logo size="sm" />
                </div>
                <p className="text-xs text-cream/70 leading-relaxed max-w-xs">
                  Built by parents who were tired of 5 pm chaos. We created the dinner system we wished existed — so every family can reclaim their evenings.
                </p>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Product</p>
                  <a href="#how-it-works" className="block text-cream/70 hover:text-white transition-colors text-xs">How it works</a>
                  <a href="#why-different" className="block text-cream/70 hover:text-white transition-colors text-xs">Why we're different</a>
                  <Link to="/signup" className="block text-cream/70 hover:text-white transition-colors text-xs">Get started</Link>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Support</p>
                  <a href="mailto:hello@familyfoodOS.com" className="block text-cream/70 hover:text-white transition-colors text-xs">Contact us</a>
                  <a href="#faq" className="block text-cream/70 hover:text-white transition-colors text-xs">FAQ</a>
                  <a href="#" className="block text-cream/70 hover:text-white transition-colors text-xs">About</a>
                </div>
              </div>

              {/* Legal + trust */}
              <div className="space-y-2">
                <p className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Legal</p>
                <a href="#" className="block text-cream/70 hover:text-white transition-colors text-xs">Privacy Policy</a>
                <a href="#" className="block text-cream/70 hover:text-white transition-colors text-xs">Terms of Service</a>
                <p className="text-[11px] text-sage-light pt-3">
                  Your family's data is never sold. Ever.
                </p>
              </div>
            </div>

            <div className="border-t border-cream/15 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-cream/50">
                © {new Date().getFullYear()} Family Food OS
              </p>
              <p className="text-[11px] text-cream/40">
                Made with care for busy families
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
