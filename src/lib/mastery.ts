/**
 * TinyQuest Learning Engine — mastery scoring.
 * Mastery is 0–100 per skill and is never shown to the child; parents see a
 * simple label instead. All maths happens on-device from the local profile.
 */
import type { SkillId } from "./content";
import { accuracy, skillOf, type Profile, type SkillStat } from "./profile";
import { GAMES, gamesForMode, type AgeMode, type CatalogGame } from "./catalog";

export type MasteryLabel = "Beginning" | "Practicing" | "Progressing" | "Strong" | "Mastered";

/**
 * Weighted accuracy, tempered by how much evidence we have, nudged by the
 * child's current difficulty level and pace, then clamped to 0–100.
 */
export function masteryScore(s: SkillStat): number {
  if (!s.attempts) return 0;
  const acc = accuracy(s) / 100;
  const confidence = Math.min(1, s.attempts / 12); // little evidence = cautious score
  const levelBonus = (s.level - 1) * 4;
  const pace = s.avgResponseMs && s.avgResponseMs < 4000 ? 3 : 0;
  const streakPenalty = s.streak <= -2 ? 6 : 0;
  return Math.max(0, Math.min(100, Math.round(acc * 85 * confidence + levelBonus + pace - streakPenalty)));
}

export function masteryLabel(score: number): MasteryLabel {
  if (score >= 85) return "Mastered";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Progressing";
  if (score >= 25) return "Practicing";
  return "Beginning";
}

export function skillMastery(p: Profile, skill: SkillId) {
  const s = skillOf(p, skill);
  const score = masteryScore(s);
  return { skill, stat: s, score, label: masteryLabel(score) };
}

export const TRACKED_SKILLS: SkillId[] = [
  "letters",
  "phonics",
  "numbers",
  "colors",
  "shapes",
  "words",
  "memory",
  "puzzles",
  "tracing",
  "wordsearch",
];

export function masteryTable(p: Profile) {
  return TRACKED_SKILLS.map((s) => skillMastery(p, s));
}

/** Age mode inferred from the child's age unless a parent picked one. */
export function modeForAge(age: number): AgeMode {
  if (age <= 3) return "explorer";
  if (age <= 4) return "learner";
  return "reader";
}

export function activeMode(p: Profile): AgeMode {
  return (p.ageMode as AgeMode | undefined) ?? modeForAge(p.age);
}

/**
 * Home recommendations: 1 focus (weakest skill), 2 reinforcement,
 * 1 fun, 1 puzzle, 1 vocabulary — avoiding the exact same activity twice.
 */
export function recommendedGames(p: Profile, count = 3): CatalogGame[] {
  const pool = gamesForMode(activeMode(p), p.premium);
  const scores = new Map(TRACKED_SKILLS.map((s) => [s, masteryScore(skillOf(p, s))]));
  const recent = p.recentGames ?? [];

  const ranked = [...pool].sort((a, b) => {
    const sa = scores.get(a.skill) ?? 0;
    const sb = scores.get(b.skill) ?? 0;
    const ra = recent.includes(a.id) ? 40 : 0;
    const rb = recent.includes(b.id) ? 40 : 0;
    return sa + ra - (sb + rb);
  });

  const chosen: CatalogGame[] = [];
  for (const g of ranked) {
    if (chosen.length >= count) break;
    if (chosen.some((c) => c.skill === g.skill && chosen.length < count - 1)) continue;
    chosen.push(g);
  }
  return chosen.length ? chosen : pool.slice(0, count);
}

/**
 * Daily Adventure: alphabet, numbers, vocabulary, a puzzle, plus reinforcement
 * of the weakest skill. Skills below 70 mastery come first; if everything is
 * above 85 we favour variety instead.
 */
export function dailyAdventure(p: Profile): CatalogGame[] {
  const pool = gamesForMode(activeMode(p), p.premium);
  const scores = new Map(TRACKED_SKILLS.map((s) => [s, masteryScore(skillOf(p, s))]));
  const bySkill = (skill: SkillId) => {
    const list = pool.filter((g) => g.skill === skill);
    if (!list.length) return undefined;
    return list[Math.floor(Math.random() * list.length)];
  };

  const plan: (CatalogGame | undefined)[] = [
    bySkill("letters"),
    bySkill("numbers"),
    bySkill("words") ?? bySkill("phonics"),
    bySkill("puzzles") ?? bySkill("memory"),
  ];

  const weakest = [...(scores.entries() as Iterable<[SkillId, number]>)]
    .filter(([, v]) => v < 70)
    .sort((a, b) => a[1] - b[1])[0];
  plan.push(weakest ? bySkill(weakest[0]) ?? bySkill("colors") : bySkill("shapes") ?? bySkill("colors"));

  const seen = new Set<string>();
  const out = plan.filter((g): g is CatalogGame => {
    if (!g || seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
  return out.length ? out : pool.slice(0, 5);
}

/** Plain-language weekly summary for the parent dashboard. No claims, no diagnoses. */
export function weeklyReport(p: Profile) {
  const week = p.days.slice(-7);
  const minutes = week.reduce((n, d) => n + d.minutes, 0);
  const games = week.reduce((n, d) => n + d.games, 0);
  const table = masteryTable(p).filter((m) => m.stat.attempts > 0);
  const strong = table.filter((m) => m.score >= 70).map((m) => m.skill);
  const practice = table.filter((m) => m.score < 50).map((m) => m.skill);
  const letters = skillOf(p, "letters").mastered.length;

  const lines: string[] = [];
  if (games) lines.push(`This week your child played ${games} activities for about ${minutes} minutes.`);
  else lines.push("No activities yet this week — a five minute adventure is a lovely place to start.");
  if (letters) lines.push(`${letters} letters recognised so far.`);
  if (strong.length) lines.push(`Going strongly: ${strong.join(", ")}.`);
  if (practice.length) lines.push(`A little more practice would help: ${practice.join(", ")}.`);
  return { minutes, games, lines, recommended: recommendedGames(p, 3) };
}

export const gameCountForMode = (p: Profile) => gamesForMode(activeMode(p), p.premium).length;
export const TOTAL_GAMES = GAMES.length;
