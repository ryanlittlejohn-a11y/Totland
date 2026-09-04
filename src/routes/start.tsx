import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AGE_MODES, type AgeMode } from "@/lib/catalog";
import { CHARACTERS } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { say } from "@/lib/speech";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Let's Play & Learn — Totland Setup" },
      { name: "description", content: "Choose a learning level and a buddy to begin. No accounts, no personal details, everything stays on the device." },
      { property: "og:title", content: "Let's Play & Learn — Totland Setup" },
      { property: "og:description", content: "Pick Explorer, Learner or Reader and choose a friendly character." },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1>(0);
  const [mode, setMode] = useState<AgeMode>("learner");
  const [helper, setHelper] = useState(false);
  const [character, setCharacter] = useState(profile.character ?? "bear");

  const finish = () => {
    update((p) => ({ ...p, ageMode: mode, character, onboarded: true }));
    void navigate({ to: "/" });
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-4 py-8">
      <h1 className="text-center font-ui text-3xl font-bold text-ink">Hi! Let's Play &amp; Learn</h1>
      <p className="mt-2 text-center font-ui text-inksoft">
        {step === 0 ? "A grown-up can pick the starting level." : "Now choose a buddy to play with."}
      </p>

      {step === 0 ? (
        <div className="mt-6 space-y-3">
          {AGE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setStep(1);
              }}
              className="flex w-full items-center gap-3 rounded-[1.5rem] bg-card p-4 text-left wood-block active:translate-y-1"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-felt text-3xl">{m.emoji}</span>
              <span className="flex-1">
                <span className="block font-ui text-xl font-bold text-ink">
                  {m.title} <span className="font-normal text-inksoft">· ages {m.ages}</span>
                </span>
                <span className="block font-ui text-sm text-inksoft">{m.blurb}</span>
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setHelper((h) => !h)}
            className="w-full rounded-2xl bg-felt px-4 py-3 font-ui font-semibold text-ink"
          >
            Help me choose
          </button>
          {helper && (
            <div className="rounded-[1.5rem] felt-panel p-4">
              <p className="font-ui font-semibold text-ink">Can your child name most letters?</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("reader");
                    setStep(1);
                  }}
                  className="flex-1 rounded-xl bg-card py-3 font-ui font-bold text-ink wood-block"
                >
                  Yes, and some words
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("learner");
                    setStep(1);
                  }}
                  className="flex-1 rounded-xl bg-card py-3 font-ui font-bold text-ink wood-block"
                >
                  Some of them
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode("explorer");
                  setStep(1);
                }}
                className="mt-2 w-full rounded-xl bg-card py-3 font-ui font-bold text-ink wood-block"
              >
                Not yet — we're just starting
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-3">
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCharacter(c.id);
                  say(`${c.name}. Hello!`);
                }}
                aria-label={c.name}
                aria-pressed={character === c.id}
                className={`grid aspect-square place-items-center rounded-3xl text-5xl wood-block active:translate-y-1 ${
                  character === c.id ? "bg-amber" : "bg-card"
                }`}
              >
                <span className="anim-floaty">{c.emoji}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={finish}
            className="mt-6 w-full rounded-2xl bg-clay py-4 font-ui text-xl font-bold text-primary-foreground wood-block active:translate-y-1"
          >
            Let's play!
          </button>
          <button type="button" onClick={() => setStep(0)} className="mt-3 w-full font-ui text-sm text-inksoft">
            Back
          </button>
        </div>
      )}

      <p className="mt-6 text-center font-ui text-xs text-inksoft">
        No names, emails or accounts needed — progress stays on this device.
      </p>
    </main>
  );
}
