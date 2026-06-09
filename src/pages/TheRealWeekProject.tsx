import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Flame,
  Lightbulb,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing/LandingHeader";
import GuidesFooter from "@/components/guides/GuidesFooter";
import { IconTile, ShowcaseStage } from "@/components/landing/primitives";
import { InsightsScreen, WeeklyPlanScreen } from "@/components/landing/screens";
import { OG_IMAGE, SITE_URL } from "@/content/guides";

const FINDINGS = [
  {
    icon: Flame,
    gradient: "from-coral to-accent",
    title: "Wednesday is the breaking point",
    text: "Across surveyed families, Wednesday consistently emerges as the night dinner plans collapse — not from lack of effort, but from cumulative weekday fatigue meeting an unrealistic cook-from-scratch expectation.",
  },
  {
    icon: Users,
    gradient: "from-primary to-sage-dark",
    title: "Families rotate 8–12 meals",
    text: "Despite access to thousands of recipes, most households return to the same small set of trusted meals. New recipes are tried rarely; familiarity and speed drive repetition.",
  },
  {
    icon: ClipboardList,
    gradient: "from-sky to-primary",
    title: "The grocery-to-table gap is ~30%",
    text: "On average, nearly a third of planned groceries never become dinner. The primary causes: over-ambitious cook nights, unplanned schedule changes, and ingredients bought without a realistic night assigned.",
  },
  {
    icon: Lightbulb,
    gradient: "from-accent to-warm",
    title: "Planned takeout outperforms guilt takeout",
    text: "Families who schedule one or two takeout nights in advance report significantly lower stress and less food waste than families who treat takeout as a failure mode.",
  },
];

