/**
 * Local-first child learning profile + adaptive difficulty engine.
 * Nothing here ever leaves the device: it is stored in localStorage only.
 */
import { useCallback, useEffect, useState } from "react";
import type { SkillId } from "./content";
import { setLang, type Lang } from "./i18n";

const KEY = "totland.profile.v1";

export interface SkillStat {
  attempts: number;
  correct: number;
  level: number; // 1..5
  streak: number;
  mastered: string[]; // e.g. letters/numbers recognised
  avgResponseMs: number;
}

export interface DayStat {
  date: string;
  minutes: number;
  games: number;
}

export interface GameStat {
  plays: number;
  stars: number;
  bestAccuracy: number;
  lastPlayed: string;
}

export interface Profile {
  childName: string;
  age: number;
  /** UI + narration language, chosen by a grown-up */
  language: Lang;
  /** set once by a grown-up at first launch */
  ageMode: "explorer" | "learner" | "reader" | null;
  characterId: string | null;
  outfit: string;
  avatarBg: string;
  onboarded: boolean;
  narration: boolean;
  sfx: boolean;
  music: boolean;
  /** 0–1 fine-tuning of background music loudness (1 = default soft level) */
  musicVolume: number;
  reducedMotion: boolean;
  highContrast: boolean;
  premium: boolean;
  stars: number;
  stickers: string[];
  badges: string[];
  companions: string[];
  gamesCompleted: number;
  skills: Record<string, SkillStat>;
  games: Record<string, GameStat>;
  days: DayStat[];
  favorites: Record<string, number>;
  recent: string[];
  lastAdventure?: string;
}


export const emptySkill = (): SkillStat => ({
  attempts: 0,
  correct: 0,
  level: 1,
  streak: 0,
  mastered: [],
  avgResponseMs: 0,
});

export const defaultProfile = (): Profile => ({
  childName: "Friend",
  age: 4,
  language: "en",
  ageMode: null,
  characterId: null,
  outfit: "🎒",
  avatarBg: "moss",
  onboarded: false,
  narration: true,
  sfx: true,
  music: true,
  musicVolume: 0.5,
  reducedMotion: false,
  highContrast: false,
  premium: false,
  stars: 0,
  stickers: [],
  badges: [],
  companions: [],
  gamesCompleted: 0,
  skills: {},
  games: {},
  days: [],
  favorites: {},
  recent: [],
});


export function loadProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    const p = { ...defaultProfile(), ...JSON.parse(raw) } as Profile;
    setLang(p.language);
    return p;
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  setLang(p.language);
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("totland:profile"));
}

const today = () => new Date().toISOString().slice(0, 10);

export function skillOf(p: Profile, skill: SkillId): SkillStat {
  return p.skills[skill] ?? emptySkill();
}

export function accuracy(s: SkillStat) {
  return s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
}

export interface AnswerEvent {
  skill: SkillId;
  correct: boolean;
  responseMs: number;
  itemId?: string;
}

/**
 * Adaptive engine: three correct in a row levels up, two misses levels down.
 * Difficulty never drops below 1 and mistakes are never penalised in stars.
 */
export function recordAnswer(p: Profile, e: AnswerEvent): Profile {
  const s = { ...skillOf(p, e.skill) };
  s.attempts += 1;
  s.avgResponseMs = Math.round((s.avgResponseMs * (s.attempts - 1) + e.responseMs) / s.attempts);

  if (e.correct) {
    s.correct += 1;
    s.streak = s.streak > 0 ? s.streak + 1 : 1;
    if (e.itemId && !s.mastered.includes(e.itemId) && s.streak >= 2) s.mastered = [...s.mastered, e.itemId];
    if (s.streak >= 3 && s.level < 5) {
      s.level += 1;
      s.streak = 0;
    }
  } else {
    s.streak = s.streak < 0 ? s.streak - 1 : -1;
    if (s.streak <= -2 && s.level > 1) {
      s.level -= 1;
      s.streak = 0;
    }
  }

  return { ...p, skills: { ...p.skills, [e.skill]: s } };
}

export function recordGameComplete(p: Profile, skill: SkillId, stars: number, minutes = 1): Profile {
  const d = today();
  const days = [...p.days];
  const i = days.findIndex((x) => x.date === d);
  const existing = i >= 0 ? days[i]! : null;
  if (existing) days[i] = { date: existing.date, minutes: existing.minutes + minutes, games: existing.games + 1 };
  else days.push({ date: d, minutes, games: 1 });

  const stickers = [...p.stickers];
  return {
    ...p,
    stars: p.stars + stars,
    gamesCompleted: p.gamesCompleted + 1,
    days: days.slice(-30),
    favorites: { ...p.favorites, [skill]: (p.favorites[skill] ?? 0) + 1 },
    stickers,
  };
}

