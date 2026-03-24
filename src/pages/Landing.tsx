import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, CalendarDays, ShoppingCart, Repeat, Users, Brain, ArrowRight, CheckCircle2 } from "lucide-react";
import ProductProof from "@/components/landing/ProductProof";
import ComparisonTable from "@/components/landing/ComparisonTable";
import InteractiveTagCloud from "@/components/landing/InteractiveTagCloud";
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

      {/* Hero */}
      <section className="pt-28 pb-10 md:pt-44 md:pb-16 px-4">
        <div className="container max-w-4xl text-center mx-auto">
          <div>
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-sage-light text-primary border border-primary/10">
              Not a meal planner. A food operating system.
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
            Plan your real week{" "}
            <span className="text-primary">of food.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 leading-relaxed">
            Most apps give you recipes. Family Food OS learns your family — takeout nights, picky eaters, busy Wednesdays — and gets smarter every week.
          </p>
          <p className="text-sm md:text-base text-muted-foreground/70 max-w-lg mx-auto mb-10">
            Joins 5 minutes. Learns forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 h-12 rounded-xl" asChild>
              <Link to="/signup">Start planning for free <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
          {/* Social proof */}
          <p className="text-sm text-muted-foreground/60 mt-5">
            Joined by 200+ families in early access · No credit card required
          </p>
        </div>
      </section>

      <ProductProof />

      {/* How it works */}
      <section className="py-20 md:py-28 px-4">
        <div className="container max-w-5xl">
          <motion.div className="text-center mb-16" initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={0}>
            <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three steps to a week that actually makes sense.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {[
              {
                step: "01",
                icon: Users,
                title: "Tell us about your family",
                desc: "Kids' ages, food preferences, allergies, budget, and how much cooking you can realistically handle this week.",
              },
              {
                step: "02",
                icon: Brain,
                title: "Get your weekly plan",
                desc: "The system builds your week — a realistic mix of cook nights, leftover nights, and takeout slots based on your actual schedule, energy, and what your family likes.",
              },
              {
                step: "03",
                icon: ShoppingCart,
                title: "Shop with a smart list",
                desc: "Your grocery list auto-adjusts for takeout nights, leftover days, and guest count. No waste, no guesswork.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative p-5 sm:p-8 rounded-2xl bg-card border border-border"
                initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={i + 1}
              >
                <span className="text-5xl font-serif font-bold text-primary/10 absolute top-4 right-6">{item.step}</span>
                <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-20 md:py-28 px-4 bg-card/50 border-y border-border">
        <div className="container max-w-5xl">
          <motion.div className="text-center mb-16" initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={0}>
            <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Not another recipe app.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              This is a weekly food operating system built for how families actually eat.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: CalendarDays, title: "Week-first planning", desc: "The core object is your week — not a recipe. Plan around real life: work trips, guests, sick days, sports." },
              { icon: Repeat, title: "Smart leftovers & swaps", desc: "The system knows when Tuesday's roast becomes Wednesday's tacos. Swap any meal in one tap." },
              { icon: ShoppingCart, title: "Adaptive grocery lists", desc: "Groceries adjust automatically when you switch to takeout or mark a leftover night." },
              { icon: CheckCircle2, title: "Reality Score™", desc: "Planning 6 cook nights with a newborn? We'll gently flag that and suggest adjustments." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="flex gap-5 p-6 rounded-xl bg-background border border-border"
                initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={i + 1}
              >
                <div className="w-10 h-10 rounded-lg bg-warm-light flex items-center justify-center shrink-0 mt-1">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-1.5">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <ComparisonTable />
        </div>
      </section>

      {/* Audience callout */}
      <section className="py-20 md:py-28 px-4">
        <div className="container max-w-3xl text-center">
          <motion.div initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={0}>
            <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-6">
              Built for families like yours
            </h2>
          </motion.div>

          <InteractiveTagCloud />

          <motion.div initial={initialState} whileInView="visible" viewport={viewport} variants={fadeUp} custom={1}>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Every week is different. Family Food OS adapts your plan based on
              what's actually happening in your household — no judgment, just
              practical help.
            </p>
            <Button size="lg" className="text-base px-8 h-12 rounded-xl" asChild>
              <Link to="/signup">Start your first real week of food <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <p className="text-sm text-muted-foreground/60 mt-4">
              Free to start. No credit card. Your first plan is ready in 5 minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card/50">
        <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Family Food OS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Family Food OS. Plan your real week.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
