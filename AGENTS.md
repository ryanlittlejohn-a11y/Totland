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
