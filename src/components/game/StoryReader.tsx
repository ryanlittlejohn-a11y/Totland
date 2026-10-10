import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { STORIES } from "@/lib/content";
import { say } from "@/lib/speech";
import { setStoryMusic } from "@/lib/music";
import { recordGameComplete, useProfile } from "@/lib/profile";
import { L, storyPage, storyTitle } from "@/lib/i18n";

export function StoryReader({ onFinish }: { onFinish: (stars: number) => void }) {
  useEffect(() => {
    setStoryMusic(true);
    return () => setStoryMusic(false);
  }, []);
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const [storyId, setStoryId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const found = STORIES.find((s) => s.id === storyId);
  // Never open a Premium story without Premium, even if state is stale.
  const story = found && (!found.premium || profile.premium) ? found : undefined;

  useEffect(() => {
    if (story) say(storyPage(story.id, page, story.pages[page]!.text));
  }, [story, page]);

  if (!story) {
    return (
      <div>
        <p className="font-ui text-[22px] font-semibold text-ink">{L("Choose a story", "Elige un cuento")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {STORIES.map((s) => {
            const locked = !!s.premium && !profile.premium;
            return (
              <button
                key={s.id}
                type="button"
                data-locked={locked || undefined}
                aria-label={locked ? `${storyTitle(s.id, s.title)} — ${L("Premium", "Premium")}` : undefined}
                onClick={() => {
                  if (locked) {
                    navigate({ to: "/parent/subscription", search: { checkout: undefined } });
                    return;
                  }
                  setStoryId(s.id);
                  setPage(0);
                }}
                className="rounded-3xl bg-card p-4 text-left wood-block active:translate-y-1"
              >
                <span className="text-5xl" aria-hidden>{locked ? "🔒" : s.cover}</span>
                <p className="mt-3 font-ui font-bold leading-tight text-ink">{storyTitle(s.id, s.title)}</p>
                {locked ? <p className="font-ui text-xs text-inksoft">{L("Premium", "Premium")}</p> : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const p = story.pages[page]!;
  const last = page === story.pages.length - 1;

  return (
    <div>
      <div className="rounded-[2rem] bg-card p-6 text-center wood-block">
        <span className="block text-[6rem] leading-none anim-floaty">{p.emoji}</span>
        <p className="mt-5 font-ui text-2xl font-bold leading-snug text-ink">
          {storyPage(story.id, page, p.text).split(" ").map((w, i) => (
            <button key={i} type="button" onClick={() => say(w)} className="mx-0.5 rounded-lg px-1 active:bg-amber/40">
              {w}
            </button>
          ))}
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setPage((n) => Math.max(0, n - 1))}
          className="grid size-16 place-items-center rounded-2xl bg-card text-2xl wood-block"
          aria-label={L("Previous page", "Página anterior")}
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => {
            if (last) {
              update((pr) => recordGameComplete(pr, "stories", 3, 3));
              onFinish(3);
            } else setPage(page + 1);
          }}
          className="flex-1 rounded-2xl bg-clay py-4 font-ui text-xl font-bold text-primary-foreground wood-block"
        >
          {last ? L("The end 🌟", "Fin 🌟") : L("Next page", "Siguiente página")}
        </button>
      </div>
      <p className="mt-3 text-center font-ui text-sm text-inksoft">
        {L(`Page ${page + 1} of ${story.pages.length}`, `Página ${page + 1} de ${story.pages.length}`)}
      </p>
    </div>
  );
}
