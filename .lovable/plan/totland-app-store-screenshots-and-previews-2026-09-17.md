# Totland App Store screenshots and previews

## Deliverables

Create complete, upload-ready App Store media in **English and Spanish**:

- **8 polished screenshots per language for iPhone 6.9-inch**
- **8 polished screenshots per language for iPad 13-inch**
- **1 portrait app preview video per language for iPhone**
- **1 portrait app preview video per language for iPad**
- A clearly named upload folder organized by language and device, plus a contact sheet for quick review

The largest iPhone and iPad sizes will be used so App Store Connect can scale them for smaller supported devices.

## Screenshot story

Use real Totland screens inside warm, playful layouts matching the app’s cream, clay-orange, yellow, green, and sky-blue visual identity. Keep headlines short, readable, and localized rather than covering the app.

1. **Kids learn by playing** — home and learning-world discovery
2. **Build ABC and phonics skills** — Letter Pop or Alphabet Forest
3. **Practice writing letters** — guided letter tracing
4. **Find words with a finger swipe** — active Word Find puzzle
5. **100 themed Word Finds** — puzzle library and replay value
6. **Read along with stories** — narrated storybook experience
7. **Celebrate every win** — stickers, stars, and rewards
8. **Made for growing learners** — progress and age-adaptive learning, using a child-safe view of parent benefits

All screenshots will show genuine app content. Decorative backgrounds and benefit headlines will frame the experience without implying features that are not present.

## App preview story

Produce four 20–30 second videos following the same child-learning journey:

```text
Discover a world → play a letter game → trace a letter → swipe a Word Find
→ earn a reward → return to the colorful learning world
```

- Record authentic interaction from the app rather than generating fictional gameplay.
- Use smooth cuts, restrained branded motion, readable English/Spanish captions, and the app’s existing music or child-safe sound effects where suitable.
- Keep the story understandable while muted.
- Export in Apple-compatible H.264 MP4, portrait orientation, 30 fps, under 500 MB, with an intentional poster frame.

## Capture and localization

- Prepare stable clean-session child profiles for capture without changing real customer data.
- Capture at native high-resolution iPhone and iPad portrait dimensions.
- Set the app to English for the English set and Spanish for the Spanish set; localize every marketing headline as well as the visible app UI.
- Avoid loading indicators, browser chrome, parental-gate questions, test banners, debug text, and incomplete progress states.
- Use representative progress so rewards and completed Word Finds look earned and coherent across the sequence.

## Quality checks

- Confirm every PNG is opaque, correctly sized, and contains no clipped or overlapping text.
- Confirm each video is 15–30 seconds, uses an accepted codec/container, has the correct dimensions, and plays cleanly from start to finish.
- Review iPhone and iPad separately so tablet captures use the available space rather than appearing like enlarged phone screens.
- Verify all English and Spanish wording, visual continuity, safe areas, and App Store content accuracy.
- Deliver the final media and a concise upload-order guide; do not publish or submit anything to Apple automatically.

## Technical details

- Screenshot targets: **1320×2868 px** for 6.9-inch iPhone and **2064×2752 px** for 13-inch iPad, portrait PNG with no alpha.
- Build screenshots from fresh app captures and branded composition templates, preserving the actual screen as the dominant visual.
- Build previews as deterministic edited screen recordings, then inspect with `ffprobe` and frame checks before delivery.
- Keep production files outside the app source unless a small capture-only fix is required; any such app change will be limited to making existing content render correctly.
