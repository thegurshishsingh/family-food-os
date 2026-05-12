import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote, TrendingUp, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ContentCard, IconTile } from "./primitives";
import { cn } from "@/lib/utils";
import { useMockupMode, type MockupMode } from "./mockupModeStore";

type Story = {
  family: string;
  context: string;
  initials: string;
  avatarGradient: string;
  struggle: string;
  win: string;
  outcome: { label: string; value: string };
  quote: string;
  modeFocus: string;
};

const STORIES: Story[] = [
  {
    family: "The Hendersons",
    context: "Two parents · newborn · toddler",
    initials: "H",
    avatarGradient: "from-primary to-sage-dark",
    struggle:
      "Sleep-deprived. Planning 6 cook nights every Sunday. Thursday meltdown around 5pm. Cereal for dinner. Again.",
    win: "Reality Score capped them at 3 cook nights. The other four became leftovers, freezer meals, and a planned takeout night.",
    outcome: { label: "Cook nights", value: "6 → 3" },
    quote:
      "I stopped feeling like I was failing dinner. The plan finally matched the life we're actually living.",
    modeFocus: "Reality Score",
  },
  {
    family: "Marcus & the boys",
    context: "Single dad · two kids (9, 12)",
    initials: "M",
    avatarGradient: "from-sage-dark to-primary",
    struggle:
      "Cooking from scratch every night was burning him out. Grocery runs three times a week. Same five meals on rotation.",
    win: "The system planned Sunday's roast to become Tuesday's tacos and Thursday's grain bowls. One shop, three dinners.",
    outcome: { label: "Grocery runs", value: "3 → 1 / week" },
    quote:
      "Leftovers used to feel lazy. Now they feel like strategy. The boys actually look forward to taco night.",
    modeFocus: "Leftovers",
  },
  {
    family: "The Patels",
    context: "Two cooks · picky eater · vegetarian",
    initials: "P",
    avatarGradient: "from-accent to-accent/70",
    struggle:
      "Endless 'what do you want' debates. Half-eaten plates. A fridge full of ingredients nobody wanted to touch.",
    win: "After four weeks of check-ins, the plan learned which meals everyone actually finished. Loved meals auto-saved.",
    outcome: { label: "Plate-clean rate", value: "+62%" },
    quote:
      "It learns. That's the part nobody else does. Week six felt like the app finally knew our family.",
    modeFocus: "Meal memory",
  },
  {
    family: "The Okonkwos",
    context: "Two working parents · three kids",
    initials: "O",
    avatarGradient: "from-sage to-primary",
    struggle:
      "Friday nights were the hardest. Everyone exhausted. Always ended up at the drive-thru, feeling vaguely guilty.",
    win: "Friday became an intentional dine-out night — a family ritual, not a defeat. Saturday became a fresh cook night.",
    outcome: { label: "Friday stress", value: "Gone" },
    quote:
      "Naming Friday as 'dine out night' on purpose changed everything. It stopped feeling like we'd given up.",
    modeFocus: "Dine Out",
  },
  {
    family: "The Bauers",
    context: "Empty nesters · grandkids on weekends",
    initials: "B",
    avatarGradient: "from-primary to-sage-dark",
    struggle:
      "Weeknights were easy. Weekends with grandkids descended into chaos — three different requests, two trips to the store.",
    win: "Seasonal requests + a planned takeout night for sushi the kids love. The rest of the week stayed quiet and intentional.",
    outcome: { label: "Time saved", value: "~4 hrs / week" },
    quote:
      "I finally have my Saturday morning back. The list is done before I've finished my coffee.",
    modeFocus: "Takeout",
  },
];

const FamilyStories = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (i: number) => emblaApi?.scrollTo(i);

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-accent/[0.05] blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-14 max-w-2xl mx-auto"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary/80">
              Real families, real weeks
            </span>
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-4 tracking-[-0.02em] leading-[1.05]">
            Struggles you know.<br className="hidden md:block" /> <span className="italic text-primary">Wins you'll feel.</span>
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg leading-relaxed font-light">
            Five families, five very different weeks. One quieter dinner table.
          </p>
        </motion.div>

        <motion.div
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={1}
        >
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {STORIES.map((story, i) => (
                  <div key={i} className="flex-[0_0_100%] md:flex-[0_0_85%] lg:flex-[0_0_75%] min-w-0 px-2 md:px-4">
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows */}
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous story"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-6 w-11 h-11 rounded-full bg-background/95 backdrop-blur border border-border/60 items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next story"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-6 w-11 h-11 rounded-full bg-background/95 backdrop-blur border border-border/60 items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {STORIES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to story ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  selectedIndex === i ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60",
                )}
              />
            ))}
          </div>

          {/* Mobile swipe hint */}
          <div className="md:hidden flex items-center justify-center gap-2 mt-3">
            <p className="text-[11px] text-muted-foreground/60 italic">Swipe to read more →</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

function StoryCard({ story }: { story: Story }) {
  return (
    <ContentCard halo="primary" className="!rounded-3xl">
      <div className="grid md:grid-cols-[1fr_280px] gap-0">
        {/* Main content */}
        <div className="p-6 md:p-10">
          {/* Family header */}
          <div className="flex items-center gap-3 mb-5">
            <IconTile size="lg" gradient={story.avatarGradient} className="text-primary-foreground font-serif font-bold text-lg">
              {story.initials}
            </IconTile>
            <div>
              <h3 className="text-base md:text-lg font-serif font-semibold text-foreground leading-tight">{story.family}</h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">{story.context}</p>
            </div>
          </div>

          {/* Struggle → Win */}
          <div className="space-y-4 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-coral/80 mb-1.5">The struggle</p>
              <p className="text-[14px] md:text-[15px] text-foreground/80 leading-relaxed">{story.struggle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-border/60" />
              <Sparkles className="w-3.5 h-3.5 text-primary/60" />
              <span className="h-px flex-1 bg-border/60" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80 mb-1.5">The win</p>
              <p className="text-[14px] md:text-[15px] text-foreground/80 leading-relaxed">{story.win}</p>
            </div>
          </div>

          {/* Quote */}
          <div className="relative pl-5 border-l-2 border-primary/30">
            <Quote className="absolute -left-1 top-0 w-3 h-3 text-primary/40 bg-card -translate-x-1/2" />
            <p className="text-[14px] md:text-[15px] font-serif italic text-foreground/85 leading-relaxed">
              "{story.quote}"
            </p>
          </div>
        </div>

        {/* Outcome panel */}
        <div className="bg-gradient-to-br from-primary/[0.06] via-sage/[0.05] to-accent/[0.04] p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border/30">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">Outcome</p>
          <div className="flex items-baseline gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-2xl md:text-3xl font-serif font-semibold text-foreground tracking-tight">{story.outcome.value}</p>
          </div>
          <p className="text-[12px] text-muted-foreground mb-5">{story.outcome.label}</p>

          <div className="pt-5 border-t border-border/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60 mb-1.5">What unlocked it</p>
            <p className="text-[13px] font-serif font-semibold text-primary">{story.modeFocus}</p>
          </div>
        </div>
      </div>
    </ContentCard>
  );
}

export default FamilyStories;
