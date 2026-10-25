# Teachers & printables — scoping plan (nothing built)

## What I checked
- Installed native add-ons: app, browser, network, preferences, splash-screen, status-bar. **There are no Filesystem or Share add-ons and no PDF library yet.**
- `puzzleSvg()` exists in connect-dots.ts. `LINE_PATTERNS` (board 100×70) is in line-trace.ts. Shape and number strokes are in trace-strokes.ts.
- The grown-up pages are /parent (the gated layout), parent.index, parent.children and parent.subscription. Word Finds already use a "first N free" Premium pattern, which we can reuse.

## 1. Making the PDF on the device
- **Library: jsPDF.** It draws lines, curves and dashes directly, so the output stays sharp vector. I'd write a small drawing step that turns our point/stroke data into jsPDF calls, which skips the svg2pdf add-on.
  - It adds about 100 KB gzipped. We'd load it only when the grown-up taps "Make PDF", so the website's first load doesn't change.
  - pdf-lib was the other option. It's a similar size but has no dash helpers, so it isn't worth it.
- **Web:** download the file with a Blob link, and open it in a new tab for printing.
- **iOS and Android:** we need `@capacitor/filesystem` and `@capacitor/share` (official, v7). The file is written to the app's private cache folder, then the system share sheet opens, which offers Print, Files and AirDrop.
  - This means a **new native build and a store review**. Both add-ons are standard and low risk, and they make no network calls.
  - A no-plugin fallback, opening the file through the existing browser add-on, doesn't work reliably with local files.

## 2. Page layout
- US Letter is the default, with A4 as a choice (remembered on the device). Margins are 0.5 in / 12.7 mm.
- One puzzle per page by default. Two per page is an option for Connect the Dots and Trace Numbers only.
- An optional "Name ____ Date ____" line at the top, on by default. A small "TotLand" footer, with no web address on the sheet.
- Black and white only:
  - Guide lines at 2.5 pt, solid.
  - Tracing dashes 3 pt thick, with a 6 pt dash and a 5 pt gap. The trace-dots option uses 2.5 pt dots spaced 7 pt apart.
  - Start dot 9 pt with a number. A small arrow head at the start of each stroke (cheap, because the stroke direction is already known).
  - These sizes survive photocopying. They still need checking on one real printout.
- Connect the Dots: numbers in 14 pt bold, dots 5 pt.
- Blank page: a 4 pt rounded border plus the name line.

## 3. Screens
- A new "Teachers & printables" page inside /parent, so it sits behind the same gate. A card on the parent dashboard links to it. **No child screen links to it.**
- The picker:
  - Type: Connect the Dots, Line Tracing, Trace Shapes, Trace Numbers, Blank page.
  - A grid of thumbnails to tick (with "Select all").
  - Paper size, 1 or 2 per page, name line on or off, dashed or dotted.
  - A page count, then "Make PDF".
- Preview: the thumbnails come from the same drawing data. A full-page preview uses the PDF itself.
- Free vs Premium: 3 free sheets per type. The others show a lock with "Unlock with Premium", which goes to the existing subscription page. The Blank page is always free.
  - Premium is read through the existing check, which comes from the server. Nothing about Premium changes.
- All labels in English and Spanish, using the same "tú" wording as the other grown-up screens.
- Optional type 5 (number order, 1–10 to circle) is trivial and can go in Build 2. I'd skip shape matching for now.

## 4. Privacy and store review
- The PDF is made on the device: no network, no analytics, nothing stored on our server. A file only leaves the device when the grown-up chooses to share or print it.
- The sheets carry no child data except an optional printed name. That name is typed in at the moment and never saved.
- Apple and Google kids rules: the share sheet is allowed behind the parental gate, and that's where it is. There are no outside links on the sheets.
- Store notes need one new line saying the app makes printable PDFs on the device behind the gate. The Privacy Notice stays accurate, so no legal edit is needed.

## 5. Tests
- **Logic tests:**
  - Page layout fits inside the margins for Letter and A4.
  - Sheets per page: 1 or 2.
  - Free sample rules: exactly 3 per type, the rest locked unless Premium, Blank page always free.
  - Selection becomes the right number of pages.
  - Every stroke maps to a point inside the page.
- **PDF checks:** make a PDF in a test and count the pages. Check the text holds the numbers 1..N for a Connect the Dots puzzle.
- **Browser:** go through the gate, make a PDF and download it at phone and iPad widths.
- **Real device only:**
  - The share sheet and printing to AirPrint or Android printing.
  - How the lines look after photocopying.
  - Saving to Files.

## 6. Two builds and decisions

**Build 1 (web only, no native change, about 8–10 h).**
- The drawing step and layout rules.
- Connect the Dots, Line Tracing and Blank page.
- The new page, free/Premium lock states, download or print on web.
- Tests.
- In the native app, the "Make PDF" button shows "Coming in the next app update".

**Build 2 (about 6–8 h, plus a new native build).**
- Trace Shapes and Trace Numbers sheets, the dashed/dotted toggle, start arrows, two per page.
- Add the Filesystem and Share add-ons, run the native sync, share on iOS and Android.
- Optional number-order sheet.

**Decisions for Ryan:**
1. Which 3 free sheets per type: I suggest the first 3 easiest.
2. Letter by default: yes or no.
3. Are the two new native add-ons OK, given they mean a new store review?
4. Name line on by default.
5. Should the Blank page always be free?

**Narration:** none. These screens are for grown-ups only.

**Not touched:** sign-in, payments, RevenueCat, Paddle, pricing, the parental gate itself and Premium logic.