export function awardSticker(p: Profile, sticker: string): Profile {
  if (p.stickers.includes(sticker)) return p;
  return { ...p, stickers: [...p.stickers, sticker] };
}

/** Suggests what the child should practise next. */
export function recommendations(p: Profile): { skill: SkillId; reason: string }[] {
  const all = Object.entries(p.skills) as [SkillId, SkillStat][];
  if (all.length === 0)
    return [
      { skill: "letters", reason: "A great first step" },
      { skill: "numbers", reason: "Counting to 10" },
    ];
  const weak = all
    .filter(([, s]) => s.attempts >= 3)
    .sort((a, b) => accuracy(a[1]) - accuracy(b[1]))
    .slice(0, 2)
    .map(([skill, s]) => ({ skill, reason: `${accuracy(s)}% so far — more practice helps` }));
  return weak.length ? weak : [{ skill: "words", reason: "Ready for new vocabulary" }];
}

export function strengths(p: Profile) {
  return (Object.entries(p.skills) as [SkillId, SkillStat][])
    .filter(([, s]) => s.attempts >= 3 && accuracy(s) >= 80)
    .map(([skill]) => skill);
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
    const sync = () => setProfile(loadProfile());
    window.addEventListener("totland:profile", sync);
    return () => window.removeEventListener("totland:profile", sync);
  }, []);

  const update = useCallback((fn: (p: Profile) => Profile) => {
    setProfile((prev) => {
      const next = fn(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  return { profile, update, hydrated };
}

/* ------------------------------------------------------------------ *
 * Learning engine — mastery scoring (0–100, shown to grown-ups only)
 * ------------------------------------------------------------------ */

export function masteryScore(s: SkillStat): number {
  if (!s.attempts) return 0;
  const acc = s.correct / s.attempts;
  const volume = Math.min(1, s.attempts / 20);
  const speed = s.avgResponseMs ? Math.max(0, Math.min(1, 6000 / s.avgResponseMs)) : 0.5;
  const levelBoost = (s.level - 1) / 4;
  return Math.max(0, Math.min(100, Math.round(acc * 70 + volume * 15 + speed * 5 + levelBoost * 10)));
}

export type MasteryLabel = "Beginning" | "Practicing" | "Progressing" | "Strong" | "Mastered";

export function masteryLabel(score: number): MasteryLabel {
  if (score >= 90) return "Mastered";
  if (score >= 75) return "Strong";
  if (score >= 55) return "Progressing";
  if (score >= 30) return "Practicing";
  return "Beginning";
}

export function skillMastery(p: Profile, skill: SkillId): number {
  return masteryScore(skillOf(p, skill));
}

/** Per-game session record — powers history and recommendations. */
export function recordSession(
  p: Profile,
  gameId: string,
  data: { stars: number; accuracy: number; minutes: number },
): Profile {
  const prev = p.games[gameId] ?? { plays: 0, stars: 0, bestAccuracy: 0, lastPlayed: "" };
  const recent = [gameId, ...(p.recent ?? []).filter((g) => g !== gameId)].slice(0, 12);
  return {
    ...p,
    recent,
    games: {
      ...p.games,
      [gameId]: {
        plays: prev.plays + 1,
        stars: prev.stars + data.stars,
        bestAccuracy: Math.max(prev.bestAccuracy, Math.round(data.accuracy * 100)),
        lastPlayed: new Date().toISOString(),
      },
    },
  };
}

export function awardBadge(p: Profile, badge: string): Profile {
  return (p.badges ?? []).includes(badge) ? p : { ...p, badges: [...(p.badges ?? []), badge] };
}

export function awardCompanion(p: Profile, companion: string): Profile {
  return (p.companions ?? []).includes(companion)
    ? p
    : { ...p, companions: [...(p.companions ?? []), companion] };
}

/** Badges are earned by playing, never bought. */
export function checkBadges(p: Profile): Profile {
  let next = p;
  if (p.gamesCompleted >= 1) next = awardBadge(next, "First Steps");
  if (p.gamesCompleted >= 10) next = awardBadge(next, "Ten Games");
  if (p.gamesCompleted >= 50) next = awardBadge(next, "Big Explorer");
  if (p.stars >= 25) next = awardBadge(next, "Star Collector");
  if (p.stickers.length >= 10) next = awardCompanion(next, "🐢");
  if (p.stars >= 60) next = awardCompanion(next, "🦜");
  return next;
}
