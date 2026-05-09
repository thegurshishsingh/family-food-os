// Shared nutrition normalizer for edge functions.
// AI ingredients are specified PER SINGLE SERVING. This module re-computes
// macros from the ingredient list using a curated per-100g reference table
// and unit→grams conversions, then reconciles them with the AI's reported
// macros (overriding when the AI value is implausibly low/high).

export type Ingredient = {
  name?: string;
  quantity?: string | number | null;
  unit?: string | null;
  // Optional hints AI can pass through. We tolerate them being absent.
  notes?: string | null;
  preparation?: string | null;
};

export type Macros = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

// Per 100 g (cooked unless noted). Conservative, rounded values.
type Ref = { cal: number; p: number; c: number; f: number; fib: number };
const REF: Array<{ match: RegExp; ref: Ref }> = [
  // ============ PROTEINS — Poultry ============
  { match: /chicken\s*(breast|tender|cutlet)/i, ref: { cal: 165, p: 31, c: 0, f: 3.6, fib: 0 } },
  { match: /chicken\s*thigh/i, ref: { cal: 209, p: 26, c: 0, f: 11, fib: 0 } },
  { match: /chicken\s*(drumstick|leg|wing)/i, ref: { cal: 200, p: 25, c: 0, f: 11, fib: 0 } },
  { match: /(rotisserie|shredded|pulled)\s*chicken/i, ref: { cal: 190, p: 28, c: 0, f: 8, fib: 0 } },
  { match: /(ground\s*chicken|chicken\s*mince)/i, ref: { cal: 190, p: 27, c: 0, f: 9, fib: 0 } },
  { match: /chicken/i, ref: { cal: 190, p: 28, c: 0, f: 8, fib: 0 } },
  { match: /(turkey\s*(ground|mince|breast)|ground\s*turkey)/i, ref: { cal: 190, p: 28, c: 0, f: 8, fib: 0 } },
  { match: /turkey/i, ref: { cal: 170, p: 29, c: 0, f: 5, fib: 0 } },
  { match: /duck/i, ref: { cal: 240, p: 23, c: 0, f: 16, fib: 0 } },

  // ============ PROTEINS — Red meat ============
  { match: /(ground\s*beef|beef\s*mince|minced\s*beef|hamburger\s*meat)/i, ref: { cal: 250, p: 26, c: 0, f: 17, fib: 0 } },
  { match: /(brisket|chuck\s*roast|short\s*rib)/i, ref: { cal: 290, p: 24, c: 0, f: 21, fib: 0 } },
  { match: /(steak|sirloin|ribeye|flank|skirt|tenderloin|filet|beef)/i, ref: { cal: 220, p: 27, c: 0, f: 12, fib: 0 } },
  { match: /(pork\s*chop|pork\s*loin|pork\s*tenderloin)/i, ref: { cal: 220, p: 27, c: 0, f: 12, fib: 0 } },
  { match: /(ground\s*pork|pork\s*mince)/i, ref: { cal: 270, p: 25, c: 0, f: 19, fib: 0 } },
  { match: /(bacon)/i, ref: { cal: 540, p: 37, c: 1.4, f: 42, fib: 0 } },
  { match: /(sausage|chorizo|kielbasa|bratwurst)/i, ref: { cal: 300, p: 17, c: 2, f: 25, fib: 0 } },
  { match: /(ham|prosciutto|pancetta)/i, ref: { cal: 145, p: 21, c: 1.5, f: 6, fib: 0 } },
  { match: /(lamb)/i, ref: { cal: 250, p: 25, c: 0, f: 16, fib: 0 } },
  { match: /pork/i, ref: { cal: 240, p: 26, c: 0, f: 14, fib: 0 } },

  // ============ PROTEINS — Seafood ============
  { match: /(salmon)/i, ref: { cal: 208, p: 22, c: 0, f: 13, fib: 0 } },
  { match: /(tuna\s*steak|fresh\s*tuna)/i, ref: { cal: 184, p: 30, c: 0, f: 6, fib: 0 } },
  { match: /(canned\s*tuna|tuna)/i, ref: { cal: 130, p: 28, c: 0, f: 1, fib: 0 } },
  { match: /(shrimp|prawn)/i, ref: { cal: 100, p: 20, c: 1, f: 1.5, fib: 0 } },
  { match: /(scallop)/i, ref: { cal: 110, p: 21, c: 5, f: 1, fib: 0 } },
  { match: /(cod|tilapia|white\s*fish|haddock|halibut|mahi|snapper|sole|flounder|bass)/i, ref: { cal: 100, p: 22, c: 0, f: 1, fib: 0 } },
  { match: /(trout|mackerel|sardine|anchovy)/i, ref: { cal: 200, p: 22, c: 0, f: 12, fib: 0 } },
  { match: /(crab|lobster)/i, ref: { cal: 90, p: 19, c: 0, f: 1, fib: 0 } },

  // ============ PROTEINS — Plant ============
  { match: /(tofu)/i, ref: { cal: 144, p: 17, c: 3, f: 9, fib: 2 } },
  { match: /(tempeh)/i, ref: { cal: 195, p: 20, c: 8, f: 11, fib: 0 } },
  { match: /(seitan)/i, ref: { cal: 140, p: 25, c: 6, f: 2, fib: 1 } },
  { match: /(edamame)/i, ref: { cal: 122, p: 11, c: 10, f: 5, fib: 5 } },
  { match: /(egg\s*white)/i, ref: { cal: 52, p: 11, c: 0.7, f: 0.2, fib: 0 } },
  { match: /(egg)/i, ref: { cal: 155, p: 13, c: 1, f: 11, fib: 0 } },

  // ============ LEGUMES ============
  { match: /(chickpea|garbanzo)/i, ref: { cal: 120, p: 7, c: 20, f: 2, fib: 7 } },
  { match: /(refried\s*bean)/i, ref: { cal: 110, p: 6, c: 18, f: 1.5, fib: 6 } },
  { match: /(black\s*bean|kidney\s*bean|pinto\s*bean|cannellini|navy\s*bean|white\s*bean|bean)/i, ref: { cal: 130, p: 8, c: 23, f: 0.5, fib: 7 } },
  { match: /(lentil|dal|daal|dahl)/i, ref: { cal: 116, p: 9, c: 20, f: 0.4, fib: 8 } },
  { match: /(split\s*pea|pea)/i, ref: { cal: 81, p: 5, c: 14, f: 0.4, fib: 5 } },
  { match: /(hummus)/i, ref: { cal: 170, p: 5, c: 14, f: 10, fib: 4 } },

  // ============ GRAINS / STARCHES ============
  { match: /(brown\s*rice|wild\s*rice)/i, ref: { cal: 123, p: 2.7, c: 26, f: 1, fib: 1.8 } },
  { match: /(jasmine|basmati|white\s*rice|rice)/i, ref: { cal: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4 } },
  { match: /(quinoa)/i, ref: { cal: 120, p: 4.4, c: 21, f: 1.9, fib: 2.8 } },
  { match: /(farro|barley|spelt)/i, ref: { cal: 130, p: 5, c: 26, f: 0.8, fib: 3.5 } },
  { match: /(orzo|risotto|arborio)/i, ref: { cal: 158, p: 6, c: 31, f: 1, fib: 1.8 } },
  { match: /(pasta|spaghetti|penne|noodle|linguine|fettuccine|rigatoni|macaroni|ramen|udon|soba|rice\s*noodle|vermicelli|lasagna)/i, ref: { cal: 158, p: 6, c: 31, f: 1, fib: 1.8 } },
  { match: /(couscous|bulgur|millet)/i, ref: { cal: 112, p: 3.8, c: 23, f: 0.2, fib: 1.4 } },
  { match: /(oat|oatmeal|granola)/i, ref: { cal: 70, p: 2.5, c: 12, f: 1.5, fib: 1.7 } },
  { match: /(sweet\s*potato|yam)/i, ref: { cal: 86, p: 1.6, c: 20, f: 0.1, fib: 3 } },
  { match: /(potato)/i, ref: { cal: 87, p: 2, c: 20, f: 0.1, fib: 1.8 } },
  { match: /(tortilla\s*chip|nacho|chip)/i, ref: { cal: 500, p: 7, c: 60, f: 25, fib: 4 } },
  { match: /(pita|naan|flatbread)/i, ref: { cal: 270, p: 9, c: 50, f: 3, fib: 2.5 } },
  { match: /(tortilla|wrap)/i, ref: { cal: 220, p: 6, c: 38, f: 5, fib: 2 } },
  { match: /(bagel|bun|roll|brioche)/i, ref: { cal: 280, p: 10, c: 53, f: 2, fib: 2 } },
  { match: /(bread|toast|baguette|sourdough)/i, ref: { cal: 265, p: 9, c: 49, f: 3, fib: 2.7 } },
  { match: /(corn|polenta)/i, ref: { cal: 96, p: 3.4, c: 21, f: 1.5, fib: 2.4 } },

  // ============ DAIRY ============
  { match: /(cottage\s*cheese)/i, ref: { cal: 98, p: 11, c: 3.4, f: 4.3, fib: 0 } },
  { match: /(ricotta)/i, ref: { cal: 174, p: 11, c: 3, f: 13, fib: 0 } },
  { match: /(cream\s*cheese)/i, ref: { cal: 342, p: 6, c: 4, f: 34, fib: 0 } },
  { match: /(cheddar|parmesan|mozzarella|feta|gouda|swiss|brie|provolone|monterey|pepper\s*jack|cheese)/i, ref: { cal: 380, p: 24, c: 2, f: 30, fib: 0 } },
  { match: /(greek\s*yogurt|skyr)/i, ref: { cal: 97, p: 9, c: 4, f: 5, fib: 0 } },
  { match: /(yogurt|yoghurt)/i, ref: { cal: 60, p: 4, c: 7, f: 1.5, fib: 0 } },
  { match: /(heavy\s*cream|whipping\s*cream|double\s*cream)/i, ref: { cal: 340, p: 2, c: 3, f: 36, fib: 0 } },
  { match: /(half\s*and\s*half|sour\s*cream|crème\s*fra[iî]che)/i, ref: { cal: 200, p: 3, c: 4, f: 20, fib: 0 } },
  { match: /(coconut\s*milk)/i, ref: { cal: 230, p: 2.3, c: 6, f: 24, fib: 2 } },
  { match: /(almond\s*milk|oat\s*milk|soy\s*milk)/i, ref: { cal: 40, p: 1, c: 3, f: 2, fib: 0.5 } },
  { match: /(milk)/i, ref: { cal: 60, p: 3.4, c: 5, f: 3.3, fib: 0 } },
  { match: /(butter|ghee)/i, ref: { cal: 717, p: 0.9, c: 0.1, f: 81, fib: 0 } },
  { match: /(cream)/i, ref: { cal: 340, p: 2, c: 3, f: 36, fib: 0 } },

  // ============ FATS & NUTS ============
  { match: /(olive\s*oil|vegetable\s*oil|canola|sesame\s*oil|coconut\s*oil|avocado\s*oil|oil)/i, ref: { cal: 884, p: 0, c: 0, f: 100, fib: 0 } },
  { match: /(mayonnaise|mayo|aioli)/i, ref: { cal: 680, p: 1, c: 0.6, f: 75, fib: 0 } },
  { match: /(pesto)/i, ref: { cal: 450, p: 5, c: 6, f: 45, fib: 1 } },
  { match: /(avocado|guacamole)/i, ref: { cal: 160, p: 2, c: 9, f: 15, fib: 7 } },
  { match: /(almond\s*butter|peanut\s*butter|nut\s*butter|tahini)/i, ref: { cal: 600, p: 22, c: 18, f: 50, fib: 6 } },
  { match: /(almond|cashew|peanut|walnut|pecan|pistachio|hazelnut|macadamia|nut)/i, ref: { cal: 580, p: 21, c: 20, f: 50, fib: 8 } },
  { match: /(seed|chia|flax|sesame|sunflower\s*seed|pumpkin\s*seed)/i, ref: { cal: 540, p: 20, c: 18, f: 45, fib: 12 } },
  { match: /(olive)/i, ref: { cal: 115, p: 0.8, c: 6, f: 11, fib: 3 } },

  // ============ VEGETABLES ============
  { match: /(spinach|kale|lettuce|arugula|chard|romaine|spring\s*mix|greens|herb|cilantro|parsley|basil|mint|dill)/i, ref: { cal: 23, p: 2.9, c: 3.6, f: 0.4, fib: 2.2 } },
  { match: /(broccoli|cauliflower|brussels|asparagus|green\s*bean)/i, ref: { cal: 35, p: 2.5, c: 7, f: 0.4, fib: 3 } },
  { match: /(tomato|salsa|marinara|pasta\s*sauce|tomato\s*sauce)/i, ref: { cal: 30, p: 1.3, c: 6, f: 0.4, fib: 1.8 } },
  { match: /(bell\s*pepper|pepper|jalape|chili|chile|serrano|poblano)/i, ref: { cal: 30, p: 1, c: 6, f: 0.3, fib: 2 } },
  { match: /(mushroom)/i, ref: { cal: 22, p: 3.1, c: 3.3, f: 0.3, fib: 1 } },
  { match: /(carrot)/i, ref: { cal: 41, p: 0.9, c: 10, f: 0.2, fib: 2.8 } },
  { match: /(zucchini|squash|eggplant|cucumber|celery|cabbage|bok\s*choy|leek)/i, ref: { cal: 25, p: 1.2, c: 5, f: 0.2, fib: 1.5 } },
  { match: /(onion|shallot|scallion|green\s*onion)/i, ref: { cal: 40, p: 1.1, c: 9, f: 0.1, fib: 1.7 } },
  { match: /(garlic|ginger)/i, ref: { cal: 80, p: 3, c: 18, f: 0.3, fib: 2 } },
  { match: /(veg|vegetable|stir\s*fry\s*mix|frozen\s*veg)/i, ref: { cal: 45, p: 2, c: 9, f: 0.3, fib: 2.5 } },

  // ============ FRUITS ============
  { match: /(banana)/i, ref: { cal: 89, p: 1.1, c: 23, f: 0.3, fib: 2.6 } },
  { match: /(apple|pear)/i, ref: { cal: 52, p: 0.3, c: 14, f: 0.2, fib: 2.4 } },
  { match: /(berry|berries|strawberry|blueberry|raspberry|blackberry)/i, ref: { cal: 50, p: 1, c: 12, f: 0.4, fib: 3 } },
  { match: /(orange|grapefruit|mandarin|clementine)/i, ref: { cal: 47, p: 0.9, c: 12, f: 0.1, fib: 2.4 } },
  { match: /(lemon|lime)/i, ref: { cal: 25, p: 0.5, c: 8, f: 0.2, fib: 2 } },
  { match: /(grape|cherry)/i, ref: { cal: 67, p: 0.6, c: 17, f: 0.2, fib: 1 } },
  { match: /(mango|pineapple|papaya|melon|watermelon|cantaloupe|peach|plum|apricot|nectarine|fruit)/i, ref: { cal: 55, p: 0.7, c: 14, f: 0.2, fib: 1.5 } },
  { match: /(raisin|date|dried\s*fruit|cranberry)/i, ref: { cal: 300, p: 2, c: 75, f: 0.5, fib: 5 } },

  // ============ SAUCES & SWEETENERS ============
  { match: /(honey|maple\s*syrup|syrup|sugar|brown\s*sugar|agave)/i, ref: { cal: 304, p: 0.3, c: 82, f: 0, fib: 0 } },
  { match: /(ketchup|bbq|barbecue|teriyaki|sweet\s*chili|hoisin)/i, ref: { cal: 110, p: 1, c: 26, f: 0.2, fib: 0.5 } },
  { match: /(soy\s*sauce|fish\s*sauce|hot\s*sauce|sriracha|vinegar|worcestershire|mustard)/i, ref: { cal: 30, p: 1.5, c: 5, f: 0.2, fib: 0 } },
  { match: /(curry\s*paste|harissa|gochujang|miso|tomato\s*paste)/i, ref: { cal: 100, p: 4, c: 18, f: 2, fib: 3 } },
  { match: /(stock|broth|bouillon)/i, ref: { cal: 6, p: 1, c: 0.5, f: 0.2, fib: 0 } },
  { match: /(salt|pepper|spice|seasoning|cumin|paprika|oregano|thyme|rosemary|cinnamon|turmeric|coriander|garam\s*masala|chili\s*powder)/i, ref: { cal: 250, p: 10, c: 50, f: 8, fib: 25 } },
  { match: /(flour|cornstarch|breadcrumb|panko)/i, ref: { cal: 360, p: 10, c: 76, f: 1, fib: 3 } },
];