const TheRealWeekProject = () => {
  const canonical = `${SITE_URL}/real-week-project`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Real Week Project by Family Food OS",
    description:
      "An ongoing study of how real families actually eat dinner — and why most plans break by Wednesday. Research, findings, and a better way to plan.",
    image: [OG_IMAGE],
    datePublished: "2026-06-09",
    dateModified: "2026-06-09",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Organization", name: "Family Food OS", url: `${SITE_URL}/` },
    publisher: {
      "@type": "Organization",
      name: "Family Food OS",
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: OG_IMAGE },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "The Real Week Project", item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>The Real Week Project | Family Food OS</title>
        <meta
          name="description"
          content="An ongoing study of how real families actually eat dinner — and why most plans break by Wednesday. Research, findings, and a better way to plan."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Family Food OS" />
        <meta property="og:title" content="The Real Week Project | Family Food OS" />
        <meta
          property="og:description"
          content="An ongoing study of how real families actually eat dinner — and why most plans break by Wednesday."
        />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Real Week Project | Family Food OS" />
        <meta
          name="twitter:description"
          content="An ongoing study of how real families actually eat dinner — and why most plans break by Wednesday."
        />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <LandingHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-20 pb-10 md:pt-28 md:pb-14">
          <div className="absolute inset-0 -z-10 gradient-mesh" aria-hidden="true" />
          <div className="container mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-primary">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground/70">The Real Week Project</span>
            </nav>

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <BarChart3 className="h-3.5 w-3.5" /> Research Initiative
                </span>
                <h1 className="mt-5 font-serif text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
                  The Real Week Project
                </h1>
                <p className="mt-2 text-lg md:text-xl text-muted-foreground">
                  by Family Food OS
                </p>
                <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
                  An ongoing study of how real families actually eat dinner. We look at where plans
                  break, what gets repeated, what gets wasted — and how to build a dinner system
                  that learns from the week you really live.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-primary to-sage-dark px-7 shadow-md hover:from-primary/90 hover:to-sage-dark/90"
                    asChild
                  >
                    <Link to="/signup">
                      Join the study — free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="rounded-xl" asChild>
                    <Link to="/guides">Browse the guides</Link>
                  </Button>
                </div>
              </motion.div>

              <div>
                <ShowcaseStage screen={WeeklyPlanScreen} tone="sage" />
              </div>
            </div>
          </div>
        </section>

        {/* What is the project */}
        <section className="px-4 pt-8 md:pt-12">
          <div className="container mx-auto max-w-2xl">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              What is The Real Week Project?
            </h2>
            <div className="mt-5 space-y-5 text-base md:text-lg leading-relaxed text-foreground/80">
              <p>
                Most dinner advice is written for a family that does not exist: one with unlimited
                time, predictable schedules, and children who eat everything. The Real Week Project
                is the opposite. It is a running study of how dinner actually happens in busy
                households — the shortcuts, the repeat meals, the Wednesday collapse, and the
                quiet strategies that keep families fed without burning out.
              </p>
              <p>
                Family Food OS collects anonymized pattern data from real weeks: which nights get
                cooked, which become takeout, what gets eaten twice, and what rots in the crisper.
                The findings feed directly into the product — so every plan gets smarter about the
                real shape of family dinner.
              </p>
              <p>
                This page shares what we have learned so far. It is not a sales pitch. It is a
                public research record — and an invitation to stop planning for a perfect week
                that never arrives.
              </p>
            </div>
          </div>
        </section>

        {/* Findings */}
        <section className="px-4 pt-16 md:pt-24">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Early findings
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
                Patterns that show up again and again in real family weeks — and what they mean for
                how you plan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {FINDINGS.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.2) }}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 md:p-6"
                >
                  <IconTile gradient={f.gradient} size="xl" shadow="md">
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </IconTile>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-sm md:text-base text-muted-foreground leading-relaxed">
                      {f.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology / Framework */}
        <section className="px-4 pt-16 md:pt-24">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <ShowcaseStage screen={InsightsScreen} tone="amber" />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  The Real Week Framework
                </h2>
                <div className="mt-5 space-y-5 text-base md:text-lg leading-relaxed text-foreground/80">
                  <p>
                    The Real Week Framework is the planning model at the heart of the project. It
                    replaces the fantasy of seven home-cooked dinners with five honest modes that
                    match the real energy of any given night.
                  </p>
                  <ul className="space-y-3 text-base text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-sage" />
                      <span><strong className="text-foreground">Cook Night</strong> — time and energy to cook from scratch.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-sky" />
                      <span><strong className="text-foreground">Leftover Night</strong> — cook once, eat twice, waste nothing.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-accent" />
                      <span><strong className="text-foreground">Low-Effort Night</strong> — 15 minutes, pantry staples, no decisions.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-coral" />
                      <span><strong className="text-foreground">Takeout Night</strong> — planned convenience, not panic ordering.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary" />
                      <span><strong className="text-foreground">Dine-Out Night</strong> — routines, social plans, or a needed break.</span>
                    </li>
                  </ul>
                  <p>
                    When every night has a mode instead of a recipe, planning becomes fast and the
                    plan becomes honest. Read the full framework in{" "}
                    <Link
                      to="/guides/real-week-dinner-guide"
                      className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                    >
                      Why Dinner Plans Fail, and How to Build One That Survives Real Life
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it feeds into the product */}
        <section className="px-4 pt-16 md:pt-24">
          <div className="container mx-auto max-w-2xl">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              From research to your dinner table
            </h2>
            <div className="mt-5 space-y-5 text-base md:text-lg leading-relaxed text-foreground/80">
              <p>
                The Real Week Project is not abstract. Every finding shapes how Family Food OS
                builds your weekly plan: where to place a cook night, when to schedule a buffer, and
                which meals are worth repeating.
              </p>
              <p>
                After each dinner, a quick check-in records what actually happened. Over a few weeks,
                your personal Dinner Pattern Report emerges — showing where your week tends to break,
                what your family loves, and how to make next week easier than the last.
              </p>
              <p>
                The goal is not perfection. The goal is a plan that fits your real life more closely
                every single week.
              </p>
            </div>
            <div className="mt-8">
              <Button
                size="lg"
                className="rounded-xl bg-gradient-to-r from-primary to-sage-dark px-7 shadow-md hover:from-primary/90 hover:to-sage-dark/90"
                asChild
              >
                <Link to="/guides/the-dinner-pattern-report">
                  See the Dinner Pattern Report <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pt-14 md:pt-20">
          <div className="container mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-sage/[0.05] to-background p-8 md:p-10 text-center">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                Join The Real Week Project
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground leading-relaxed">
                Plan a few real weeks with Family Food OS and contribute to the study — while
                building a dinner rhythm that finally fits your life.
              </p>
              <Button
                size="lg"
                className="mt-6 rounded-xl bg-gradient-to-r from-primary to-sage-dark px-8 shadow-md hover:from-primary/90 hover:to-sage-dark/90"
                asChild
              >
                <Link to="/signup">
                  Start your first week — free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground/60">
                No credit card required. Your data is never sold.
              </p>
            </div>
          </div>
        </section>

        {/* Related reading */}
        <section className="px-4 pt-16 md:pt-24 pb-8">
          <div className="container mx-auto max-w-2xl">
            <h2 className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-foreground mb-5">
              Related reading
            </h2>
            <div className="space-y-3">
              <Link
                to="/guides/real-week-dinner-guide"
                className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/50 p-4 transition-colors hover:bg-card"
              >
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Why Dinner Plans Fail, and How to Build One That Survives Real Life
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The complete guide to the Real Week Framework.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-3" />
              </Link>
              <Link
                to="/guides/the-dinner-pattern-report"
                className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/50 p-4 transition-colors hover:bg-card"
              >
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    The Dinner Pattern Report
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    See where your plans break and how to make next week easier.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-3" />
              </Link>
              <Link
                to="/guides/why-meal-planning-fails-by-wednesday"
                className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/50 p-4 transition-colors hover:bg-card"
              >
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Why Meal Planning Fails by Wednesday
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The five forces that break almost every meal plan.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-3" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <GuidesFooter />
    </div>
  );
};

export default TheRealWeekProject;
