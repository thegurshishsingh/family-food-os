

## Family Food OS — Implementation Plan

### 1. Design System & Theme
Set up a warm, premium color palette (soft sage greens, warm neutrals, subtle accents), modern typography, and reusable component tokens. Mobile-first responsive design throughout.

### 2. Landing Page
A polished marketing homepage with:
- Hero: "Plan your real week of food" headline + CTA
- 3-step "How it works" section
- Value props (not a grocery app — a weekly food OS)
- Audience callout for busy families
- Clean, premium SaaS aesthetic

### 3. Auth Flow
Email + Google sign-in using Supabase Auth via Lovable Cloud. Login/signup pages with redirect to onboarding for new users.

### 4. Onboarding (Multi-step)
A guided wizard collecting:
- Household basics (name, adults, kids, age bands)
- Food preferences (cuisines, dietary, allergies)
- Logistics (budget, cooking tolerance, takeout frequency, grocery preferences)
- Health goals
- Weekly context toggles (newborn, guests, sports week, etc.)

### 5. Database Schema (Lovable Cloud / Supabase)
Tables for: profiles, households, household_members, household_preferences, weekly_contexts, weekly_plans, plan_days, meals (curated + AI-generated), grocery_items, meal_feedback, saved_takeout_preferences, favorites_dislikes. Proper RLS policies and a user_roles table per security requirements.

### 6. Weekly Planner Dashboard (Core)
- 7-day card layout, each with meal mode (Cook / Leftovers / Takeout / Dine Out / Emergency)
- Meal recommendation per day with nutrition info (cal/protein/carbs/fat)
- Swap, lock, and notes per day
- Weekly nutrition summary bar
- **Reality Score** — rule-based check surfacing warnings like "This week looks ambitious"
- AI-powered meal generation via Lovable AI edge function, factoring in household context, preferences, and weekly toggles

### 7. Grocery List Page
Auto-generated from the weekly plan, organized by category (Produce, Protein, Dairy, Pantry, Frozen, Snacks, Household). Checkboxes, quantities, staples marking, export placeholder. Automatically adjusts for takeout/leftover days.

### 8. Meal Feedback & Memory
Post-meal feedback: Loved / Okay / Kids refused / Too much work / Good leftovers / Reorder-worthy. Meal Memory page showing liked, disliked, kid-approved, best leftovers, favorite takeout. Feeds back into AI recommendations.

### 9. Household Settings
Edit family composition, preferences, allergies, budget, cooking tolerance, takeout frequency, grocery preferences, health goals.

### 10. Demo Seed Data
Pre-populated households and weekly plans for investor demos: young family, newborn household, guests-visiting scenario, with example feedback history.

### Build Order
Design system → Landing page → Auth → Onboarding → DB schema → Weekly planner + AI edge function → Grocery list → Feedback loop → Settings → Seed data

