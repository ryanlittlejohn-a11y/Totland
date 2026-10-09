# Apple 1.3 rejection — what's reachable without the grown-up check

## Findings (traced from the real route tree)

The grown-up check lives only in `src/routes/parent.tsx`, so it protects `/parent`, `/parent/children` and `/parent/subscription` and nothing else. Typing or deep-linking straight to `/parent/subscription` still shows the check, because the layout draws the check in place of its child pages.

### 1. Ungated links out of the app (most likely what Apple hit)
The home screen footer (`src/routes/index.tsx`, lines 316–330) and the "For grown-ups" card link straight to top-level pages that are **not** under `/parent`:

| Page (route file) | What a child can tap with no check |
|---|---|
| `/terms` (`src/routes/terms.tsx`) | paddle.com buyer terms (external, line 163); `mailto:Support@totland.app` (line 279) |
| `/privacy` (`src/routes/privacy.tsx`) | paddle.com privacy (line 150); two `mailto:` links (264, 300) |
| `/refund` (`src/routes/refund.tsx`) | paddle.net (53); reportaproblem.apple.com (79); `mailto:` (108) |
| `/contact` (`src/routes/contact.tsx`) | `mailto:` (94); contact form that sends data off the device |
| `/guides/toddler-learning-games` | no external links, but links on to `/privacy` |

Path: Home → footer "Terms"/"Privacy"/"Refunds"/"Contact" → external link or email. No check at any step. Same for the subscription page's own legal links once inside, but those are already gated.

### 2. The check stays open for the whole app session
`parent.tsx` stores the pass in `sessionStorage` (`totland.gate`). After a grown-up passes once, a child who later taps "Ask a grown-up about Totland Premium", "Parents & settings", a locked Word Find's "Grown-ups: unlock" or the offline screen's "See Premium" goes straight to Subscribe / Restore / Manage subscription with no new check, until the app is fully closed. Apple's "cannot be disabled" wording plausibly covers this. On iPad it's easier to hit, because the app usually keeps running in the background rather than being closed.

### 3. Checked and clean
- Subscribe, Restore and Manage subscription (RevenueCat link, opened in the in-app browser): all only appear on `/parent/subscription`, which is behind the check.
- The App Store / Google Play card and the support email on the dashboard are under `/parent`, so they're behind the check.
- "Ask a grown-up" hint, "Parents & settings", locked Word Find and the offline "See Premium" link all go to `/parent/...`, so each lands on the check first (subject to finding 2).
- iPad width: the home, worlds, world and area screens use no width-based layouts (no `sm:/md:/lg:` classes found), so nothing extra appears at iPad Air 11" size. The page sits in the same centred column. A live iPad-viewport screenshot pass is step 1 below, so I'm not claiming more than the code shows.
- The install prompt only appears in a browser that offers installing, never in the phone/tablet app. App deep links only lead to normal pages, so they land on the check.
- Nothing from the rebalance, subscription wording, CORS, deletion or narration work changed the check or added links.
- The check has no skip button, and Back can't get past it.

## Proposed fix (needs your approval — touches the parental gate)
1. Check at iPad Air 11" (820×1180) that findings 1–2 reproduce and that nothing else shows up.
2. In the app only (the website stays as it is): either hide the home footer legal/contact/guide links and the "For grown-ups" card, or send them through the grown-up check. Recommended: hide them on the home screen and show Terms/Privacy/Refund/Contact inside the parent area, which Apple accepts.
3. Put a check in front of every link that leaves the app on the legal and contact pages, in the app (Paddle, Apple report-a-problem, email). This covers the case where one of those pages is reached some other way.
4. The check expires: ask again every time someone goes into the parent area from the child side (or after a short timeout such as 2 minutes), and always ask again before Subscribe, Restore and Manage subscription, if you want the strictest version.
5. Re-run the full audit at phone and iPad width. Then a new Codemagic build. No publish needed unless the website should change too.

## Questions for you
- Item 2: hide the links on the home screen, or keep them behind the check?
- Item 4: ask again every time, or after a short timeout?
