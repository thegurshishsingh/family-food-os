import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getHousehold from "./tools/get-household";
import getCurrentPlan from "./tools/get-current-plan";
import getGroceryList from "./tools/get-grocery-list";
import listSavedMeals from "./tools/list-saved-meals";
import searchSavedMeals from "./tools/search-saved-meals";

// The OAuth issuer MUST be the direct Supabase host built from the project ref.
// Vite inlines VITE_SUPABASE_PROJECT_ID as a literal at build time, so this stays
// import-safe (no runtime env read at module top level).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "family-food-os-mcp",
  title: "Family Food OS",
  version: "0.1.0",
  instructions:
    "Tools for Family Food OS, a weekly family dinner planning system. Use these to read the signed-in user's household profile, their current weekly dinner plan with per-serving nutrition, their grocery list, and their saved meal library.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getHousehold, getCurrentPlan, getGroceryList, listSavedMeals, searchSavedMeals],
});
