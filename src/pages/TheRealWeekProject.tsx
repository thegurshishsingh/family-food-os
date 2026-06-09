import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ClipboardList, LineChart, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing/LandingHeader";
import GuidesFooter from "@/components/guides/GuidesFooter";
import StudySignupForm from "@/components/StudySignupForm";
import { OG_IMAGE, SITE_URL } from "@/content/guides";
import familyDinner from "@/assets/real-week-family-dinner.jpg";

const STUDYING = [
  "Meals that changed.",
  "Groceries that went unused.",
  "Nights when takeout won.",
  "Patterns your family can use next week.",
];

const STEPS = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Tell us what your week looks like",
    text: "A quick intake about your household, schedule, and dinner routine.",
  },
  {
    num: "02",
    icon: UtensilsCrossed,
    title: "Track what actually happens",
    text: "Each day, log what was planned, what happened, and why.",
  },
  {
    num: "03",
    icon: LineChart,
    title: "Get your Dinner Pattern Report",
    text: "See the patterns, friction points, and wins from your real week.",
  },
];

const GET_BACK = [
  "Where your plans matched reality — and where they didn't",
  "The groceries that quietly went unused",
  "The nights and triggers that lead to takeout",
  "The recurring wins worth keeping in rotation",
];

const REPORT_LEFT = [
  "Your highest-stress dinner night",
  "What led to takeout",
  "Recurring meals worth keeping",
];
const REPORT_RIGHT = [
  "How often planned meals changed",
  "Groceries that went unused",
  "One recommendation for next week",
];

const WHO = [
  "You cook most weeknights — and it's harder than it should be",
  "Your week has mixed schedules, kid activities, or shift work",
  "You're tired of decision fatigue at 5pm",
  "You already have recipes. You need a week that works.",
];

const eyebrow = "text-xs font-semibold uppercase tracking-[0.18em]";
const headingClass = "font-sans font-bold tracking-tight text-foreground";

