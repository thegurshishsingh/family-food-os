/**
 * Human reward translations — turn saved minutes into emotionally meaningful outcomes.
 */

export type HumanReward = {
  emoji: string;
  text: string;
};

const REWARDS: { threshold: number; emoji: string; text: string }[] = [
  { threshold: 120, emoji: "🎬", text: "Enough time for a family movie night" },
  { threshold: 90, emoji: "📖", text: "Enough time for a long bedtime story and a calm evening" },
  { threshold: 75, emoji: "🍳", text: "Enough time to cook a special weekend breakfast together" },
  { threshold: 60, emoji: "🌳", text: "Enough time for a family walk in the park" },
  { threshold: 45, emoji: "🧩", text: "Enough time for a family game night" },
  { threshold: 30, emoji: "🛁", text: "Enough time for 4 calmer bedtimes" },
  { threshold: 20, emoji: "☕", text: "Enough time for a quiet cup of coffee—uninterrupted" },
  { threshold: 10, emoji: "😌", text: "Enough time to avoid a last-minute dinner scramble" },
];

const SCRAMBLE_REWARDS: { threshold: number; emoji: string; text: string }[] = [
  { threshold: 7, emoji: "🚫", text: "Enough to avoid 7 \"what's for dinner?\" panics" },
  { threshold: 5, emoji: "🚫", text: "Enough to avoid 5 last-minute dinner scrambles" },
  { threshold: 3, emoji: "🚫", text: "Enough to skip 3 stressful dinner decisions" },
];

/**
 * Returns 2 human rewards based on minutes saved.
 */
export function getHumanRewards(minutesSaved: number, plannedNights: number): HumanReward[] {
  const results: HumanReward[] = [];

  // Primary reward based on time
  const primary = REWARDS.find(r => minutesSaved >= r.threshold);
  if (primary) results.push({ emoji: primary.emoji, text: primary.text });

  // Secondary reward based on scrambles avoided
  const scramble = SCRAMBLE_REWARDS.find(r => plannedNights >= r.threshold);
  if (scramble) results.push({ emoji: scramble.emoji, text: scramble.text });

  // Fallback if we only have 1
  if (results.length < 2 && minutesSaved >= 15) {
    results.push({ emoji: "✨", text: "Less stress, more presence with your family" });
  }

  return results.slice(0, 2);
}

/**
 * Get cumulative message for total hours saved.
 */
export function getCumulativeMessage(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  if (hours >= 100) return "That's more than four full days reclaimed for your family.";
  if (hours >= 48) return "That's a full weekend—twice over—given back to your family.";
  if (hours >= 24) return "That's a full day back in your family's life.";
  if (hours >= 16) return "That's nearly a full weekend back.";
  if (hours >= 8) return "That's more than a full workday of food-planning stress avoided.";
  if (hours >= 4) return "That's half a workday of planning you didn't have to do.";
  if (hours >= 2) return "That's a couple of hours your family spent on what matters.";
  return "Every minute counts—and it compounds from here.";
}

/**
 * Get projected yearly savings.
 */
export function getYearlyProjection(avgMinutesPerWeek: number): string {
  const yearlyHours = (avgMinutesPerWeek * 52) / 60;
  return `${Math.round(yearlyHours)} hours`;
}
