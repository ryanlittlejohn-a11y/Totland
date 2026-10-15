<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Drag-based games use the generic `useDragToTarget` hook (+ `DragTarget` buttons for tap/VoiceOver fallback); game visuals sit on top — keeps drag handling reusable across games.
- Continuous path-tracing games use the separate `usePathTrace` hook (single pointer, zone-enter events), never `useDragToTarget` — keeps shipped drag games free of regression risk.
- Autonomous moving-target games use bounded CSS transform/opacity animations with a static semantic and reduced-motion control path — avoids per-frame React work and preserves accessibility.
- Spanish rhyme rounds use their own authored rhyme bank rather than translated English pairs — translated pairs do not preserve rhyme.
- Spanish sentence templates in i18n.ts use agreement tokens ({El}/{el}/{un}/{f}/{o}/{n}/{s}/{lc}) and match most-fixed-wording first — keeps article/gender correct without per-noun templates.
- Fonts (Baloo 2, Nunito Sans) are self-hosted via @fontsource imports in styles.css; never load Google Fonts or other third-party hosts — Apple Kids Category forbids third-party requests during child play.
- The parental gate state lives only in the /parent layout component memory, never in storage, and child-facing screens never link to pages with external links — Apple Kids 1.3 requires a fresh gate on every entry.
- Letter/word games read language-aware banks (alphabet(), bankWords(), soundWords(), spellingWords() in content.ts); Spanish uses authored WORDS_ES/LETTERS_ES with Ñ, never translated English words — translation broke letter–word matches.
- Bespoke scenes (Fishing/Monster/Rain) show question clues via the shared RoundClue panel keyed by CLUE_KINDS in rounds.ts; never per-game clue markup — keeps clue games consistent.
