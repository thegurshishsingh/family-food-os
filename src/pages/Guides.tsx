import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing/LandingHeader";
import GuidesFooter from "@/components/guides/GuidesFooter";
import GuideCard from "@/components/guides/GuideCard";
import { IconTile } from "@/components/landing/primitives";
import {
  CATEGORIES,
  GUIDES,
  SITE_URL,
  guidesByCategory,
} from "@/content/guides";

const Guides = () => {
  const featured = GUIDES.find((g) => g.featured) ?? GUIDES[0];
  const canonical = `${SITE_URL}/guides`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Family Food OS Guides",
    description:
      "A premium resource library on real-week dinner planning, dinner stress, grocery waste, and family dinner systems.",
    url: canonical,
    hasPart: GUIDES.map((g) => ({
      "@type": "Article",
      headline: g.title,
      url: `${SITE_URL}/guides/${g.slug}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Guides — Real-Life Dinner Planning | Family Food OS</title>
        <meta
          name="description"
          content="A premium library of guides on planning weekly dinners around real life — dinner stress, grocery waste, and building a family dinner system that lasts."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Guides — Real-Life Dinner Planning | Family Food OS" />
        <meta
          property="og:description"
          content="A premium library of guides on planning weekly dinners around the week you actually have."
        />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <LandingHeader />

      <main id="main-content" className="pt-header">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-10 md:pt-24 md:pb-14">
          <div className="absolute inset-0 -z-10 gradient-mesh" aria-hidden="true" />
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <BookOpen className="h-3.5 w-3.5" /> The Guides Library
              </span>
              <h1 className="mt-5 font-serif text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
                Real-life dinner, <span className="text-primary">solved on purpose</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
                A small, carefully made library on planning dinner around the week you
                actually have. No recipe feeds — just the thinking behind a calmer kitchen.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured pillar */}
        <section className="px-4">
          <div className="container mx-auto max-w-5xl">
            <GuideCard guide={featured} variant="feature" />
          </div>
        </section>

        {/* Dinner Pattern Report — study landing promo */}
        <section className="px-4 pt-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-sage/[0.05] to-background p-6 md:p-8"
            >
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <IconTile gradient="from-primary to-sage-dark" size="xl" shadow="md">
                    <LineChart className="h-6 w-6 text-primary-foreground" />
                  </IconTile>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      The study
                    </p>
                    <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
                      The Dinner Pattern Report
                    </h2>
                    <p className="mt-1.5 max-w-lg text-sm text-muted-foreground leading-relaxed">
                      See where plans break, what meals repeat, which nights become takeout,
                      and what groceries go unused — and how to make next week easier.
                    </p>
                  </div>
                </div>
                <Button className="shrink-0 rounded-xl bg-gradient-to-r from-primary to-sage-dark shadow-md hover:from-primary/90 hover:to-sage-dark/90" asChild>
                  <Link to="/guides/the-dinner-pattern-report">
                    Explore the report <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        {CATEGORIES.map((category) => {
          const guides = guidesByCategory(category.id);
          if (guides.length === 0) return null;
          return (
            <section key={category.id} className="px-4 pt-14 md:pt-20">
              <div className="container mx-auto max-w-5xl">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                      {category.label}
                    </h2>
                    <p className="mt-1.5 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
                      {category.blurb}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {guides.map((g, i) => (
                    <GuideCard key={g.slug} guide={g} index={i} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Closing CTA */}
        <section className="px-4 pt-16 md:pt-24">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Ready to plan your real week?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground leading-relaxed">
              Let Family Food OS turn everything in these guides into one weekly plan that
              learns your family.
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
        </section>
      </main>

      <GuidesFooter />
    </div>
  );
};

export default Guides;
