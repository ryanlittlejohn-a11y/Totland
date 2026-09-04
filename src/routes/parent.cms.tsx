import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AREAS } from "@/lib/content";
import type { RightsStatus } from "@/lib/rights";

export const Route = createFileRoute("/parent/cms")({
  head: () => ({
    meta: [
      { title: "Content Studio — Totland" },
      { name: "description", content: "Draft games, puzzles, flash cards and books, set age range and difficulty, and move items through rights review to publish." },
      { property: "og:title", content: "Content Studio — Totland" },
      { property: "og:description", content: "The owner-side content pipeline: draft, rights review, approved, published, archived." },
    ],
  }),
  component: Cms,
});

const STATUSES: RightsStatus[] = ["DRAFT", "RIGHTS REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"];
const KEY = "totland.cms.v1";

interface Item {
  id: string;
  title: string;
  area: string;
  type: string;
  ageMin: number;
  ageMax: number;
  difficulty: number;
  objective: string;
  status: RightsStatus;
}

const seed: Item[] = [
  { id: "1", title: "Letter Hunt — uppercase", area: "letters", type: "game", ageMin: 2, ageMax: 4, difficulty: 1, objective: "Letter recognition", status: "PUBLISHED" },
  { id: "2", title: "Number Safari — count to 10", area: "numbers", type: "game", ageMin: 3, ageMax: 5, difficulty: 2, objective: "Counting", status: "PUBLISHED" },
  { id: "3", title: "Storybook — Ollie Owl Counts", area: "stories", type: "book", ageMin: 3, ageMax: 6, difficulty: 2, objective: "Early reading", status: "APPROVED" },
  { id: "4", title: "Imported clipart puzzle pack", area: "puzzles", type: "puzzle", ageMin: 4, ageMax: 6, difficulty: 3, objective: "Visual matching", status: "RIGHTS REVIEW" },
];

function Cms() {
  const [items, setItems] = useState<Item[]>(seed);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("letters");

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        /* keep seed */
      }
    }
  }, []);

  const persist = (next: Item[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">New content item</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="min-w-[180px] flex-1 rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
          />
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) return;
              persist([
                ...items,
                {
                  id: String(Date.now()),
                  title: title.trim(),
                  area,
                  type: "game",
                  ageMin: 2,
                  ageMax: 6,
                  difficulty: 1,
                  objective: "",
                  status: "DRAFT",
                },
              ]);
              setTitle("");
            }}
            className="rounded-xl bg-clay px-5 py-2 font-ui font-bold text-primary-foreground"
          >
            Add draft
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-3xl bg-card p-4 wood-block">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl bg-felt p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-ui font-bold text-ink">{it.title}</p>
                <p className="text-xs text-inksoft">
                  {AREAS.find((a) => a.id === it.area)?.title} · {it.type} · ages {it.ageMin}–{it.ageMax} · difficulty{" "}
                  {it.difficulty}
                  {it.objective ? ` · ${it.objective}` : ""}
                </p>
              </div>
              <select
                value={it.status}
                onChange={(e) =>
                  persist(items.map((x) => (x.id === it.id ? { ...x, status: e.target.value as RightsStatus } : x)))
                }
                className="rounded-lg bg-card px-2 py-1 text-xs font-semibold ring-1 ring-border"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            {it.status === "RIGHTS REVIEW" && (
              <p className="mt-2 text-xs font-semibold text-destructive">
                Blocked from the production app until rights are verified.
              </p>
            )}
          </div>
        ))}
      </section>

      <p className="px-1 text-xs text-inksoft">
        Scheduling and translations are stored with each item in the shipped build; this studio writes to local storage in
        the preview.
      </p>
    </div>
  );
}
