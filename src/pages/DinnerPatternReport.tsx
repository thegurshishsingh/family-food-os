import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  ChevronRight,
  LineChart,
  Repeat,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing/LandingHeader";
import GuidesFooter from "@/components/guides/GuidesFooter";
import { IconTile, ShowcaseStage } from "@/components/landing/primitives";
import { InsightsScreen, SavingsScreen } from "@/components/landing/screens";
import { GUIDES, SITE_URL, getGuide } from "@/content/guides";
import GuideCard from "@/components/guides/GuideCard";

const FINDINGS = [
  {
    icon: AlertTriangle,
    gradient: "from-coral to-accent",
    title: "Where your plans break",
    text: "The exact night your week tends to fall apart — usually the same one — so next week's plan can protect it in advance.",
  },
  {
    icon: Repeat,
    gradient: "from-primary to-sage-dark",
    title: "What meals repeat",
    text: "The family favorites you reach for again and again. We surface them so the easy wins stay on rotation.",
  },
  {
    icon: Bike,
    gradient: "from-coral to-warm",
    title: "What nights become takeout",
    text: "The recurring takeout slot hiding in your week — named, not judged — so it can become a planned night instead of a panic.",
  },
  {
    icon: Trash2,
    gradient: "from-sky to-primary",
    title: "What groceries go unused",
    text: "The ingredients you keep buying but never cook. We stop putting them on the list and your waste quietly drops.",
  },
  {
    icon: Sparkles,
    gradient: "from-accent to-warm",
    title: "How to make next week easier",
    text: "Every pattern turns into a concrete adjustment for the upcoming plan — fewer cook nights where they never happen, more buffers where you need them.",
  },
];

const DinnerPatternReport = () => {
  const canonical = `${SITE_URL}/guides/the-dinner-pattern-report`;
  const related = ["real-week-dinner-guide", "how-to-build-a-weekly-dinner-rhythm", "how-to-stop-wasting-groceries-every-week"]
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const reportSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Dinner Pattern Report",
    description:
      "The Dinner Pattern Report shows where your plans break, what meals repeat, which nights become takeout, and what groceries go unused — and how to make next week easier.",
    datePublished: "2026-06-07",
    dateModified: "2026-06-07",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Organization", name: "Family Food OS", url: `${SITE_URL}/` },
    publisher: { "@type": "Organization", name: "Family Food OS", url: `${SITE_URL}/` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: "The Dinner Pattern Report", item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>The Dinner Pattern Report | Family Food OS</title>
        <meta
          name="description"
          content="See where your dinner plans break, what meals repeat, which nights become takeout, and what groceries go unused — and exactly how to make next week easier."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="The Dinner Pattern Report | Family Food OS" />
        <meta
          property="og:description"
          content="The study of your real dinner week: where plans break, what repeats, what becomes takeout, and what gets wasted."
        />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(reportSchema)}</script>
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
              <Link to="/guides" className="transition-colors hover:text-primary">Guides</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground/70">The Dinner Pattern Report</span>
            </nav>

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <LineChart className="h-3.5 w-3.5" /> The Study
                </span>
                <h1 className="mt-5 font-serif text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
                  The Dinner Pattern Report
                </h1>
                <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
                  Every family has a dinner pattern — the same night that breaks, the same
                  meals on repeat, the same slide into takeout. Family Food OS studies your
                  real week and hands the pattern back to you, so next week is easier than
                  the last.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-primary to-sage-dark px-7 shadow-md hover:from-primary/90 hover:to-sage-dark/90"
                    asChild
                  >
                    <Link to="/signup">
                      Get your report — free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="rounded-xl" asChild>
                    <Link to="/guides">Browse the guides</Link>
                  </Button>
                </div>
              </motion.div>

              <div>
                <ShowcaseStage screen={InsightsScreen} tone="sage" />
              </div>
            </div>
          </div>
        </section>

        {/* What you get back */}
        <section className="px-4 pt-8 md:pt-12">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                What you get back
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
                Five clear, honest signals about how your dinners actually go — no shame, just
                the data that makes the next week calmer.
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

              {/* Savings highlight card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45 }}
                className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] to-background p-2"
              >
                <ShowcaseStage screen={SavingsScreen} tone="amber" crop cropHeightClassName="h-[220px]" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works narrative */}
        <section className="px-4 pt-16 md:pt-24">
          <div className="container mx-auto max-w-2xl">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              How the report makes next week easier
            </h2>
            <div className="mt-5 space-y-5 text-base md:text-lg leading-relaxed text-foreground/80">
              <p>
                The Dinner Pattern Report isn't a scorecard — it's a feedback loop. Each week,
                Family Food OS quietly records what actually happened: which dinners got cooked,
                which got swapped, what the family loved, and what ended in takeout. Over a few
                weeks, a clear picture emerges.
              </p>
              <p>
                That picture becomes the input for your next plan. If Wednesday always breaks,
                the system stops scheduling a from-scratch cook there. If the taco bar is a
                guaranteed hit, it comes back. If the spinach rots every week, it leaves the
                list. This is the same philosophy behind{" "}
                <Link
                  to="/guides/real-week-dinner-guide"
                  className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                >
                  planning around the week you actually have
                </Link>
                {" "}— made measurable.
              </p>
              <p>
                The result is a plan that fits your family more closely every single week —
                fewer broken nights, less wasted food, and far fewer 5pm panics. To turn these
                signals into a repeatable routine, pair the report with{" "}
                <Link
                  to="/guides/how-to-build-a-weekly-dinner-rhythm"
                  className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                >
                  How to Build a Weekly Dinner Rhythm
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pt-14 md:pt-20">
          <div className="container mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-sage/[0.05] to-background p-8 md:p-10 text-center">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                See your family's dinner pattern
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground leading-relaxed">
                Plan a few real weeks with Family Food OS and your Dinner Pattern Report builds
                itself — then makes every week after that easier.
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
            </div>
          </div>
        </section>

        {/* Related guides */}
        <section className="px-4 pt-16 md:pt-24">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-6 font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              Related guides
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((g, i) => (
                <GuideCard key={g.slug} guide={g} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <GuidesFooter />
    </div>
  );
};

export default DinnerPatternReport;
