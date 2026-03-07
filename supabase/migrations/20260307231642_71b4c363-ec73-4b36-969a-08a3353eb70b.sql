
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Households
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Family',
  num_adults INTEGER NOT NULL DEFAULT 2,
  num_children INTEGER NOT NULL DEFAULT 0,
  child_age_bands TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view own household" ON public.households FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert own household" ON public.households FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own household" ON public.households FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own household" ON public.households FOR DELETE USING (auth.uid() = owner_id);

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Household preferences
CREATE TABLE public.household_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL UNIQUE REFERENCES public.households(id) ON DELETE CASCADE,
  cuisines_liked TEXT[] DEFAULT '{}',
  cuisines_disliked TEXT[] DEFAULT '{}',
  dietary_preferences TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  weekly_grocery_budget NUMERIC(8,2),
  cooking_time_tolerance TEXT DEFAULT 'medium',
  preferred_takeout_frequency INTEGER DEFAULT 1,
  grocery_store TEXT,
  delivery_preference TEXT DEFAULT 'in-store',
  health_goal TEXT DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.household_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own household prefs" ON public.household_preferences FOR SELECT
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can insert own household prefs" ON public.household_preferences FOR INSERT
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can update own household prefs" ON public.household_preferences FOR UPDATE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE TRIGGER update_household_preferences_updated_at BEFORE UPDATE ON public.household_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Weekly contexts
CREATE TABLE public.weekly_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  newborn_in_house BOOLEAN DEFAULT false,
  guests_visiting BOOLEAN DEFAULT false,
  sports_week BOOLEAN DEFAULT false,
  one_parent_traveling BOOLEAN DEFAULT false,
  budget_week BOOLEAN DEFAULT false,
  low_cleanup_week BOOLEAN DEFAULT false,
  sick_week BOOLEAN DEFAULT false,
  high_protein_week BOOLEAN DEFAULT false,
  chaotic_week BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weekly contexts" ON public.weekly_contexts FOR SELECT
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can insert own weekly contexts" ON public.weekly_contexts FOR INSERT
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can update own weekly contexts" ON public.weekly_contexts FOR UPDATE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE TRIGGER update_weekly_contexts_updated_at BEFORE UPDATE ON public.weekly_contexts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Weekly plans
CREATE TABLE public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  context_id UUID REFERENCES public.weekly_contexts(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  reality_score INTEGER DEFAULT 80,
  reality_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weekly plans" ON public.weekly_plans FOR SELECT
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can insert own weekly plans" ON public.weekly_plans FOR INSERT
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can update own weekly plans" ON public.weekly_plans FOR UPDATE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can delete own weekly plans" ON public.weekly_plans FOR DELETE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE TRIGGER update_weekly_plans_updated_at BEFORE UPDATE ON public.weekly_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Plan days
CREATE TYPE public.meal_mode AS ENUM ('cook', 'leftovers', 'takeout', 'dine_out', 'emergency');

CREATE TABLE public.plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_mode meal_mode NOT NULL DEFAULT 'cook',
  meal_name TEXT,
  meal_description TEXT,
  cuisine_type TEXT,
  prep_time_minutes INTEGER,
  calories INTEGER,
  protein_g NUMERIC(6,1),
  carbs_g NUMERIC(6,1),
  fat_g NUMERIC(6,1),
  fiber_g NUMERIC(6,1),
  is_locked BOOLEAN DEFAULT false,
  notes TEXT,
  leftover_source_day INTEGER,
  takeout_budget NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own plan days" ON public.plan_days FOR SELECT
  USING (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));
CREATE POLICY "Users can insert own plan days" ON public.plan_days FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));
CREATE POLICY "Users can update own plan days" ON public.plan_days FOR UPDATE
  USING (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));
CREATE POLICY "Users can delete own plan days" ON public.plan_days FOR DELETE
  USING (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));

CREATE TRIGGER update_plan_days_updated_at BEFORE UPDATE ON public.plan_days
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grocery items
CREATE TABLE public.grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'pantry',
  item_name TEXT NOT NULL,
  quantity TEXT,
  is_checked BOOLEAN DEFAULT false,
  is_staple BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own grocery items" ON public.grocery_items FOR SELECT
  USING (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));
CREATE POLICY "Users can insert own grocery items" ON public.grocery_items FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));
CREATE POLICY "Users can update own grocery items" ON public.grocery_items FOR UPDATE
  USING (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));
CREATE POLICY "Users can delete own grocery items" ON public.grocery_items FOR DELETE
  USING (plan_id IN (SELECT id FROM public.weekly_plans WHERE household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid())));

-- Meal feedback
CREATE TYPE public.feedback_type AS ENUM ('loved', 'okay', 'kids_refused', 'too_hard', 'good_leftovers', 'reorder_worthy');

CREATE TABLE public.meal_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  plan_day_id UUID REFERENCES public.plan_days(id) ON DELETE SET NULL,
  meal_name TEXT NOT NULL,
  feedback feedback_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meal_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meal feedback" ON public.meal_feedback FOR SELECT
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can insert own meal feedback" ON public.meal_feedback FOR INSERT
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

-- Saved takeout preferences
CREATE TABLE public.saved_takeout_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  cuisine_type TEXT NOT NULL,
  restaurant_name TEXT,
  avg_cost NUMERIC(8,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_takeout_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own takeout prefs" ON public.saved_takeout_preferences FOR SELECT
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can insert own takeout prefs" ON public.saved_takeout_preferences FOR INSERT
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can update own takeout prefs" ON public.saved_takeout_preferences FOR UPDATE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
CREATE POLICY "Users can delete own takeout prefs" ON public.saved_takeout_preferences FOR DELETE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