const lookup = (name: string): Ref | null => {
  const n = (name || "").toLowerCase().trim();
  if (!n) return null;
  for (const { match, ref } of REF) if (match.test(n)) return ref;
  return null;
};

// Pull a serving-size hint like "(7.5 oz drained)", "drained 7 oz", "100g serving"
// out of a free-form name. Returns grams or null.
const extractInlineGrams = (raw: string): number | null => {
  if (!raw) return null;
  const s = raw.toLowerCase();
  // grams / kilograms
  const g = s.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams)\b/);
  if (g) return parseFloat(g[1]);
  const kg = s.match(/(\d+(?:\.\d+)?)\s*(kg|kilogram|kilograms)\b/);
  if (kg) return parseFloat(kg[1]) * 1000;
  // ounces / pounds
  const oz = s.match(/(\d+(?:\.\d+)?)\s*(oz|ounce|ounces)\b/);
  if (oz) return parseFloat(oz[1]) * 28.35;
  const lb = s.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds)\b/);
  if (lb) return parseFloat(lb[1]) * 453.6;
  return null;
};

// Convert (qty, unit, name) → grams. Returns 0 when we cannot estimate.
const toGrams = (qty: number, unit: string, name: string): number => {
  const u = (unit || "").toLowerCase().trim().replace(/\.$/, "");
  const n = (name || "").toLowerCase();

  // Direct mass
  if (/^(g|gr|gram|grams)$/.test(u)) return qty;
  if (/^(kg|kilogram|kilograms)$/.test(u)) return qty * 1000;
  if (/^(mg|milligram|milligrams)$/.test(u)) return qty / 1000;
  if (/^(oz|ounce|ounces)$/.test(u)) return qty * 28.35;
  if (/^(lb|lbs|pound|pounds)$/.test(u)) return qty * 453.6;

  // Volume → grams (water density default; oils/dairy close enough)
  if (/^(ml|milliliter|milliliters)$/.test(u)) return qty;
  if (/^(l|liter|liters|litre|litres)$/.test(u)) return qty * 1000;
  if (/^(fl\s*oz|fluid\s*ounce|fluid\s*ounces)$/.test(u)) return qty * 30;
  if (/^(cup|cups|c)$/.test(u)) {
    // Cup densities vary wildly — bias by ingredient
    if (/(rice|quinoa|couscous|bulgur|farro|barley|oat|granola)/.test(n)) return qty * 185;
    if (/(flour|cornstarch|breadcrumb|panko)/.test(n)) return qty * 125;
    if (/(sugar|brown\s*sugar)/.test(n)) return qty * 200;
    if (/(nut|almond|cashew|peanut|pecan|walnut|seed)/.test(n)) return qty * 140;
    if (/(berry|berries|chopped|diced|sliced|shredded)/.test(n)) return qty * 150;
    if (/(spinach|kale|lettuce|arugula|greens|herb)/.test(n)) return qty * 30;
    if (/(broccoli|cauliflower|cabbage)/.test(n)) return qty * 90;
    if (/(cheese|shredded\s*cheese|grated)/.test(n)) return qty * 110;
    return qty * 240; // liquid default
  }
  if (/^(pint|pt)$/.test(u)) return qty * 480;
  if (/^(quart|qt)$/.test(u)) return qty * 960;
  if (/^(gal|gallon|gallons)$/.test(u)) return qty * 3785;
  if (/^(tbsp|tbs|tablespoon|tablespoons|t)$/.test(u)) {
    if (/oil|butter|ghee|honey|syrup|sugar|salt|spice|seasoning/.test(n)) return qty * 14;
    return qty * 15;
  }
  if (/^(tsp|teaspoon|teaspoons)$/.test(u)) return qty * 5;
  if (/^(pinch|dash|sprig|sprigs)$/.test(u)) return qty * 0.5;
  if (/^(handful|handfuls|bunch|bunches)$/.test(u)) {
    if (/(spinach|kale|lettuce|greens|herb|cilantro|parsley|basil)/.test(n)) return qty * 30;
    return qty * 60;
  }

  // Count units — depend on the ingredient
  if (/^(piece|pieces|pc|pcs|whole|fillet|fillets|breast|breasts|thigh|thighs|leg|legs|drumstick|drumsticks|wing|wings|patty|patties|chop|chops|steak|steaks|cutlet|cutlets|link|links|strip|strips)$/.test(u)) {
    if (/chicken\s*breast/.test(n)) return qty * 170;
    if (/chicken\s*thigh/.test(n)) return qty * 110;
    if (/chicken\s*(drumstick|leg|wing)/.test(n)) return qty * 90;
    if (/(salmon|cod|tilapia|halibut|fish|fillet)/.test(n)) return qty * 150;
    if (/(steak|chop|patty|pork|beef|lamb)/.test(n)) return qty * 170;
    if (/(sausage|link|hot\s*dog|bratwurst)/.test(n)) return qty * 75;
    if (/bacon/.test(n)) return qty * 12; // per strip
    if (/shrimp|prawn|scallop/.test(n)) return qty * 15;
    if (/(egg)/.test(n)) return qty * 50;
    if (/(slice|bread|toast|bacon)/.test(n) || /(bread|toast)/.test(u)) return qty * 30;
    if (/(tortilla|pita|wrap|naan|flatbread)/.test(n)) return qty * 50;
    if (/(bagel|bun|roll|brioche)/.test(n)) return qty * 80;
    if (/(onion|tomato|pepper|potato|sweet\s*potato|avocado|apple|pear|orange|peach|mango|cucumber|zucchini|eggplant)/.test(n)) return qty * 130;
    if (/(carrot|banana)/.test(n)) return qty * 100;
    if (/(lemon|lime)/.test(n)) return qty * 60;
    if (/(garlic|clove|shallot)/.test(n)) return qty * 5;
    if (/(scallion|green\s*onion|spring\s*onion)/.test(n)) return qty * 15;
    if (/(berry|berries|grape|cherry|olive)/.test(n)) return qty * 5;
    return qty * 100; // generic
  }
  if (/^(slice|slices)$/.test(u)) {
    if (/(bread|toast|sourdough|baguette)/.test(n)) return qty * 30;
    if (/(cheese)/.test(n)) return qty * 25;
    if (/(bacon|prosciutto|ham)/.test(n)) return qty * 15;
    if (/(tomato|onion|cucumber|lemon|lime)/.test(n)) return qty * 20;
    return qty * 30;
  }
  if (/^(clove|cloves)$/.test(u)) return qty * 5;
  if (/^(can|cans|tin|tins)$/.test(u)) {
    // Standard 14-15 oz can; "drained" weight ≈ 240 g for legumes, 400 g liquid
    if (/(bean|chickpea|garbanzo|lentil|corn|tomato\s*(diced|crushed|whole))/.test(n)) return qty * 240;
    if (/(coconut\s*milk|stock|broth|tomato\s*sauce|tomato\s*paste)/.test(n)) return qty * 400;
    if (/(tuna|salmon|sardine|anchovy)/.test(n)) return qty * 140; // drained
    return qty * 240;
  }
  if (/^(jar|jars)$/.test(u)) return qty * 350;
  if (/^(bottle|bottles)$/.test(u)) return qty * 500;
  if (/^(packet|packets|pack|packs|sachet|envelope)$/.test(u)) {
    if (/(yeast|spice|seasoning|gravy|sauce\s*mix)/.test(n)) return qty * 10;
    return qty * 50;
  }
  if (/^(box|boxes|bag|bags)$/.test(u)) return qty * 400;
  if (/^(block|blocks)$/.test(u)) {
    if (/tofu/.test(n)) return qty * 396; // standard 14 oz block
    if (/cheese/.test(n)) return qty * 226; // 8 oz
    return qty * 200;
  }
  if (/^(stick|sticks)$/.test(u)) {
    if (/butter/.test(n)) return qty * 113;
    return qty * 50;
  }
  if (/^(head|heads)$/.test(u)) {
    if (/(garlic)/.test(n)) return qty * 50;
    if (/(lettuce|cabbage|cauliflower|broccoli)/.test(n)) return qty * 500;
    return qty * 300;
  }
  if (/^(stalk|stalks|rib|ribs)$/.test(u)) return qty * 40;
  if (/^(small)$/.test(u)) return qty * 80;
  if (/^(medium|med)$/.test(u)) return qty * 130;
  if (/^(large|lg)$/.test(u)) return qty * 180;
  if (/^(xl|extra\s*large)$/.test(u)) return qty * 220;
  if (/^(serving|servings|portion|portions)$/.test(u)) {
    // Try to extract from name (e.g., "chicken (1 serving = 4 oz)")
    return qty * 100;
  }

  if (!u) {
    // Bare numbers — assume "piece" semantics
    if (/(egg)/.test(n)) return qty * 50;
    if (/(garlic|clove)/.test(n)) return qty * 5;
    if (/(slice|toast|bread)/.test(n)) return qty * 30;
    return qty * 100;
  }
  return 0;
};

