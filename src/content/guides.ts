/**
 * Guides content library.
 *
 * Content-as-data so the same blocks drive both the article renderer
 * (`GuideContent`) and SEO structured data (Article JSON-LD).
 *
 * Inline link / emphasis syntax inside `text` fields:
 *   [label](/path)   → internal or external link
 *   **bold**         → emphasis
 *
 * `screen` blocks reference real in-app screen components by key, so guides
 * show the actual product UI (trust > stock photography).
 */

export type ScreenKey =
  | "weeklyPlan"
  | "grocery"
  | "savings"
  | "insights"
  | "dailyDinner"
  | "realityScore"
  | "onboarding";

export type Tone = "sky" | "sage" | "amber" | "coral";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title: string; text: string; tone?: Tone }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "stat"; items: { value: string; label: string }[] }
  | { type: "screen"; screen: ScreenKey; tone?: Tone; caption?: string }
  | { type: "cta"; title: string; text: string };

export type CategoryId =
  | "dinner-stress"
  | "grocery-waste"
  | "real-week-planning"
  | "family-dinner-systems";

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
  /** Tailwind gradient for the category icon tile. */
  gradient: string;
  tone: Tone;
}

export interface Guide {
  slug: string;
  category: CategoryId;
  /** On-page H1 / card title. */
  title: string;
  /** <title> tag — keep under ~60 chars. */
  seoTitle: string;
  /** Meta description — keep under ~155 chars. */
  description: string;
  /** Library-card summary. */
  excerpt: string;
  readMinutes: number;
  tone: Tone;
  /** Hero illustration screen. */
  heroScreen: ScreenKey;
  keywords: string[];
  /** Published / updated date (ISO). */
  updated: string;
  blocks: Block[];
  related: string[];
  /** Featured in the library hero row. */
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    id: "real-week-planning",
    label: "Real Week Planning",
    blurb: "Plan around the week you actually have — not a perfect one.",
    gradient: "from-primary to-sage-dark",
    tone: "sage",
  },
  {
    id: "dinner-stress",
    label: "Dinner Stress",
    blurb: "Why dinner feels heavy by midweek — and how to take the weight off.",
    gradient: "from-coral to-accent",
    tone: "coral",
  },
  {
    id: "grocery-waste",
    label: "Grocery Waste",
    blurb: "Buy less, waste less, and actually eat what you bought.",
    gradient: "from-sky to-primary",
    tone: "sky",
  },
  {
    id: "family-dinner-systems",
    label: "Family Dinner Systems",
    blurb: "Turn dinner from a nightly decision into a rhythm that runs itself.",
    gradient: "from-accent to-warm",
    tone: "amber",
  },
];

