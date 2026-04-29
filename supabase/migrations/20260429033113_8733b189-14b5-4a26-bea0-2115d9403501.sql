-- Add a structured per-check-in outcome to enable strong day-by-day execution signals
-- in the learning model. This is a single canonical category derived from the user's
-- tag selection + effort level at submit time, stored alongside the raw tags so we
-- don't lose nuance.

ALTER TABLE public.evening_checkins
  ADD COLUMN IF NOT EXISTS outcome text;

-- Allowed values: cooked_loved | cooked_fine | too_hard | kids_refused
--                 ordered_out  | leftovers   | not_again | skipped | neutral
ALTER TABLE public.evening_checkins
  DROP CONSTRAINT IF EXISTS evening_checkins_outcome_check;

ALTER TABLE public.evening_checkins
  ADD CONSTRAINT evening_checkins_outcome_check
  CHECK (
    outcome IS NULL OR outcome IN (
      'cooked_loved',
      'cooked_fine',
      'too_hard',
      'kids_refused',
      'ordered_out',
      'leftovers',
      'not_again',
      'skipped',
      'neutral'
    )
  );

CREATE INDEX IF NOT EXISTS evening_checkins_outcome_idx
  ON public.evening_checkins (household_id, outcome);

CREATE INDEX IF NOT EXISTS evening_checkins_plan_day_idx
  ON public.evening_checkins (plan_day_id);
