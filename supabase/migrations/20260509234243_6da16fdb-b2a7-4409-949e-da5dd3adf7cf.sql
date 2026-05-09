UPDATE public.plan_days SET
  calories = LEAST(calories, 2500),
  protein_g = LEAST(protein_g, 250),
  carbs_g = LEAST(carbs_g, 350),
  fat_g = LEAST(fat_g, 200),
  fiber_g = LEAST(fiber_g, 80)
WHERE calories > 2500 OR protein_g > 250 OR carbs_g > 350 OR fat_g > 200 OR fiber_g > 80;