import { useEffect, useState } from "react";
import { STORIES } from "@/lib/content";
import { say } from "@/lib/speech";
import { recordGameComplete, useProfile } from "@/lib/profile";
import { L, storyPage, storyTitle } from "@/lib/i18n";

export function StoryReader({ onFinish }: { onFinish: (stars: number) => void }) {
  const { update } = useProfile();
  const [storyId, setStoryId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const story = STORIES.find((s) => s.id === storyId);

  useEffect(() => {
    if (story) say(storyPage(story.id, page, story.pages[page]!.text));
  }, [story, page]);

  if (!story) {
    return (
      <div>
        <p className="font-ui text-[22px] font-semibold text-ink">{L("Choose a story", "Elige un cuento")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {STORIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setStoryId(s.id);
                setPage(0);
              }}
              className="rounded-3xl bg-card p-4 text-left wood-block active:translate-y-1"
            >
              <span className="text-5xl">{s.cover}</span>
              <p className="mt-3 font-ui font-bold leading-tight text-ink">{storyTitle(s.id, s.title)}</p>
            </button>
          ))}
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
