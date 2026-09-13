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
  /** ids of Word Find puzzles the child has completed */
  wordFinds?: string[];
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


/* ------------------------------------------------------------------ *
 * Family store — several children under one account.
 * Sound/language/premium settings are shared by the whole family;
 * stars, stickers, badges and skill stats belong to each child.
 * ------------------------------------------------------------------ */

const FAMILY_KEY = "totland.family.v1";

const SHARED_KEYS = [
  "language",
  "narration",
  "sfx",
  "music",
  "musicVolume",
  "reducedMotion",
  "highContrast",
  "premium",
  "onboarded",
] as const;

type SharedKey = (typeof SHARED_KEYS)[number];
export type SharedSettings = Pick<Profile, SharedKey>;

export interface ChildRecord {
  id: string;
  profile: Profile;
  /** ISO timestamp of the last local change — used to resolve sync conflicts */
  updatedAt: string;
  /** set when the child has local changes not yet pushed to the account */
  dirty: boolean;
  /** true once the child has been removed locally and needs deleting remotely */
  deleted?: boolean;
}

export interface Family {
  activeChildId: string | null;
  children: ChildRecord[];
  settings: SharedSettings;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

const sharedOf = (p: Profile): SharedSettings =>
  Object.fromEntries(SHARED_KEYS.map((k) => [k, p[k]])) as SharedSettings;

export function makeChild(name = "Friend", age = 4): ChildRecord {
  return {
    id: newId(),
    profile: { ...defaultProfile(), childName: name, age },
    updatedAt: new Date().toISOString(),
    dirty: true,
  };
}

function emptyFamily(): Family {
  const first = makeChild();
  return { activeChildId: first.id, children: [first], settings: sharedOf(defaultProfile()) };
}

export function loadFamily(): Family {
  if (typeof window === "undefined") return emptyFamily();
  try {
    const raw = window.localStorage.getItem(FAMILY_KEY);
    if (raw) {
      const f = JSON.parse(raw) as Family;
      if (f && Array.isArray(f.children) && f.children.length) {
        f.settings = { ...sharedOf(defaultProfile()), ...f.settings };
        if (!f.children.some((c) => c.id === f.activeChildId)) f.activeChildId = f.children[0]!.id;
        return f;
      }
    }
    // One-time migration from the older single-child store.
    const legacy = window.localStorage.getItem(KEY);
    if (legacy) {
      const p = { ...defaultProfile(), ...JSON.parse(legacy) } as Profile;
      const child: ChildRecord = { id: newId(), profile: p, updatedAt: new Date().toISOString(), dirty: true };
      const family: Family = { activeChildId: child.id, children: [child], settings: sharedOf(p) };
      saveFamily(family);
      return family;
    }
  } catch {
    /* fall through to a fresh family */
  }
  return emptyFamily();
}

export function saveFamily(f: Family) {
  if (typeof window === "undefined") return;
  setLang(f.settings.language);
  window.localStorage.setItem(FAMILY_KEY, JSON.stringify(f));
  window.dispatchEvent(new CustomEvent("totland:profile"));
}

export function activeChild(f: Family): ChildRecord {
  const visible = f.children.filter((c) => !c.deleted);
  return visible.find((c) => c.id === f.activeChildId) ?? visible[0] ?? makeChild();
}

/** The profile the child screens use: their own progress + family settings. */
export function profileOf(f: Family, child: ChildRecord): Profile {
  return { ...child.profile, ...f.settings };
}

export function loadProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile();
  const f = loadFamily();
  return profileOf(f, activeChild(f));
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  const f = loadFamily();
  const child = activeChild(f);
  const rest = { ...p };
  for (const k of SHARED_KEYS) delete (rest as Record<string, unknown>)[k];
  const next: Family = {
    ...f,
    activeChildId: child.id,
    settings: sharedOf(p),
    children: f.children.map((c) =>
      c.id === child.id
        ? { ...c, profile: { ...c.profile, ...rest }, updatedAt: new Date().toISOString(), dirty: true }
        : c,
    ),
  };
  if (!next.children.some((c) => c.id === child.id)) next.children = [...next.children, { ...child, dirty: true }];
  saveFamily(next);
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

  // Saving broadcasts to every other screen, so it must happen after the render
  // that produced the new profile — never inside the state updater.
  const pending = useRef<Profile | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    const next = pending.current;
    pending.current = null;
    saveProfile(next);
  });

  const update = useCallback((fn: (p: Profile) => Profile) => {
    setProfile((prev) => {
      const next = fn(prev);
      pending.current = next;
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

/* ------------------------------------------------------------------ *
 * Family helpers + hook (grown-up screens)
 * ------------------------------------------------------------------ */

export function addChild(name: string, age: number, outfit = "🎒", avatarBg = "moss"): ChildRecord {
  const f = loadFamily();
  const child = makeChild(name || "Friend", age);
  child.profile = { ...child.profile, outfit, avatarBg, ...f.settings };
  saveFamily({ ...f, children: [...f.children, child], activeChildId: f.activeChildId ?? child.id });
  return child;
}

export function updateChild(id: string, fn: (p: Profile) => Profile) {
  const f = loadFamily();
  saveFamily({
    ...f,
    children: f.children.map((c) =>
      c.id === id ? { ...c, profile: fn(c.profile), updatedAt: new Date().toISOString(), dirty: true } : c,
    ),
  });
}

export function removeChild(id: string) {
  const f = loadFamily();
  const children = f.children.map((c) => (c.id === id ? { ...c, deleted: true, dirty: true } : c));
  const remaining = children.filter((c) => !c.deleted);
  saveFamily({
    ...f,
    children,
    activeChildId: f.activeChildId === id ? (remaining[0]?.id ?? null) : f.activeChildId,
  });
}

export function setActiveChild(id: string) {
  const f = loadFamily();
  if (!f.children.some((c) => c.id === id && !c.deleted)) return;
  saveFamily({ ...f, activeChildId: id });
}

export function useFamily() {
  const [family, setFamily] = useState<Family | null>(null);

  useEffect(() => {
    setFamily(loadFamily());
    const sync = () => setFamily(loadFamily());
    window.addEventListener("totland:profile", sync);
    return () => window.removeEventListener("totland:profile", sync);
  }, []);

  const children = (family?.children ?? []).filter((c) => !c.deleted);
  return { family, children, activeId: family?.activeChildId ?? null, hydrated: family !== null };
}
