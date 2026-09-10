import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  accuracy,
  addChild,
  removeChild,
  setActiveChild,
  skillOf,
  updateChild,
  useFamily,
} from "@/lib/profile";

export const Route = createFileRoute("/parent/children")({
  head: () => ({
    meta: [
      { title: "Children — Totland" },
      {
        name: "description",
        content: "Add a profile for each child so their stars, stickers and learning progress are kept separately.",
      },
      { property: "og:title", content: "Children — Totland" },
      { property: "og:description", content: "Each child gets their own progress, all under one family account." },
    ],
  }),
  component: Children,
});

const OUTFITS = ["🎒", "🧢", "👑", "🎩", "🦺", "🧣"];

function Children() {
  const { children, activeId, hydrated } = useFamily();
  const [name, setName] = useState("");
  const [age, setAge] = useState(4);
  const [outfit, setOutfit] = useState(OUTFITS[0]!);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!hydrated) return <div className="h-40 rounded-3xl bg-card wood-block" />;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Children</h2>
        <p className="mt-1 text-sm text-inksoft">
          Everyone shares this family account. Each child keeps their own stars, stickers and progress.
        </p>

        <div className="mt-4 space-y-3">
          {children.map((c) => {
            const letters = skillOf(c.profile, "letters");
            const isActive = c.id === activeId;
            return (
              <div key={c.id} className="rounded-2xl bg-felt p-4 ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-card text-xl">
                    {c.profile.outfit}
                  </span>
                  <input
                    value={c.profile.childName}
                    onChange={(e) => updateChild(c.id, (p) => ({ ...p, childName: e.target.value }))}
                    className="min-w-0 flex-1 rounded-xl bg-card px-3 py-2 text-sm font-semibold text-ink outline-none ring-1 ring-border"
                    aria-label="Child's name"
                  />
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={c.profile.age}
                    onChange={(e) => updateChild(c.id, (p) => ({ ...p, age: Number(e.target.value) }))}
                    className="w-16 rounded-xl bg-card px-2 py-2 text-sm text-ink outline-none ring-1 ring-border"
                    aria-label="Age"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-inksoft">
                  <span>⭐ {c.profile.stars} stars</span>
                  <span>· {c.profile.gamesCompleted} games</span>
                  <span>· {letters.mastered.length}/26 letters</span>
                  <span>· {accuracy(letters)}% letters accuracy</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {isActive ? (
                    <span className="rounded-xl bg-moss/20 px-3 py-2 text-xs font-semibold text-moss">
                      Playing now
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveChild(c.id)}
                      className="rounded-xl bg-clay px-3 py-2 text-xs font-bold text-primary-foreground"
                    >
                      Play as {c.profile.childName || "this child"}
                    </button>
                  )}
                  {children.length > 1 &&
                    (confirmId === c.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            removeChild(c.id);
                            setConfirmId(null);
                          }}
                          className="rounded-xl bg-night px-3 py-2 text-xs font-bold text-cream"
                        >
                          Remove permanently
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="rounded-xl bg-card px-3 py-2 text-xs font-semibold text-ink ring-1 ring-border"
                        >
                          Keep
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(c.id)}
                        className="rounded-xl bg-card px-3 py-2 text-xs font-semibold text-ink ring-1 ring-border"
                      >
                        Remove
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Add a child</h2>
        <div className="mt-3 space-y-3">
          <label className="flex items-center justify-between text-sm font-medium text-ink">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mia"
              className="w-44 rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
            />
          </label>
          <label className="flex items-center justify-between text-sm font-medium text-ink">
            Age
            <input
              type="number"
              min={2}
              max={6}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-44 rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
            />
          </label>
          <div className="flex items-center justify-between text-sm font-medium text-ink">
            Look
            <div className="flex gap-1.5">
              {OUTFITS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutfit(o)}
                  className={`grid size-10 place-items-center rounded-xl text-lg ring-1 ring-border ${
                    outfit === o ? "bg-clay" : "bg-felt"
                  }`}
                  aria-label={`Choose ${o}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              addChild(name.trim() || "Friend", age, outfit);
              setName("");
              setAge(4);
            }}
            className="w-full rounded-xl bg-clay py-3 font-ui font-bold text-primary-foreground"
          >
            Add child
          </button>
        </div>
        <p className="mt-4 text-xs text-inksoft">
          Signed in on the Subscription tab? Each child's progress is saved to your account, so it follows you to a new
          phone or tablet.
        </p>
      </section>
    </div>
  );
}
