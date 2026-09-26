import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AREAS, LETTERS, LIBRARY_SIZE } from "@/lib/content";
import {
  masteryLabel,
  masteryScore,
  recommendations,
  skillOf,
  strengths,
  updateChild,
  useFamily,
  useProfile,
  tracingProgressOf,
} from "@/lib/profile";
import { setNarration } from "@/lib/speech";
import { previewMusic, setMusic, setMusicVolume } from "@/lib/music";
import { setLang, type Lang } from "@/lib/i18n";
import { FREE_WORD_FINDS, WORD_FIND_THEMES } from "@/lib/wordfinds";


export const Route = createFileRoute("/parent/")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — Totland" },
      { name: "description", content: "See letters and numbers mastered, time spent learning, strengths, and recommended next activities." },
      { property: "og:title", content: "Parent Dashboard — Totland" },
      { property: "og:description", content: "Private, on-device progress tracking for your child's early learning." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, update } = useProfile();
  const { children, activeId } = useFamily();
  const [selId, setSelId] = useState<string | null>(null);
  const selected = children.find((c) => c.id === (selId ?? activeId)) ?? children[0] ?? null;
  const stats = selected ? selected.profile : profile;
  const letters = skillOf(stats, "letters");
  const numbers = skillOf(stats, "numbers");
  const sevenDayDates = new Set(
    Array.from({ length: 7 }, (_, offset) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - offset);
      return date.toISOString().slice(0, 10);
    }),
  );
  const thisWeek = stats.days
    .filter((day) => sevenDayDates.has(day.date))
    .reduce(
      (totals, day) => ({ minutes: totals.minutes + day.minutes, games: totals.games + day.games }),
      { minutes: 0, games: 0 },
    );
  const totalAttempts = Object.values(stats.skills).reduce((n, s) => n + s.attempts, 0);
  const totalCorrect = Object.values(stats.skills).reduce((n, s) => n + s.correct, 0);
  const overall = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const wordFindsDone = (stats.wordFinds ?? []).length;
  const traced = tracingProgressOf(stats);


  // Live music preview so the volume slider is audible while adjusting it.
  useEffect(() => {
    if (profile.music) previewMusic(true);
    return () => previewMusic(false);
  }, [profile.music]);

  return (
    <div className="space-y-4">
      <h1 className="px-1 font-ui text-2xl font-bold text-ink">Parent Dashboard</h1>
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelId(c.id)}
              className={`shrink-0 rounded-xl px-4 py-2 font-ui text-sm font-semibold ${
                selected?.id === c.id ? "bg-night text-cream" : "bg-card text-ink"
              }`}
            >
              {c.profile.outfit} {c.profile.childName}
              {c.id === activeId ? " · playing" : ""}
            </button>
          ))}
        </div>
      )}
      <section className="rounded-3xl bg-night p-5 text-cream wood-block">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold">This week</p>
          <p className="text-sm text-cream/50">
            {stats.childName} · age {stats.age}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Time", value: `${thisWeek.minutes}m` },
            { label: "Games", value: thisWeek.games },
            { label: "All-time accuracy", value: `${overall}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-cream/5 p-3 ring-1 ring-cream/10">
              <p className="text-[11px] text-cream/50">{s.label}</p>
              <p className="text-lg font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cream/70">Letters mastered</span>
            <span className="font-semibold">{letters.mastered.length} / 26</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream/10">
            <div className="h-full rounded-full bg-moss" style={{ width: `${(letters.mastered.length / 26) * 100}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {LETTERS.map((l) => (
              <span
                key={l}
                className={`grid size-6 place-items-center rounded-md text-[11px] font-semibold ${
                  letters.mastered.includes(l) ? "bg-moss/25 text-moss" : "bg-cream/10 text-cream/40"
                }`}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cream/70">Letters traced</span>
            <span className="font-semibold">{traced.uppercase.length} / 26 uppercase · {traced.lowercase.length} / 26 lowercase</span>
          </div>
          <div className="mt-2 grid grid-cols-13 gap-1 max-sm:grid-cols-9">
            {LETTERS.map((letter) => {
              const upper = traced.uppercase.includes(letter);
              const lower = traced.lowercase.includes(letter);
              return (
                <span key={letter} className="grid min-h-10 place-items-center rounded-md bg-cream/10 px-0.5 text-[10px] font-semibold" aria-label={`${letter}: uppercase ${upper ? "traced" : "not traced"}, lowercase ${lower ? "traced" : "not traced"}`}>
                  <span className={upper ? "text-moss" : "text-cream/35"}>{letter}</span>
                  <span className={lower ? "text-sky" : "text-cream/35"}>{letter.toLowerCase()}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cream/70">Numbers recognised</span>
            <span className="font-semibold">{numbers.mastered.length} / 20</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream/10">
            <div className="h-full rounded-full bg-sky" style={{ width: `${(numbers.mastered.length / 20) * 100}%` }} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {strengths(stats).map((s) => (
            <span key={s} className="rounded-full bg-moss/15 px-2.5 py-1 text-[11px] font-medium text-moss">
              Strength · {s}
            </span>
          ))}
          {recommendations(stats).map((r) => (
            <span key={r.skill} className="rounded-full bg-sky/15 px-2.5 py-1 text-[11px] font-medium text-sky">
              Practice · {r.skill}
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium text-cream/60">Recommended next</p>
        {recommendations(stats).map((r) => (
          <Link
            key={r.skill}
            to="/play/$area"
            params={{ area: r.skill }}
            className="mt-2 flex items-center justify-between rounded-xl bg-cream/5 px-3 py-2.5 ring-1 ring-cream/10"
          >
            <span className="text-[13px] font-medium text-cream/90">
              {AREAS.find((a) => a.id === r.skill)?.title} — {r.reason}
            </span>
            <span className="text-xs font-semibold text-sky">Open</span>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Per-area mastery</h2>
        <div className="mt-3 space-y-2">
          {AREAS.map((a) => {
            const s = skillOf(stats, a.id);
            const mastery = masteryScore(s);
            return (
              <div key={a.id} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-sm font-medium text-ink">
                  {a.emoji} {a.title}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-felt">
                  <div className="h-full rounded-full bg-clay" style={{ width: `${mastery}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right text-xs font-semibold text-inksoft">
                  {masteryLabel(mastery)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm font-medium text-ink">
            <span>🔍 Word Finds completed</span>
            <span className="text-xs text-inksoft">
              {wordFindsDone} / {WORD_FIND_THEMES.length}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-felt">
            <div
              className="h-full rounded-full bg-sky"
              style={{ width: `${(wordFindsDone / WORD_FIND_THEMES.length) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-inksoft">
            The first {FREE_WORD_FINDS} puzzles are free and can be replayed; the rest unlock with Premium.
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Settings</h2>
        <div className="mt-3 space-y-3">
          <label className="flex items-center justify-between text-sm font-medium text-ink">
            Child's name
            <input
              value={stats.childName}
              onChange={(e) =>
                selected
                  ? updateChild(selected.id, (p) => ({ ...p, childName: e.target.value }))
                  : update((p) => ({ ...p, childName: e.target.value }))
              }
              className="w-44 rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
            />
          </label>
          <label className="flex items-center justify-between text-sm font-medium text-ink">
            Age
            <input
              type="number"
              min={2}
              max={6}
              value={stats.age}
              onChange={(e) =>
                selected
                  ? updateChild(selected.id, (p) => ({ ...p, age: Number(e.target.value) }))
                  : update((p) => ({ ...p, age: Number(e.target.value) }))
              }
              className="w-44 rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
            />
          </label>

          <div className="flex items-center justify-between text-sm font-medium text-ink">
            App language
            <div className="flex gap-2">
              {(
                [
                  ["en", "English"],
                  ["es", "Español"],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLang(code as Lang);
                    update((p) => ({ ...p, language: code as Lang }));
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-border ${
                    profile.language === code ? "bg-clay text-primary-foreground" : "bg-felt text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {(
            [
              ["narration", "Voice narration"],
              ["sfx", "Sound effects"],
              ["music", "Background music"],
              ["reducedMotion", "Reduced motion"],
              ["highContrast", "High contrast"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between text-sm font-medium text-ink">
              {label}
              <input
                type="checkbox"
                checked={Boolean(profile[key])}
                onChange={(e) => {
                  const on = e.target.checked;
                  update((p) => ({ ...p, [key]: on }));
                  if (key === "narration") setNarration(on);
                  if (key === "music") setMusic(on);
                }}
                className="size-6 accent-[oklch(0.68_0.148_32)]"
              />
            </label>
          ))}
          <label className="block text-sm font-medium text-ink">
            <span className="flex items-center justify-between">
              Music volume
              <span className="text-xs font-normal text-inksoft">{Math.round((profile.musicVolume ?? 1) * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round((profile.musicVolume ?? 1) * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                update((p) => ({ ...p, musicVolume: v }));
                setMusicVolume(v);
              }}
              className="mt-1 w-full accent-[oklch(0.68_0.148_32)]"
            />
          </label>
        </div>
        <p className="mt-4 text-xs text-inksoft">
          {LIBRARY_SIZE} activities are stored on this device. Progress stays on this device unless you sign in to sync
          your family profiles — there is no child account, no ads and no tracking.
        </p>
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Help &amp; legal</h2>
        <p className="mt-1 text-sm text-inksoft">
          Questions, billing help or feedback? Email{" "}
          <a href="mailto:Support@totland.app" className="font-semibold text-clay underline">
            Support@totland.app
          </a>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { to: "/contact", label: "Contact us" },
            { to: "/terms", label: "Terms" },
            { to: "/privacy", label: "Privacy" },
            { to: "/refund", label: "Refunds" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-xl bg-felt px-3 py-2 font-ui text-sm font-semibold text-ink ring-1 ring-border"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
