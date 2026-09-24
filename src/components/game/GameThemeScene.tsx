import type { ReactNode } from "react";
import { getLang } from "@/lib/i18n";
import type { GameTheme } from "@/lib/game-themes";

export function GameThemeScene({ theme, children }: { theme: GameTheme; children: ReactNode }) {
  const cue = getLang() === "es" ? theme.cue.es : theme.cue.en;
  return (
    <section className="game-theme" data-palette={theme.palette} data-shape={theme.shape}>
      <div className="game-theme__sky" aria-hidden>{theme.decorations}</div>
      <div className="game-theme__guide">
        <span className="game-theme__mascot anim-floaty" aria-hidden>{theme.mascot}</span>
        <span className="game-theme__cue">{cue}</span>
      </div>
      <div className="game-theme__content">{children}</div>
    </section>
  );
}