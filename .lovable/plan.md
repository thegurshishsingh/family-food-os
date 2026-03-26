

# Family Food OS — Product Video (Remotion)

A 26-second, 1080x1920 portrait video built with Remotion, rendered to MP4.

## Creative Direction

- **Aesthetic**: Luxury/Editorial — warm cream backgrounds, sage accents, serif typography, smooth springs
- **Fonts**: Fraunces (display serif) + DM Sans (body) via `@remotion/google-fonts`
- **Palette**: Sage `#4A7C6B`, Cream `#FAF8F5`, Warm `#CC8E52`, Charcoal `#221F1C`, Red `#E03B3B`, Sage-light `#E2EDE8`, Warm-light `#f5e6d3`
- **Motion**: Spring-based entrances (damping 14, stiffness 160), 18-frame staggers, wipe/fade transitions
- **Motifs**: Rounded cards matching app UI, floating sage blobs, badge pills, check chips
- **Arc**: Frustration (silence, generic recipes) → Clarity (learns your family) → Delight (smart weekly plan) → Trust (gets smarter) → Resolution (brand close)

## File Structure

```text
remotion/
  package.json
  tsconfig.json
  src/
    index.ts              # registerRoot
    Root.tsx               # Composition: 1080x1920, 30fps, 780 frames
    MainVideo.tsx          # TransitionSeries wiring all 6 scenes
    scenes/
      Scene0Hook.tsx       # 30 frames — dark phone, "what's for dinner?" text
      Scene1Problem.tsx     # 120 frames — generic recipe grid + red X stamp
      Scene2Shift.tsx       # 120 frames — "learns your family" + avatars + tags
      Scene3WeeklyPlan.tsx  # 210 frames — full 7-day card build, hero scene
      Scene4Learning.tsx    # 150 frames — check-in chips + insights
      Scene5Close.tsx       # 150 frames — logo, headline, CTA, social proof
    components/
      Background.tsx        # Reusable floating blob + gradient backgrounds
  scripts/
    render-remotion.mjs     # Programmatic render → /mnt/documents/
  public/                   # (empty, no external assets needed)
```

## Scene Breakdown

### Scene 0 — The Hook (0–1s, 30 frames)
- Dark background simulating phone screen
- iMessage-style bubble: "what's for dinner tonight? 🍽️"
- Typing indicator dots, then silence — no reply
- Fade transition to Scene 1

### Scene 1 — The Problem (1–5s, 120 frames)
- Off-white `#f5f3f0` background
- "THE PROBLEM" small caps label
- Serif headline: "Most meal planners give you recipes."
- 3×2 grid of generic recipe cards (emoji + name + border)
- Large red `#E03B3B` circle-X stamps over grid via spring scale
- Caption: "Same 6 recipes. Different week. Every time."
- Wipe-left transition to Scene 2

### Scene 2 — The Shift (5–9s, 120 frames)
- Cream `#FAF8F5` with floating sage blobs (Math.sin drift)
- "INTRODUCING" eyebrow → "Family Food OS learns your family." (learns = sage italic)
- Three avatar circles spring in from different directions
- Five floating tags stagger in with sage-light background

### Scene 3 — Weekly Plan (9–16s, 210 frames) — Hero
- Cream background
- Weekly plan card matching landing page design exactly:
  - Sage header with "YOUR WEEK" + "March 10 – 16" + Reality Score 84 badge
  - Column headers: DAY / MEAL / PREP
  - 7 rows slide in left with 18-frame stagger, each with mode badge
  - Footer: "4 cook · 2 leftovers · 1 out" / "~2,400 cal avg"
- "This could be your week." italic serif CTA fades in below

### Scene 4 — Learning (16–21s, 150 frames)
- "It gets smarter every week." headline (every week = sage italic)
- Dinner Check-In card springs up with chips (2 selected, 2 not)
- Insight card: "Got it. Thursdays should stay low-effort."
- Learnings list: 3 items animate in with sage dot indicators

### Scene 5 — Close (21–26s, 150 frames)
- Cream + two radial gradient orbs (sage-light, warm-light) with slow pulse
- Logo mark (sage rounded square + chef hat) springs in with subtle continuous pulse
- "Plan your real week of food." large serif headline
- Tagline + CTA pill button (sage bg, white text) with repeating pulse
- Social proof line fades in last
- Final 1s: gentle fade to cream

## Transitions (via TransitionSeries)
- Scene 0→1: fade (20 frames)
- Scene 1→2: wipe from-left (30 frames)
- Scene 2→3: fade (25 frames)
- Scene 3→4: wipe from-left (30 frames)
- Scene 4→5: fade (25 frames)

Total with overlaps: 780 frames accounting for ~130 frames of transition overlap from the raw 780 scene frames.

## Motion System
- **Default entrance**: `spring({ frame, fps, config: { damping: 14, stiffness: 160 } })` mapped to opacity + translateY(20→0)
- **Card entrance**: same spring mapped to opacity + scale(0.94→1.0)
- **Accent motion**: larger spring overshoot for hero elements (damping: 10)
- **Stagger**: 18 frames between list items
- **Background drift**: `Math.sin(frame / 90) * amplitude` for organic blob movement
- **Exits**: handled by transitions (no explicit exit animations needed)

## Rendering
- **render-remotion.mjs**: Programmatic script using `@remotion/bundler` + `@remotion/renderer`
  - Output: `/mnt/documents/familyfoodOS-product-video.mp4`
  - Codec: H.264, CRF 18, muted, concurrency 1
  - chromeMode: "chrome-for-testing", no-sandbox flags
- **Spot-check**: `bunx remotion still` at frames 15, 60, 120, 240, 420, 600, 720

## Implementation Order
1. Scaffold project, install deps, fix compositor binary, symlink ffmpeg
2. Create tsconfig.json, index.ts, Root.tsx with composition settings
3. Build Background.tsx (floating blobs + gradient utilities)
4. Build scenes 0–5 sequentially, each in its own file
5. Wire MainVideo.tsx with TransitionSeries + transitions
6. Spot-check key frames
7. Full render to MP4
8. Deliver artifact

