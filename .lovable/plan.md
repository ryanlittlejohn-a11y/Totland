# Calm mode and Large mode — scoping (no code changed)

## Key finding first
Sound effects, music, reduced motion and high contrast already exist, but they are **family-wide** settings (shared by every child on the device). Only `freeTraceOrder` is truly per-child. Calm and Large should be per-child like `freeTraceOrder` and **layer on top** of those settings without changing them. A calm child turns things down, and their siblings keep their own experience.

## 1. Calm mode: candidate behaviours
Built on existing tools: the `data-reduced-motion` CSS switch (only 7 files read `reducedMotion` in code, so most animation is CSS), the sfx/music flags, and high-contrast styles.
- Motion off for that child: no floating, bobbing or twinkling, no confetti or flash, no wiggle or shake on wrong answers, Connect the Dots nudge shown as text only, and the start-dot pulse is static. Calm mode does everything reduced motion does.
- Sound: music off, and sound effects soft or off (one quiet tone instead of celebratory jingles). Narration stays on because it is helpful and predictable. No sudden loud reward sounds.
- Rewards: one quiet "All done" screen with a single star, no animated sticker reveal and no surprise unlock pop-ups (save them for the dashboard).
- Predictability: Today's Adventure in a fixed order (no shuffle), a "Next: ___" picture cue, and a "Finish" button always visible. Games keep their frozen rounds as they are now.
- Timers: no game has a time limit or countdown (searched, none found). Some games use `setTimeout` for short delays, such as reward pacing and auto-advance after a correct answer. Calm mode would lengthen or remove auto-advance so the child taps "Next".
- No surprise pop-ups: suppress language and companion pop-ups during play.

## 2. Large mode
- Comes mostly from shared styles, about 40%: a root `data-large` switch scales type and the menu, tile and button sizes. Menus become 2 columns, with fewer tiles per screen and more scrolling.
- Per-game work, about 60%: games size boards in code and SVG units, and many have their own hit radii. Each engine needs a size multiplier (`hitScale`, about 1.3–1.5×): PlaceGame, PopGame, useDragToTarget, usePathTrace tolerances and start zone, Connect the Dots hit radius and dot size, and the word-tracing allowance. Bespoke scenes need checking one by one.
- Fewer items per round, for example 3 choices instead of 4. That changes difficulty, so make it opt-in per engine.

## 3. Per-game risks to verify
- Tracing games: wider tolerance can let a straight swipe finish a shape or letter. The swipe-resistance tests must be re-run at Large scale.
- Connect the Dots at 20 dots: bigger hit zones can overlap. Either cap the zone at half the distance between dots or limit Large mode to levels 1–3.
- Free Draw: Large mode means bigger toolbar buttons only, and the drawing surface must still size correctly (just fixed). Calm mode means no tap sounds.
- Drag games: bigger drop targets must not overlap on a 360px phone.
- Reward timer: Calm mode must not break the "finishes exactly once" protection.
- Check at 360px and iPad widths with every engine type.

## 4. Where the settings live
- Profile fields `calmMode?: boolean` and `largeMode?: boolean`. They are optional, so old saved profiles keep working, and they default to off. They stay out of SHARED_KEYS, like `freeTraceOrder`.
- They sync through the existing per-child sync path. Database schema impact is expected to be none, since the profile is saved as one block, but this needs confirming during the build.
- Parent dashboard: checkboxes next to "Free stroke order", behind the existing gate. Labels: "Calm mode" / "Modo calma", "Large mode" / "Modo grande", each with a one-line explanation, using L(en, es).
- Updates must not reset them: the profile-merge code keeps unknown and optional fields. I'll add a test that an old profile without these fields loads as off, and a saved "on" survives a merge.

## 5. Effort and builds
- **Build A, Calm mode, about 8–10h:** profile field and toggle, the root switch, motion/sound/reward overrides, the fixed Adventure order, the "Next" cue, the always-visible Finish button and tests.
- **Build B, Large mode, about 12–16h:** shared size scaling, 2-column menus, the hit-scale multiplier across the engines, checking bespoke scenes, and swipe and overlap tests.
- Narration: none needed. "Next: ___" can reuse existing game-name lines. If a spoken "All done" is wanted, it's about 4 short lines (around 50 characters), and nothing is recorded without approval.

## 6. Questions for Ryan (and an autism educator)
1. Calm sound: soft effects or none at all? Keep narration on?
2. Should Calm mode remove auto-advance completely (the child always taps "Next")?
3. Should Calm mode also use a softer, lower-saturation colour set, or keep colours as they are?
4. Large mode: fewer choices per round (changes difficulty), or bigger targets only?
5. Should Large mode hide the hardest levels (for example 20-dot puzzles)?
6. Would an educator want a visual schedule ("first, then") or a finish-countdown warning ("2 more")?
7. Should the two modes be separate switches, or one combined "Sensory-friendly" preset with options underneath?

Guardrails: auth, payments, RevenueCat, Paddle, pricing, the parental gate and Premium stay untouched.
