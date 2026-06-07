import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import GuidesFooter from "@/components/guides/GuidesFooter";
import GuideContent from "@/components/guides/GuideContent";
import GuideCard from "@/components/guides/GuideCard";
import { ShowcaseStage } from "@/components/landing/primitives";
import {
  WeeklyPlanScreen,
  GroceryScreen,
  SavingsScreen,
  InsightsScreen,
  DailyDinnerScreen,
  RealityScoreScreen,
  OnboardingScreen,
} from "@/components/landing/screens";
import {
  GUIDES,
  OG_IMAGE,
  SITE_URL,
  getCategory,
  getGuide,
  type ScreenKey,
} from "@/content/guides";

const SCREENS: Record<ScreenKey, () => JSX.Element> = {
  weeklyPlan: WeeklyPlanScreen,
  grocery: GroceryScreen,
  savings: SavingsScreen,
  insights: InsightsScreen,
  dailyDinner: DailyDinnerScreen,
  realityScore: RealityScoreScreen,
  onboarding: OnboardingScreen,
};

const GuideArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuide(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!guide) return <Navigate to="/guides" replace />;

  const category = getCategory(guide.category);
  const HeroScreen = SCREENS[guide.heroScreen];
  const canonical = `${SITE_URL}/guides/${guide.slug}`;
  const related = guide.related
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Organization", name: "Family Food OS", url: `${SITE_URL}/` },
    publisher: {
      "@type": "Organization",
      name: "Family Food OS",
      url: `${SITE_URL}/`,
    },
    keywords: guide.keywords.join(", "),
    articleSection: category.label,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{guide.seoTitle}</title>
        <meta name="description" content={guide.description} />
        <meta name="keywords" content={guide.keywords.join(", ")} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={guide.seoTitle} />
        <meta property="og:description" content={guide.description} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <LandingHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-20 pb-8 md:pt-28 md:pb-12">
          <div className="absolute inset-0 -z-10 gradient-mesh" aria-hidden="true" />
          <div className="container mx-auto max-w-3xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-primary">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/guides" className="transition-colors hover:text-primary">Guides</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="truncate text-foreground/70">{category.label}</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {category.label}
              </span>
              <h1 className="mt-4 font-serif text-3xl md:text-5xl font-semibold leading-[1.08] tracking-tight text-foreground">
                {guide.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {guide.excerpt}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground/70">
                <Clock className="h-3.5 w-3.5" /> {guide.readMinutes} min read
              </div>
            </motion.div>
          </div>
        </section>

        {/* Hero visual */}
        <section className="px-4">
          <div className="container mx-auto max-w-3xl">
            <ShowcaseStage screen={HeroScreen} tone={guide.tone} crop cropHeightClassName="h-[260px] sm:h-[300px]" />
          </div>
        </section>

        {/* Article body */}
        <article className="px-4 pt-10 md:pt-14">
          <div className="container mx-auto max-w-2xl">
            <GuideContent blocks={guide.blocks} />
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="px-4 pt-16 md:pt-24">
            <div className="container mx-auto max-w-5xl">
              <h2 className="mb-6 font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                Keep reading
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((g, i) => (
                  <GuideCard key={g.slug} guide={g} index={i} />
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/guides"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-sage-dark"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to all guides
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <GuidesFooter />
    </div>
  );
};

export default GuideArticle;
