import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { STICKERS, pick } from "@/lib/content";
import { chime, say } from "@/lib/speech";
import { awardSticker, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";

export function RewardScreen({ stars, onAgain }: { stars: number; onAgain: () => void }) {
  const { profile, update } = useProfile();
  const [sticker, setSticker] = useState<string | null>(null);

  useEffect(() => {
    const s = pick(STICKERS.filter((x) => !profile.stickers.includes(x)).length ? STICKERS.filter((x) => !profile.stickers.includes(x)) : STICKERS);
    setSticker(s);
    update((p) => awardSticker(p, s));
    chime("reward", profile.sfx);
    say(L("Amazing work! You earned a new sticker.", "¡Excelente trabajo! Ganaste una calcomanía nueva."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-[2rem] bg-card p-6 text-center wood-block">
      <p className="font-ui text-3xl font-bold text-ink">{L("Amazing work!", "¡Excelente trabajo!")}</p>
      <div className="mt-4 flex justify-center gap-2 text-4xl">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={i < stars ? "anim-twinkle" : "opacity-25"}>
            ⭐
          </span>
        ))}
      </div>
      <div className="mx-auto mt-6 grid size-28 place-items-center rounded-3xl bg-amber/30 text-6xl anim-floaty">
        {sticker}
      </div>
      <p className="mt-3 font-ui font-semibold text-inksoft">{L("New sticker for your shelf!", "¡Una calcomanía nueva para tu estante!")}</p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="grid flex-1 place-items-center rounded-2xl bg-felt py-4 font-ui text-lg font-bold text-ink wood-block"
        >
          {L("Map", "Mapa")}
        </Link>
        <button
          type="button"
          onClick={onAgain}
          className="flex-1 rounded-2xl bg-clay py-4 font-ui text-lg font-bold text-primary-foreground wood-block"
        >
          {L("Play again", "Jugar otra vez")}
        </button>
      </div>
    </div>
  );
}
