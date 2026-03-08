import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, CalendarDays, ShoppingCart, Repeat, Users, Brain, ArrowRight, CheckCircle2 } from "lucide-react";
import ProductProof from "@/components/landing/ProductProof";


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
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
      <section className="pt-32 pb-12 md:pt-44 md:pb-16 px-4">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-sage-light text-primary border border-primary/10">
              The family food system that learns with you every week
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold tracking-tight text-foreground leading-[1.1] mb-6"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Plan your real week{" "}
            <span className="text-primary">of food.</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 leading-relaxed"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Meals, takeout, leftovers, and groceries. One smart weekly plan
            built around your family's real life — not an ideal one.
          </motion.p>
          <motion.p
            className="text-sm md:text-base text-muted-foreground/70 max-w-lg mx-auto mb-10"
            initial="hidden" animate="visible" variants={fadeUp} custom={2.5}
          >
            Built for busy families who need fewer decisions at the end of the day.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <Button size="lg" className="text-base px-8 h-12 rounded-xl" asChild>
              <Link to="/signup">Start planning for free <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <p className="text-sm text-muted-foreground">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Product Proof — Learning Loop */}
      <section className="py-16 md:py-24 px-4">
        <div className="container max-w-6xl">
          {/* Section header */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              It learns from real life, not just recipes.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Most meal apps stop at planning. Family Food OS keeps learning after dinner, so each week fits your family better.
            </p>
          </motion.div>

          {/* Split layout */}
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">

            {/* LEFT — Weekly Planner Preview */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            >
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden h-full">
                {/* Card header */}
                <div className="px-6 pt-6 pb-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Week</p>
                      <h3 className="text-lg font-serif font-semibold text-foreground mt-0.5">March 10 – 14</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      Reality Score: 84
                    </div>
                  </div>
                </div>

                {/* Day rows */}
                <div className="divide-y divide-border">
                  {WEEK_PREVIEW.map((day, i) => (
                    <motion.div
                      key={day.day}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                    >
                      <div className="w-10 text-center">
                        <span className="text-sm font-semibold text-foreground">{day.day}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${day.modeColor}`}>
                        {day.emoji} {day.mode}
                      </span>
                      <span className="text-sm text-muted-foreground flex-1 truncate">{day.meal}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="px-6 py-4 bg-muted/20 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>3 cook · 1 leftover · 1 out</span>
                    <span className="font-medium text-primary">~2,400 cal avg/day</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT — Dinner Check-In */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            >
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden h-full flex flex-col">
                {/* Card header */}
                <div className="px-6 pt-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-semibold text-foreground">Dinner Check-In</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">A 10-second nightly ritual that helps the system learn.</p>
                    </div>
                  </div>
                </div>

                {/* Check-in body */}
                <div className="px-6 py-5 flex-1">
                  <p className="text-sm font-medium text-foreground mb-4">How did dinner go tonight?</p>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {CHECKIN_CHIPS.map((chip) => (
                      <span
                        key={chip.label}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                          chip.active
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>

                  {/* Smart response */}
                  <div className="rounded-xl bg-sage-light/60 border border-primary/10 px-4 py-3.5 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground font-medium leading-relaxed">
                        Got it. Thursdays should stay low-effort for your family.
                      </p>
                    </div>
                  </div>

                  {/* Weekly learnings */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">This week's learning</p>
                    <div className="space-y-2.5">
                      {LEARNINGS.map((item) => (
                        <div key={item.text} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                            <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 px-4">
        <div className="container max-w-5xl">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three steps to a week that actually makes sense.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
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
                desc: "AI generates a realistic mix of home-cooked meals, leftovers, takeout, and easy fallbacks — tailored to your actual week.",
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
                className="relative p-8 rounded-2xl bg-card border border-border"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
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
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
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
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
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
        </div>
      </section>

      {/* Audience callout */}
      <section className="py-20 md:py-28 px-4">
        <div className="container max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
              Built for families like yours
            </h2>
            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              {[
                "Newborn at home",
                "Toddler phase",
                "Picky eaters",
                "Sports week",
                "Guests visiting",
                "One parent traveling",
                "Budget-tight week",
                "High-protein goals",
                "Low-cleanup mode",
              ].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-full text-sm bg-sage-light text-primary border border-primary/10">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Every week is different. Family Food OS adapts your plan based on
              what's actually happening in your household — no judgment, just
              practical help.
            </p>
            <Button size="lg" className="text-base px-8 h-12 rounded-xl" asChild>
              <Link to="/signup">Get your first weekly plan <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
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
