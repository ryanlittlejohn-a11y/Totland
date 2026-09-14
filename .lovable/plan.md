# App Store Connect .com URLs for Totland

Apple is rejecting `.app` domains in the App Store Connect privacy, terms, support, and marketing URL fields. We will give Apple a `.com` while keeping `totland.app` as the user-facing home.

## Goals
- Provide Apple with `.com` links it will accept.
- Keep `totland.app` as the canonical, primary domain families see.
- Add an App Store Connect note explaining the relationship so reviewers do not flag a mismatch.

## Plan

### 1. Register a .com domain
Choose one of the available options and buy it through Lovable (Settings → Domains → Buy new domain):
- **Recommended:** `totlandapp.com` — short, clearly about the app, easy to say.
- **Alternative:** `totlandkids.com` — emphasizes the audience.
- Other available: `playtotland.com`, `totlandgame.com`, `totlandlearn.com`, `totlandworld.com`, `totlandedu.com`, `totlandplay.com`, `totlandkidsapp.com`.

Cost: ~$11.10/year (first year and renewal).

### 2. Connect it to the project
- Add the chosen `.com` in **Project Settings → Domains → Connect domain**.
- Do **not** set it as Primary. Keep `totland.app` as the primary domain so users still land on `.app`.
- The `.com` should redirect to `totland.app` (or serve the same site). Lovable's multi-domain hosting will serve the app on both domains; we will add canonical redirects so search engines and Apple see `.app` as the main site.

### 3. Update canonical / redirect logic
In the app, ensure:
- All public pages (`/privacy`, `/terms`, `/refund`, `/contact`) render identically on both domains.
- Canonical `<link rel="canonical" href="https://totland.app/...">` stays pointing to `.app` so SEO does not split.
- If possible, add a server-side 301 from the `.com` paths to the `.app` paths for external link consistency. If Lovable's domain setup already serves both, we can rely on canonical tags instead.

### 4. Update App Store Connect metadata
Replace the four rejected `.app` URLs with the corresponding `.com` URLs:
- Privacy Policy: `https://<chosen-domain>/privacy`
- Terms of Use: `https://<chosen-domain>/terms`
- Support URL: `https://<chosen-domain>/contact`
- Marketing URL: `https://<chosen-domain>/`

### 5. Add an App Store Connect reviewer note
In the submission notes field, add:
> "The public-facing website for Totland is totland.app. We also operate totlandapp.com (or chosen domain) as a .com alias that redirects to totland.app and serves the same Privacy, Terms, Support, and Marketing pages. Both domains resolve to the same live site."

This covers both options: Apple gets `.com` URLs it accepts, and the note explains that `.app` is the real primary domain.

### 6. Verify before next submission
- Open each `.com` URL in a browser and confirm it loads the same content as `.app`.
- Confirm the canonical tag on each page still points to `totland.app`.
- Re-submit to App Store Connect.

## Out of scope
- Changing the app's bundle ID or deep-link scheme.
- Replacing `totland.app` as the primary user-facing domain.
- Modifying the App Clip invocation URL (remains `https://totland.app/appclip`).

## Next step
Pick one of the available `.com` domains above and I will start the connection and URL updates.
