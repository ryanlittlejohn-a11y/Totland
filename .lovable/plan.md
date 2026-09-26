# TestFlight account deletion DEL-NET — confirmed findings

## Root cause

`DEL-NET` is caused by the native app's cross-origin permission check, not by Wi-Fi and not by the deletion logic.

The strong hypothesis was partly right:

1. TanStack constructs `deleteMyAccount` as a relative `/_serverFn/...` request.
2. Totland's native request bridge is installed early and recognizes `/_serverFn` paths. In the packaged app it correctly rewrites that request from `capacitor://localhost/_serverFn/...` to `https://totland.app/_serverFn/...`.
3. The rewritten request carries TanStack's required custom `x-tsr-serverFn: true` header, plus the sign-in authorization header.
4. That makes it a cross-origin request requiring browser permission before the deletion request can be sent.
5. Totland's live backend currently allows `authorization, content-type, x-tsr-redirect, accept`, but **does not allow `x-tsr-serverFn`**.
6. A direct check against the live backend reproduced the mismatch: the phone asks permission for `authorization,content-type,x-tsr-serverfn,accept`, while the response omits `x-tsr-serverfn`.
7. The webview therefore blocks the real POST before `deleteMyAccount` runs and reports a fetch `TypeError`. The client classifies that as `DEL-NET`, even with working Wi-Fi.

## What this rules out

- The request is **not** being left at `capacitor://localhost`; the native bridge already redirects it to Totland's real backend.
- This failure occurs before the protected server function and before its sign-in middleware, so an expired session is not the cause of this specific `DEL-NET` result.
- No child profiles, subscription rows, or account login can be partially deleted by this failure because the destructive POST never starts.
- The existing deletion order and retry behavior are not implicated in this particular failure.

## Actual fix

Add `x-tsr-serverfn` to the native backend's allowed request-header list in the existing native cross-origin middleware. Header names are case-insensitive; using lowercase keeps the declaration aligned with the browser's preflight request.

Then verify:

1. A native-origin preflight explicitly permits every header TanStack sends.
2. A throwaway signed-in account reaches `deleteMyAccount` and is deleted successfully through the same native-origin request path.
3. Web account deletion still works.
4. Invalid sign-ins still show the sign-in-again message rather than `DEL-NET`.
5. No changes are made to purchase handling, RevenueCat, Paddle, pricing, or the parental gate.

## Evidence locations

- `src/lib/native-bridge.ts:20–33` — rewrites local server-function paths to `apiOrigin()`.
- `src/lib/native.ts:31–42` — `apiOrigin()` defaults to `https://totland.app`; `/_serverFn` is explicitly recognized.
- `src/routes/__root.tsx:19,151–157` — installs the bridge at app startup; the bridge module also installs itself on import.
- TanStack client request code — constructs the relative server-function URL and adds `x-tsr-serverFn` to every request.
- `src/start.ts:61–67` — native allowed headers omit `x-tsr-serverfn`.
- `src/routes/parent.subscription.tsx:171–183` — a blocked fetch is classified as `DEL-NET`.