const TheRealWeekProject = () => {
  const canonical = `${SITE_URL}/real-week-project`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Real Week Project by Family Food OS",
    description:
      "A 7-day family dinner study. Track one real dinner week and get a personalized Dinner Pattern Report showing what's working, what's breaking, and how to make next week easier.",
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
          content="A 7-day family dinner study. Track one real dinner week and get a personalized Dinner Pattern Report showing what's working, what's breaking, and how to make next week easier."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Family Food OS" />
        <meta property="og:title" content="The Real Week Project | Family Food OS" />
        <meta
          property="og:description"
          content="Track one real dinner week and get a personalized Dinner Pattern Report."
        />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Real Week Project | Family Food OS" />
        <meta
          name="twitter:description"
          content="Track one real dinner week and get a personalized Dinner Pattern Report."
        />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <LandingHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="px-4 pt-24 pb-16 md:pt-28 md:pb-20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> A 7-Day Family Dinner Study
                </span>

                <h1 className={`mt-6 text-5xl leading-[1.02] md:text-6xl ${headingClass}`}>
                  Track one real dinner week.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Get a personalized <strong className="font-semibold text-foreground">Dinner Pattern Report</strong>{" "}
                  showing what's working, what's breaking, and how to make next week easier.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary px-7 py-6 text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                    asChild
                  >
                    <a href="#join">
                      Find my Dinner Pattern <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <span className="text-sm text-muted-foreground">Free · 7 days · 3 minutes a day</span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  Private household info stays private.
                </p>

                {/* Example insight */}
                <div className="mt-8 max-w-md rounded-2xl border border-border bg-card p-5">
                  <p className={`flex items-center gap-2 ${eyebrow} text-foreground/70`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Example Insight
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-foreground/80">
                    "Wednesdays are your highest-stress dinner night. Plan leftovers or 20-minute meals."
                  </p>
                </div>

                {/* Gift badge */}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-warm-light px-4 py-2 text-sm text-foreground/80">
                  <span>🎁</span>
                  <span>Complete all 7 days for a chance to win one of five $25 grocery gift cards.</span>
                </div>

                {/* Social proof */}
                <div className="mt-5 flex max-w-md items-center gap-3">
                  <div className="flex -space-x-2">
                    <span className="h-6 w-6 rounded-full border-2 border-background bg-accent" />
                    <span className="h-6 w-6 rounded-full border-2 border-background bg-sage" />
                    <span className="h-6 w-6 rounded-full border-2 border-background bg-primary" />
                  </div>
                  <p className="text-sm leading-snug text-muted-foreground">
                    Families are joining this week. Spots are limited so every household gets a real report.
                  </p>
                </div>
              </motion.div>

              {/* Hero image with floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <div className="overflow-hidden rounded-[1.75rem] border border-border/60 shadow-xl">
                  <img
                    src={familyDinner}
                    alt="A family sharing a pasta dinner together in a warm sage-green kitchen"
                    width={1024}
                    height={1216}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Top-right pill */}
                <div className="absolute -top-3 right-4 flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 3 min a day
                </div>

                {/* Bottom-left report card */}
                <div className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-lg">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Check className="h-4 w-4 text-primary" />
                  </span>
                  <div className="leading-tight">
                    <p className={`${eyebrow} text-foreground/60`}>Your Report</p>
                    <p className="text-sm font-semibold text-foreground">5 patterns found</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What we're studying */}
        <section className="bg-card px-4 py-20 md:py-28">
          <div className="container mx-auto max-w-3xl text-center">
            <p className={`${eyebrow} text-primary`}>What we're studying</p>
            <h2 className={`mx-auto mt-5 max-w-2xl text-3xl leading-tight md:text-[2.6rem] ${headingClass}`}>
              We're studying the gap between the dinner you planned and the dinner that actually happened.
            </h2>
            <div className="mt-8 space-y-3">
              {STUDYING.map((line) => (
                <p key={line} className="text-lg text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* What you'll do */}
        <section className="px-4 py-20 md:py-24">
          <div className="container mx-auto max-w-6xl">
            <p className={`${eyebrow} text-primary`}>What you'll do</p>
            <h2 className={`mt-3 text-3xl md:text-4xl ${headingClass}`}>
              Three small steps. One real week.
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.2) }}
                  className="rounded-2xl border border-border bg-card p-7 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                      <s.icon className="h-5 w-5 text-primary" />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">{s.num}</span>
                  </div>
                  <h3 className={`mt-7 text-xl ${headingClass}`}>{s.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What you get back (dark green) */}
        <section className="bg-primary px-4 py-20 text-primary-foreground md:py-28">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <p className={`${eyebrow} text-accent`}>What you get back</p>
                <h2 className={`mt-5 text-3xl leading-tight md:text-[2.6rem] font-sans font-bold tracking-tight text-primary-foreground`}>
                  Your personalized Dinner Pattern Report.
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-primary-foreground/75">
                  One clear document. No fluff, no generic advice — just the patterns we see in your
                  actual week, and what to do with them.
                </p>
              </div>

              <div className="space-y-4">
                {GET_BACK.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.24) }}
                    className="flex items-center gap-4 rounded-2xl bg-primary-foreground/[0.06] px-5 py-5 ring-1 ring-primary-foreground/10"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                    <p className="text-base text-primary-foreground/90">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* A peek at your report */}
        <section className="px-4 py-20 md:py-24">
          <div className="container mx-auto max-w-6xl">
            <p className={`${eyebrow} text-primary`}>A peek at your report</p>
            <h2 className={`mt-3 text-3xl md:text-4xl ${headingClass}`}>
              Your Dinner Pattern Report may include:
            </h2>

            <div className="mt-8 rounded-[1.5rem] bg-secondary/40 p-2 shadow-sm">
              <div className="rounded-[1.25rem] border border-border bg-card p-7 md:p-9">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-5">
                  <p className={`${eyebrow} text-foreground/70`}>Dinner Pattern Report</p>
                  <p className="text-sm text-muted-foreground">The Rivera Household · Week of Oct 14</p>
                </div>

                <div className="grid grid-cols-1 gap-x-10 gap-y-5 py-7 md:grid-cols-2">
                  {REPORT_LEFT.flatMap((t, i) => [t, REPORT_RIGHT[i]]).map((t, idx) => (
                    <div key={`${t}-${idx}`} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </span>
                      <p className="text-base text-foreground/85">{t}</p>
                    </div>
                  ))}
                </div>


                <p className="border-t border-border pt-5 text-sm text-muted-foreground">
                  Sample preview — your report is generated from your own week.
                </p>
              </div>
            </div>

            {/* CTA after report preview */}
            <div className="mt-12 text-center">
              <h3 className={`text-2xl md:text-3xl ${headingClass}`}>
                Ready to find your dinner pattern?
              </h3>
              <Button
                size="lg"
                className="mt-6 rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                asChild
              >
                <a href="#join">
                  Join the study <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="px-4 py-20 md:py-24">
          <div className="container mx-auto max-w-6xl">
            <p className={`${eyebrow} text-primary`}>Who it's for</p>
            <h2 className={`mt-3 text-3xl md:text-4xl ${headingClass}`}>
              This study is built for real households.
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {WHO.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.2) }}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"
                >
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <p className="text-base leading-relaxed text-foreground/85">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join the study */}
        <section id="join" className="scroll-mt-24 bg-card px-4 py-20 md:py-28">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <p className={`${eyebrow} text-primary`}>Join the study</p>
                <h2 className={`mt-3 text-4xl md:text-5xl ${headingClass}`}>
                  Help us study the real week.
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                  Spots are limited so we can give every household a real report. Add your household
                  and we'll be in touch when the next week opens.
                </p>
              </div>

              <div className="lg:pl-6">
                <StudySignupForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <GuidesFooter />
    </div>
  );
};

export default TheRealWeekProject;