const parseQty = (q: unknown): number => {
  if (typeof q === "number" && isFinite(q)) return q;
  if (typeof q !== "string") return 0;
  let s = q.trim().toLowerCase();
  if (!s) return 0;
  // Strip common qualifiers
  s = s.replace(/\bapprox(?:imately)?\.?\b/g, "")
       .replace(/\babout\b/g, "")
       .replace(/\b(roughly|around|~)\b/g, "")
       .trim();
  // Unicode fractions
  const uni: Record<string, number> = {
    "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
    "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8,
    "⅙": 1 / 6, "⅚": 5 / 6, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
  };
  // Mixed unicode: "1 ½"
  const mixUni = s.match(/^(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
  if (mixUni) return parseInt(mixUni[1]) + uni[mixUni[2]];
  if (uni[s]) return uni[s];
  // Mixed fraction: "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  // Plain fraction: "1/2"
  const frac = s.match(/^(\d+)\/(\d+)/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  // Range: "1-2" → average
  const range = s.match(/^(\d+(?:\.\d+)?)\s*[-–to]+\s*(\d+(?:\.\d+)?)/);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  // First number
  const num = s.match(/(\d+(?:\.\d+)?)/);
  if (num) return parseFloat(num[1]);
  return 0;
};

export const computeMacrosFromIngredients = (
  ingredients: Ingredient[] | null | undefined,
  servings = 1,
): Macros => {
  const total: Macros = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  if (!Array.isArray(ingredients) || ingredients.length === 0 || servings <= 0) return total;

  for (const ing of ingredients) {
    const name = (ing?.name || "").toString();
    const ref = lookup(name);
    if (!ref) continue;
    // Prefer explicit qty+unit, then fall back to inline grams hidden in the name
    // (e.g., "canned chickpeas (7.5 oz drained)").
    let grams = 0;
    const qty = parseQty(ing?.quantity);
    if (qty > 0) {
      grams = toGrams(qty, (ing?.unit || "").toString(), name);
    }
    if (grams <= 0) {
      const fromName = extractInlineGrams(`${name} ${ing?.notes ?? ""} ${ing?.preparation ?? ""}`);
      if (fromName) grams = fromName;
    }
    if (grams <= 0) continue;
    // Sanity clamp: no single ingredient in a per-serving recipe should exceed ~2 kg.
    // This guards against AI hallucinations like "255850 g of mozzarella".
    if (grams > 2000) grams = 2000;
    const factor = grams / 100;
    total.calories += ref.cal * factor;
    total.protein_g += ref.p * factor;
    total.carbs_g += ref.c * factor;
    total.fat_g += ref.f * factor;
    total.fiber_g += ref.fib * factor;
  }

  return {
    calories: Math.round(total.calories / servings),
    protein_g: Math.round((total.protein_g / servings) * 10) / 10,
    carbs_g: Math.round((total.carbs_g / servings) * 10) / 10,
    fat_g: Math.round((total.fat_g / servings) * 10) / 10,
    fiber_g: Math.round((total.fiber_g / servings) * 10) / 10,
  };
};

/**
 * Reconcile AI-reported macros against a per-ingredient computation.
 * - If AI macros look reasonable (within tolerance), keep them.
 * - If AI macros are clearly wrong (>35% off on protein OR calories,
 *   when our computed value has at least 3 known ingredients), use our values.
 * Always treats the result as PER-SERVING. If `recipeServings > 1`, the
 * ingredient-derived totals are divided down to per-serving.
 */
export const normalizeMacros = (
  ai: Partial<Macros> | null | undefined,
  ingredients: Ingredient[] | null | undefined,
  recipeServings = 1,
): Macros => {
  const computed = computeMacrosFromIngredients(ingredients, recipeServings);
  const aiSafe: Macros = {
    calories: Number(ai?.calories) || 0,
    protein_g: Number(ai?.protein_g) || 0,
    carbs_g: Number(ai?.carbs_g) || 0,
    fat_g: Number(ai?.fat_g) || 0,
    fiber_g: Number(ai?.fiber_g) || 0,
  };

  const knownCount = (Array.isArray(ingredients) ? ingredients : []).filter(
    (i) => lookup((i?.name || "").toString()),
  ).length;

  // Not enough signal — keep AI values.
  if (knownCount < 3 || computed.calories === 0) return aiSafe;

  const proteinDiff = Math.abs(aiSafe.protein_g - computed.protein_g) / Math.max(computed.protein_g, 1);
  const calorieDiff = Math.abs(aiSafe.calories - computed.calories) / Math.max(computed.calories, 1);

  // AI is within 35% on both → trust AI (it may know recipe-specific cooking losses).
  if (proteinDiff <= 0.35 && calorieDiff <= 0.35) return aiSafe;

  // Otherwise correct toward the computed values, preferring the higher of the two
  // for protein (AI tends to under-report, never over-report meat-heavy meals).
  return {
    calories: Math.round((aiSafe.calories + computed.calories) / 2) || computed.calories,
    protein_g: Math.max(aiSafe.protein_g, computed.protein_g),
    carbs_g: Math.round(((aiSafe.carbs_g + computed.carbs_g) / 2) * 10) / 10 || computed.carbs_g,
    fat_g: Math.round(((aiSafe.fat_g + computed.fat_g) / 2) * 10) / 10 || computed.fat_g,
    fiber_g: Math.max(aiSafe.fiber_g, computed.fiber_g),
  };
};
