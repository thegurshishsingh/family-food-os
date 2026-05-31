## Goal

Rebuild the Family Food OS landing page using Bevel Health's design ideology: **every section shows the actual product UI inside a clean iPhone frame**, surrounded by soft pastel rounded cards, big bold headlines, and generous whitespace. This is what makes Bevel feel trustworthy and authentic — you always see the real app.

## Screenshot strategy (important)

Bevel uses polished product renders, not literal phone photos. The live app is gated behind login (real family data), so literal screen captures aren't available without exposing private data. Instead I'll build **pixel-faithful in-app screen components rendered inside reusable iPhone frames** — the same technique Bevel uses, and what this codebase already does with `DinnerCheckInPreview`. The result reads as authentic real screens, on-brand, with no private data.

If you'd rather use literal captures, you can log into the preview and I'll swap them in — but the mockups will look indistinguishable and stay perfectly on-brand.

## Design ideology to adopt (from Bevel + your screenshots)

- A reusable `<PhoneFrame>` (titanium edge, notch, status bar, rounded 22px screen) used everywhere.
- Soft pastel rounded feature cards (sage/cream/sky tints) with a screen tucked inside or beside the copy.
- Big bold headlines, tight tracking, lots of breathing room; keep Fraunces headings + DM Sans body (locked brand).
- Family Food brand colors kept: Deep Moss, Soft Cream, Soft Amber, Muted Sage (NOT Bevel's blue/sky).
- "And that's not all" style feature list + a 3-up feature card row + an awards/trust strip.

## New / faithful app-screen mockups (each in a PhoneFrame)

1. Onboarding step (household, diet, budget) — "5 minutes to set up"
2. Weekly Plan grid (Mon–Sun with Cook / Leftovers / Takeout / Dine-out badges + Reality Score)
3. Daily Dinner Card (today's meal + check-in)
4. Grocery List (auto-generated, swapped badges)
5. Time-Saved / Savings recap (2+ hrs, $60–80)
6. What-we-learned / weekly insights card

## Section-by-section rebuild

```text
Hero            Bold headline + primary phone (Weekly Plan) on sky-cream wash, trust badge, ratings strip
Trust strip     "Built for real weeknights" + small proof stats / awards-style row
The Problem     Decision fatigue · food waste · follow-through — pastel cards w/ small screen insets
3-up Features   "Plan the week with confidence" — Plan / Groceries / Check-in cards, each w/ a phone screen
Deep feature A  Weekly Plan — copy left, large phone right (zigzag)
Deep feature B  Grocery + leftovers — copy right, large phone left
How it works    3 steps, each paired with an onboarding/plan screen
And that's not all  Feature list (Saved meals, Trends, Notifications, Insights...) + tall phone
Savings payoff  Time + money recap screen in frame
Testimonials    FamilyVoices, restyled to match
Final CTA       Restyled, device peek
Footer          Keep existing illustrated footer
```

## Technical approach

- Add `src/components/landing/PhoneFrame.tsx` (shared device frame) and a `src/components/landing/screens/` folder with the faithful screen components above (Tailwind + semantic tokens only, no hardcoded colors).
- Refactor each landing section component (`HeroSection`, `TheStruggle`, `PlansThatFitRealLife`, `SixQuietThings`, `GroceryListSection`, `HowItWorksPlayful`, `FamilyVoices`, `FinalCTA`) to the new screenshot-forward layout; keep existing copy/messaging (decision fatigue, coordination, food waste, follow-through).
- Reuse existing tokens in `index.css` / `tailwind.config.ts`; add tints only if needed.
- Keep all routing, links, and `MealModeProvider` / `SmoothScroll` wiring intact.
- QA in the browser at mobile (390px) and desktop widths; verify build.

## Out of scope

- No backend, auth, or data changes.
- No new brand colors or fonts (brand stays locked).
- Remotion videos untouched.
