import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AGE_MODES, type AgeMode } from "@/lib/catalog";
import { CHARACTERS } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { say } from "@/lib/speech";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Set up Totland — Learn Through Play" },
      { name: "description", content: "A one-minute grown-up setup: your child's name, age mode and play buddy. Everything stays on this device." },
      { property: "og:title", content: "Set up Totland" },
      { property: "og:description", content: "Choose a name, an age mode and a play buddy to start learning through play." },
    ],
  }),
  component: Welcome,
});

const OUTFITS = ["🎒", "🎩", "🧣", "👑", "🕶️", "🎀"];
const BGS = [
  { id: "moss", swatch: "oklch(0.72 0.11 145)" },
  { id: "sky", swatch: "oklch(0.76 0.1 240)" },
  { id: "amber", swatch: "oklch(0.83 0.13 80)" },
  { id: "plum", swatch: "oklch(0.68 0.11 330)" },
];

function Welcome() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.childName === "Friend" ? "" : profile.childName);
  const [mode, setMode] = useState<AgeMode | null>(profile.ageMode);
  const [character, setCharacter] = useState<string | null>(profile.characterId);
  const [outfit, setOutfit] = useState(profile.outfit);
  const [bg, setBg] = useState(profile.avatarBg);

  const finish = () => {
    update((p) => ({
      ...p,
      childName: name.trim() || "Friend",
      ageMode: mode ?? "learner",
      age: mode === "explorer" ? 3 : mode === "reader" ? 5 : 4,
      characterId: character,
      outfit,
      avatarBg: bg,
      onboarded: true,
    }));
    say(`Hello ${name.trim() || "friend"}! Let's play.`);
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="font-ui text-xs uppercase tracking-[0.16em] text-inksoft">Grown-up setup · step {step + 1} of 3</p>
      <h1 className="mt-1 font-ui text-3xl font-bold text-ink">Welcome to Totland</h1>

      {step === 0 && (
        <section className="mt-6 rounded-3xl bg-card p-5 wood-block">
          <label htmlFor="child-name" className="font-ui font-semibold text-ink">
            What should we call your child?
          </label>
          <input
            id="child-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            maxLength={20}
            className="mt-3 w-full rounded-2xl bg-felt px-4 py-3 font-ui text-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-clay"
          />
          <p className="mt-3 text-xs text-inksoft">Stored on this device only. No account, no sign-in.</p>
        </section>
      )}

      {step === 1 && (
        <section className="mt-6 space-y-3">
          {AGE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex w-full items-center gap-4 rounded-3xl p-4 text-left wood-block ${
                mode === m.id ? "bg-amber/40" : "bg-card"
              }`}
            >
              <span className="text-4xl">{m.emoji}</span>
              <span>
                <span className="block font-ui text-lg font-bold text-ink">
                  {m.title} · {m.ages}
                </span>
                <span className="block font-ui text-sm text-inksoft">{m.blurb}</span>
              </span>
            </button>
          ))}
        </section>
      )}

      {step === 2 && (
        <section className="mt-6 space-y-4">
          <div className="rounded-3xl bg-card p-4 wood-block">
            <p className="font-ui font-semibold text-ink">Pick a play buddy</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.name}
                  onClick={() => {
                    setCharacter(c.id);
                    say(`${c.name}! ${c.line}`);
                  }}
                  className={`aspect-square grid place-items-center rounded-2xl text-3xl ${
                    character === c.id ? "bg-amber/50" : "bg-felt"
                  }`}
                >
                  {c.emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-card p-4 wood-block">
            <p className="font-ui font-semibold text-ink">Give them something to wear</p>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {OUTFITS.map((o) => (
                <button
                  key={o}
                  type="button"
                  aria-label={`outfit ${o}`}
                  onClick={() => setOutfit(o)}
                  className={`aspect-square grid place-items-center rounded-2xl text-2xl ${
                    outfit === o ? "bg-amber/50" : "bg-felt"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {BGS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`background ${b.id}`}
                  onClick={() => setBg(b.id)}
                  className={`size-10 rounded-full ring-2 ${bg === b.id ? "ring-ink" : "ring-transparent"}`}
                  style={{ background: b.swatch }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-2xl bg-felt px-5 py-4 font-ui font-bold text-ink wood-block"
          >
            Back
          </button>
        )}
        <button
          type="button"
          disabled={step === 1 && !mode}
          onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}
          className="flex-1 rounded-2xl bg-clay py-4 font-ui text-lg font-bold text-primary-foreground wood-block disabled:opacity-40"
        >
          {step === 2 ? "Start playing" : "Next"}
        </button>
      </div>
    </main>
  );
}
