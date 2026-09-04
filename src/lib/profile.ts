/**
 * Local-first child learning profile + adaptive difficulty engine.
 * Nothing here ever leaves the device: it is stored in localStorage only.
 */
import { useCallback, useEffect, useState } from "react";
import type { SkillId } from "./content";

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

export interface Profile {
  childName: string;
  age: number;
  narration: boolean;
  sfx: boolean;
  music: boolean;
  reducedMotion: boolean;
  premium: boolean;
  stars: number;
  stickers: string[];
  gamesCompleted: number;
  skills: Record<string, SkillStat>;
  days: DayStat[];
  favorites: Record<string, number>;
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
  narration: true,
  sfx: true,
  music: false,
  reducedMotion: false,
  premium: false,
  stars: 0,
  stickers: [],
  gamesCompleted: 0,
  skills: {},
  days: [],
  favorites: {},
});

export function loadProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    return { ...defaultProfile(), ...JSON.parse(raw) } as Profile;
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
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
  if (i >= 0) days[i] = { ...days[i], minutes: days[i].minutes + minutes, games: days[i].games + 1 };
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