export const GUIDES: Guide[] = [
  // 1 — Real Week Planning (pillar / philosophy)
  {
    slug: "real-week-dinner-guide",
    category: "real-week-planning",
    title:
      "The Real Week Dinner Guide: How to Plan Dinners Around the Week You Actually Have",
    seoTitle: "The Real Week Dinner Guide | Plan Around Real Life",
    description:
      "Stop planning seven perfect dinners. Learn how to plan weekly meals around your real schedule — with cook nights, leftovers, and takeout built in.",
    excerpt:
      "Our core philosophy: don't plan seven perfect dinners. Plan around the messy, beautiful, unpredictable week you actually have.",
    readMinutes: 8,
    tone: "sage",
    heroScreen: "weeklyPlan",
    keywords: [
      "how to plan weekly meals",
      "meal planning for families",
      "weekly meal planner",
      "realistic meal planning",
    ],
    updated: "2026-06-07",
    featured: true,
    blocks: [
      {
        type: "p",
        text: "Most meal planning advice starts from a fantasy: seven home-cooked dinners, every ingredient used, every family member delighted. Then real life shows up — a late meeting, a tired kid, a soccer practice that ran long — and the whole plan collapses by Wednesday. The problem was never your willpower. It was the plan.",
      },
      {
        type: "p",
        text: "At Family Food OS, we plan differently. We start from the week you actually have, then build dinner around it. This guide walks through that philosophy — and how to put it into practice tonight.",
      },
      {
        type: "h2",
        text: "The myth of the perfect week",
        id: "the-myth",
      },
      {
        type: "p",
        text: "A perfect-week plan assumes every night has the same energy, the same time, and the same appetite. None of that is true. Monday after work is not Saturday morning. The week has texture — and a dinner plan that ignores that texture is a plan that's designed to fail.",
      },
      {
        type: "callout",
        tone: "coral",
        title: "The real reason plans break",
        text: "It's not laziness. Most plans assume seven cook-from-scratch nights and zero schedule changes. Real weeks have neither. Read more in [Why Meal Planning Fails by Wednesday](/guides/why-meal-planning-fails-by-wednesday).",
      },
      {
        type: "h2",
        text: "Plan the week, not seven dinners",
        id: "plan-the-week",
      },
      {
        type: "p",
        text: "The shift is small but everything changes once you make it: you're not choosing seven recipes, you're assigning a **mode** to each night. Some nights you cook. Some nights you eat leftovers on purpose. Some nights are takeout — and that's a feature, not a failure.",
      },
      {
        type: "ul",
        items: [
          "**Cook nights** — when you have the time and energy to make something from scratch.",
          "**Leftover nights** — intentionally cooking once and eating twice.",
          "**Takeout nights** — planned, budgeted, guilt-free.",
          "**Low-effort nights** — 15 minutes, pantry staples, no thinking required.",
          "**Dine-out nights** — the standing pizza-Friday that keeps everyone sane.",
        ],
      },
      {
        type: "screen",
        screen: "weeklyPlan",
        tone: "sage",
        caption:
          "A real week inside Family Food OS — cook, leftovers, takeout, and dine-out, all in one plan.",
      },
      {
        type: "h2",
        text: "Match dinner to the night's energy",
        id: "match-energy",
      },
      {
        type: "p",
        text: "Once you think in modes, planning becomes a quick read of your calendar. Busy Tuesday? That's a leftover night. Open Sunday afternoon? Cook the big batch that feeds Monday too. You stop fighting your week and start flowing with it.",
      },
      {
        type: "p",
        text: "Family Food OS does this read for you. It looks at your schedule, your past weeks, and your family's feedback, then proposes a plan that already accounts for the nights that were always going to be hard. We score every plan with a [Reality Score](/guides/how-to-build-a-weekly-dinner-rhythm) so you can see — before the week starts — whether it's actually doable.",
      },
      {
        type: "quote",
        text: "I stopped feeling like a failure every Wednesday. The plan expected Wednesday to be hard, so Wednesday being hard wasn't a problem anymore.",
        attribution: "A founding family",
      },
      {
        type: "h2",
        text: "Build leftovers and takeout in on purpose",
        id: "build-in-buffers",
      },
      {
        type: "p",
        text: "The families who cook most consistently aren't the ones with the most discipline. They're the ones with the most buffers. A planned leftover night means one less decision. A planned takeout night means you don't blow the budget panic-ordering at 6pm. When the easy nights are part of the plan, the cook nights actually happen.",
      },
      {
        type: "callout",
        tone: "sky",
        title: "Shop the plan, not the recipes",
        text: "When you plan around real modes, your grocery list gets smaller and smarter. See how in [How to Stop Wasting Groceries Every Week](/guides/how-to-stop-wasting-groceries-every-week).",
      },
      {
        type: "h2",
        text: "Let the plan learn your family",
        id: "let-it-learn",
      },
      {
        type: "p",
        text: "A real-week plan gets better every week because it remembers. It knows the taco bar was a hit and the spicy curry got refused. It knows Wednesdays are takeout. It knows which 15-minute dinner saved you last month. That memory is what turns a plan into a system.",
      },
      {
        type: "cta",
        title: "Plan around your real week",
        text: "Let Family Food OS build a plan that already expects the hard nights — cook, leftovers, and takeout in one place.",
      },
    ],
    related: [
      "why-meal-planning-fails-by-wednesday",
      "how-to-build-a-weekly-dinner-rhythm",
      "the-dinner-pattern-report",
    ],
  },

  // 2 — Dinner Stress (pain-based)
  {
    slug: "why-meal-planning-fails-by-wednesday",
    category: "dinner-stress",
    title: "Why Meal Planning Fails by Wednesday",
    seoTitle: "Why Meal Planning Fails by Wednesday (and the Fix)",
    description:
      "Most meal plans collapse midweek. Here's why — schedule changes, leftovers, kid feedback, energy, and takeout reality — and how to plan around all five.",
    excerpt:
      "Almost everyone has watched a meal plan fall apart by midweek. It's not your fault — here are the five forces that break plans, and how to plan around them.",
    readMinutes: 7,
    tone: "coral",
    heroScreen: "dailyDinner",
    keywords: [
      "meal planning fails",
      "why meal planning doesn't work",
      "meal plan falls apart",
      "realistic meal planning",
    ],
    updated: "2026-06-07",
    featured: true,
    blocks: [
      {
        type: "p",
        text: "You did everything right. You sat down on Sunday, picked seven dinners, wrote the list, did the shop. And then by Wednesday the plan is in the bin and you're staring into the fridge wondering what happened. If this is you, you're not disorganized. You're up against five forces that almost every meal plan ignores.",
      },
      {
        type: "h2",
        text: "1. Your schedule changed (it always does)",
        id: "schedule",
      },
      {
        type: "p",
        text: "A static plan assumes a static week. But a meeting runs late, a kid's practice moves, someone gets sick. The plan said 'Wednesday: roast chicken' and Wednesday said 'absolutely not.' A plan that can't flex isn't a plan — it's a wish.",
      },
      {
        type: "h2",
        text: "2. Leftovers weren't part of the plan",
        id: "leftovers",
      },
      {
        type: "p",
        text: "Seven separate dinners means seven separate cooks and seven separate shops. That's exhausting by design. The fix is to plan leftovers on purpose — cook once Sunday, eat again Monday — so the week has built-in easy nights.",
      },
      {
        type: "screen",
        screen: "dailyDinner",
        tone: "coral",
        caption:
          "Tonight's dinner, decided for you — so 5pm isn't a decision anymore.",
      },
      {
        type: "h2",
        text: "3. Nobody asked the kids",
        id: "kid-feedback",
      },
      {
        type: "p",
        text: "You can plan a perfect week of meals nobody will eat. Kid feedback is data, and most plans throw it away. When the spicy curry gets refused two weeks running, a good system stops planning the spicy curry. Family Food OS captures that feedback after each meal and quietly adjusts the next plan.",
      },
      {
        type: "callout",
        tone: "amber",
        title: "Feedback is the engine",
        text: "Every 'loved it' and 'never again' makes next week's plan smarter. See how repeated wins and refusals shape your plan in [The Dinner Pattern Report](/guides/the-dinner-pattern-report).",
      },
      {
        type: "h2",
        text: "4. Plans ignore your energy",
        id: "energy",
      },
      {
        type: "p",
        text: "The Sunday version of you is optimistic. The Wednesday version of you is tired. A plan written by Sunday-you, for Wednesday-you, is a setup for guilt. The trick is to assign the hard cooks to your high-energy nights and protect the low-energy nights with leftovers, 15-minute meals, or takeout.",
      },
      {
        type: "h2",
        text: "5. Takeout reality",
        id: "takeout",
      },
      {
        type: "p",
        text: "Pretending you'll never order takeout is how budgets blow up. You order anyway — just unplanned, expensive, and with a side of guilt. Build one or two takeout nights into the plan and the whole week relaxes. We go deep on this in [The 5 PM Dinner Panic](/guides/the-5pm-dinner-panic-why-families-order-takeout).",
      },
      {
        type: "quote",
        text: "Wednesday used to be the day my plan died. Now Wednesday is a leftover night on purpose, and the rest of the week actually survives.",
        attribution: "A founding family",
      },
      {
        type: "h2",
        text: "The fix: plan for the week you'll actually have",
        id: "the-fix",
      },
      {
        type: "p",
        text: "Every one of these five forces is predictable. Schedules change, energy dips, kids have opinions, and takeout happens. A plan that expects all of it doesn't break on Wednesday — because Wednesday was never supposed to be perfect. That's the whole idea behind [The Real Week Dinner Guide](/guides/real-week-dinner-guide).",
      },
      {
        type: "cta",
        title: "Build a plan Wednesday can't break",
        text: "Family Food OS plans around schedule changes, leftovers, and takeout from the start — so midweek doesn't fall apart.",
      },
    ],
    related: [
      "real-week-dinner-guide",
      "the-5pm-dinner-panic-why-families-order-takeout",
      "the-dinner-pattern-report",
    ],
  },

  // 3 — Grocery Waste
  {
    slug: "how-to-stop-wasting-groceries-every-week",
    category: "grocery-waste",
    title: "How to Stop Wasting Groceries Every Week",
    seoTitle: "How to Stop Wasting Groceries Every Week",
    description:
      "Food waste starts at the store. Learn to plan meals before you shop, reuse ingredients across nights, and build leftover nights that cut grocery waste for good.",
    excerpt:
      "The average family throws away hundreds of dollars of groceries a year. Most of that waste is decided at the store — before you ever cook. Here's how to fix it.",
    readMinutes: 7,
    tone: "sky",
    heroScreen: "grocery",
    keywords: [
      "how to stop food waste at home",
      "reduce grocery waste",
      "stop wasting food",
      "grocery list planning",
    ],
    updated: "2026-06-07",
    blocks: [
      {
        type: "p",
        text: "Wasted groceries don't start in the fridge. They start in the aisle, when you buy a bunch of cilantro for one recipe and a bag of spinach 'to be healthy' with no plan for either. By Saturday they're slime, and so is the money you spent on them.",
      },
      {
        type: "stat",
        items: [
          { value: "~30%", label: "of groceries the average household wastes" },
          { value: "$1,500+", label: "thrown away per family per year" },
          { value: "−40%", label: "waste families see with a real plan" },
        ],
      },
      {
        type: "h2",
        text: "Rule 1: Plan the meals before the list",
        id: "plan-first",
      },
      {
        type: "p",
        text: "A shopping list built without a plan is a list of hopes. You buy ingredients for meals you haven't committed to, on nights you haven't thought about. Reverse it: decide the week's dinners first, then let the list fall out of the plan. You'll buy less, and you'll buy with purpose.",
      },
      {
        type: "screen",
        screen: "grocery",
        tone: "sky",
        caption:
          "A grocery list that's generated from your actual plan — every item maps to a real dinner.",
      },
      {
        type: "h2",
        text: "Rule 2: Reuse ingredients across nights",
        id: "reuse",
      },
      {
        type: "p",
        text: "The cheapest, lowest-waste weeks share ingredients on purpose. Roast a chicken Monday; it's grain bowls Tuesday. Buy the big bag of tortillas for taco night and breakfast wraps. When ingredients carry across nights, nothing gets bought to be used once and forgotten.",
      },
      {
        type: "ul",
        items: [
          "Pick a protein that works two ways (roast → bowls, taco beef → nachos).",
          "Let one vegetable anchor several nights instead of buying five you'll half-use.",
          "Plan a 'use-it-up' night near the end of the week for whatever's left.",
        ],
      },
      {
        type: "h2",
        text: "Rule 3: Build leftover nights on purpose",
        id: "leftover-nights",
      },
      {
        type: "p",
        text: "A leftover night isn't a fallback — it's a design decision that cuts waste and effort at the same time. When you cook once and plan to eat twice, the food gets eaten instead of pushed to the back of the fridge. This is the same buffer thinking that makes the whole week survivable, covered in [The Real Week Dinner Guide](/guides/real-week-dinner-guide).",
      },
      {
        type: "callout",
        tone: "sage",
        title: "Less waste, more saved",
        text: "Families using a real plan typically cut food waste by around 40% and spend noticeably less on last-minute takeout. See the savings view in [How to Build a Weekly Dinner Rhythm](/guides/how-to-build-a-weekly-dinner-rhythm).",
      },
      {
        type: "h2",
        text: "Rule 4: Let the system remember what gets wasted",
        id: "remember-waste",
      },
      {
        type: "p",
        text: "If the same ingredient rots every week, that's a pattern worth catching. Family Food OS notices what you buy but don't use and stops putting it on the list. Over a few weeks, your plan quietly converges on the food your family actually eats. We surface exactly this in [The Dinner Pattern Report](/guides/the-dinner-pattern-report).",
      },
      {
        type: "cta",
        title: "Shop the plan, waste less",
        text: "Family Food OS turns your weekly plan into a tight grocery list — so you buy what you'll cook and cook what you bought.",
      },
    ],
    related: [
      "real-week-dinner-guide",
      "how-to-build-a-weekly-dinner-rhythm",
      "the-dinner-pattern-report",
    ],
  },

  // 4 — Dinner Stress (emotional)
  {
    slug: "the-5pm-dinner-panic-why-families-order-takeout",
    category: "dinner-stress",
    title: "The 5 PM Dinner Panic: Why Families Keep Ordering Takeout",
    seoTitle: "The 5 PM Dinner Panic & the Takeout Trap",
    description:
      "It's 5pm, everyone's hungry, and there's no plan. Here's why the dinner panic drives families to takeout — and how to make 5pm a non-event for good.",
    excerpt:
      "5pm. Everyone's hungry, you're drained, and there's no plan. So you order in — again. Here's why the panic happens, and how to dissolve it.",
    readMinutes: 6,
    tone: "coral",
    heroScreen: "savings",
    keywords: [
      "5pm dinner panic",
      "ordering takeout too much",
      "what's for dinner",
      "dinner decision fatigue",
    ],
    updated: "2026-06-07",
    featured: true,
    blocks: [
      {
        type: "p",
        text: "You know the moment. It's 5pm. The kids are circling the kitchen. You've answered 'what's for dinner?' four times with 'I don't know yet.' You're tired in a way that makes the simplest meal feel impossible. So you grab your phone and order in — again. Not because you wanted to. Because there was no plan, and 5pm is the worst possible time to make one.",
      },
      {
        type: "h2",
        text: "The panic is a decision problem, not a food problem",
        id: "decision-problem",
      },
      {
        type: "p",
        text: "By the end of a workday, you've made a thousand small decisions. Your brain is done. Asking it to also invent dinner — and shop the pantry, and check who'll eat what — at the exact moment everyone's hungriest is a recipe for the easiest possible exit: takeout.",
      },
      {
        type: "callout",
        tone: "coral",
        title: "Decision fatigue is real",
        text: "The problem isn't that you can't cook. It's that 5pm-you shouldn't have to decide. Move the decision to a calmer moment and the panic disappears.",
      },
      {
        type: "h2",
        text: "Why takeout becomes the default",
        id: "default-takeout",
      },
      {
        type: "ul",
        items: [
          "**No plan** means the decision lands at the worst time of day.",
          "**No buffer** means a hard night has no easy fallback except your phone.",
          "**No memory** means you re-solve the same problem every single evening.",
        ],
      },
      {
        type: "p",
        text: "None of these are character flaws. They're missing infrastructure. And takeout — unplanned, repeated takeout — is what fills the gap. It adds up fast: a few panic orders a week can quietly become the biggest line in your food budget.",
      },
      {
        type: "screen",
        screen: "savings",
        tone: "amber",
        caption:
          "What the system gives back: hours saved, less spent on takeout, and far less food wasted.",
      },
      {
        type: "h2",
        text: "Make 5pm a non-event",
        id: "non-event",
      },
      {
        type: "p",
        text: "The fix isn't more discipline at 5pm. It's making sure 5pm has nothing to decide. When tonight's dinner was settled days ago — and the hard nights already have a leftover or a planned takeout attached — 5pm stops being a cliff edge.",
      },
      {
        type: "ol",
        items: [
          "Decide the week in one calm sitting (or let the system decide it for you).",
          "Give every hard night a buffer: leftovers, a 15-minute meal, or a planned takeout.",
          "Let tonight's answer be ready before anyone asks 'what's for dinner?'",
        ],
      },
      {
        type: "p",
        text: "Planned takeout, by the way, is completely fine — that's the whole point of [planning around the week you actually have](/guides/real-week-dinner-guide). The goal isn't zero takeout. It's zero panic.",
      },
      {
        type: "quote",
        text: "The 5pm spiral was the worst part of my day. Now I open the app, dinner's already decided, and I just... start. It sounds small. It changed our evenings.",
        attribution: "A founding family",
      },
      {
        type: "cta",
        title: "End the 5pm panic tonight",
        text: "Family Food OS decides dinner before you're hungry and tired — with a built-in plan for the nights you'd normally order in.",
      },
    ],
    related: [
      "why-meal-planning-fails-by-wednesday",
      "how-to-build-a-weekly-dinner-rhythm",
      "real-week-dinner-guide",
    ],
  },

  // 5 — Family Dinner Systems
  {
    slug: "how-to-build-a-weekly-dinner-rhythm",
    category: "family-dinner-systems",
    title: "How to Build a Weekly Dinner Rhythm",
    seoTitle: "How to Build a Weekly Dinner Rhythm",
    description:
      "Dinner shouldn't be a nightly decision. Build a repeatable rhythm of cook nights, leftover nights, takeout nights, low-effort nights, and family favorites.",
    excerpt:
      "The families who feel calm about dinner don't have more willpower — they have a rhythm. Here's how to build cook, leftover, takeout, and low-effort nights into a system.",
    readMinutes: 8,
    tone: "amber",
    heroScreen: "insights",
    keywords: [
      "weekly dinner routine",
      "dinner rhythm",
      "family dinner system",
      "meal planning routine",
    ],
    updated: "2026-06-07",
    blocks: [
      {
        type: "p",
        text: "Willpower is a terrible dinner strategy. It runs out exactly when you need it most. What the calmest families have instead is a **rhythm** — a repeatable shape to the week that means dinner is mostly decided before the week even starts. Family Food OS isn't an app you check; it's the system that runs that rhythm for you.",
      },
      {
        type: "h2",
        text: "The five kinds of dinner nights",
        id: "five-nights",
      },
      {
        type: "p",
        text: "A rhythm is built from a small set of repeatable night types. You don't need a new idea every evening — you need to know what kind of night it is.",
      },
      {
        type: "h3",
        text: "Cook nights",
      },
      {
        type: "p",
        text: "Real cooking, from scratch, on the nights you have the time and energy. Protect these — don't spread them thin across a week that can't hold them. Two or three great cook nights beat five resentful ones.",
      },
      {
        type: "h3",
        text: "Leftover nights",
      },
      {
        type: "p",
        text: "Cook once, eat twice. A leftover night is the highest-leverage move in the whole week: less cooking, less shopping, less waste. Plan it on purpose right after a big cook night.",
      },
      {
        type: "h3",
        text: "Takeout nights",
      },
      {
        type: "p",
        text: "Planned, budgeted, guilt-free. One standing takeout night gives the week a release valve so the cook nights actually happen. This is the antidote to [the 5pm panic](/guides/the-5pm-dinner-panic-why-families-order-takeout).",
      },
      {
        type: "h3",
        text: "Low-effort nights",
      },
      {
        type: "p",
        text: "Fifteen minutes, pantry staples, zero thinking — pasta, eggs, quesadillas, a big salad. These rescue the tired nights without resorting to your phone.",
      },
      {
        type: "h3",
        text: "Family favorites",
      },
      {
        type: "p",
        text: "The meals you already know everyone will eat. A good rhythm leans on these. There's no prize for novelty when taco night keeps the whole family happy.",
      },
      {
        type: "screen",
        screen: "insights",
        tone: "sage",
        caption:
          "The system learns what worked, what got refused, and what keeps your week realistic.",
      },
      {
        type: "h2",
        text: "Arrange the nights around your real week",
        id: "arrange",
      },
      {
        type: "p",
        text: "A rhythm isn't a rigid menu — it's a sensible default order. Big cook on the open night, leftovers the night after, takeout on the chaos night, low-effort on the late night, favorites sprinkled where they fit. Once you have the shape, each week is a small adjustment instead of a blank page. (This is the practical side of [The Real Week Dinner Guide](/guides/real-week-dinner-guide).)",
      },
      {
        type: "callout",
        tone: "sky",
        title: "The Reality Score keeps you honest",
        text: "Family Food OS scores each plan on how realistic it is for your actual week — so you don't over-commit to five cook nights you'll never pull off.",
      },
      {
        type: "h2",
        text: "Let the rhythm compound",
        id: "compound",
      },
      {
        type: "p",
        text: "The magic of a system is that it improves on its own. Every week the plan learns: which favorites to repeat, which nights always become takeout, which ingredients keep getting wasted. After a month, your rhythm fits your family like a worn-in path. That accumulated picture is exactly what we hand back in [The Dinner Pattern Report](/guides/the-dinner-pattern-report).",
      },
      {
        type: "stat",
        items: [
          { value: "2.5 hrs", label: "saved each week" },
          { value: "$72", label: "less on takeout" },
          { value: "−40%", label: "food wasted" },
        ],
      },
      {
        type: "cta",
        title: "Turn dinner into a rhythm",
        text: "Family Food OS builds cook, leftover, takeout, and low-effort nights into one weekly system that learns your family.",
      },
    ],
    related: [
      "real-week-dinner-guide",
      "the-5pm-dinner-panic-why-families-order-takeout",
      "the-dinner-pattern-report",
    ],
  },
];

/** Helpers */
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);

export const getCategory = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id)!;

export const guidesByCategory = (id: CategoryId) =>
  GUIDES.filter((g) => g.category === id);

export const SITE_URL = "https://www.familyfoodos.com";
