import type { Round } from "@/lib/games";
import { CLUE_KINDS } from "@/lib/rounds";
import { L } from "@/lib/i18n";

/** Whether a round kind shows a clue panel in the bespoke scenes. */
export const needsClue = (kind: string) => CLUE_KINDS.has(kind);

/**
 * Shared picture-clue panel for the Fishing / Monster / Rain scenes: objects
 * to count (round.visual) or a written clue such as "🐱  C_T" (round.prompt).
 */
export function RoundClue({ round }: { round: Round }) {
  if (round.visual) {
    const items = Array.from(round.visual);
    return (
      <div data-round-clue className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-3xl felt-panel px-4 py-3">
        {items.map((ch, i) => (
          <span key={i} className="text-4xl anim-floaty" style={{ animationDelay: `${i * 120}ms` }} aria-hidden>
            {ch}
          </span>
        ))}
        <span className="sr-only">{L(`${items.length} items`, `${items.length} objetos`)}</span>
      </div>
    );
  }
  return (
    <div data-round-clue className="mt-4 rounded-3xl felt-panel px-4 py-3 text-center">
      <p className="whitespace-pre font-ui text-4xl font-bold tracking-widest text-ink">{round.prompt}</p>
    </div>
  );
}
