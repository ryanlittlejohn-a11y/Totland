# Fix the iPhone "Purchases.then()" error and the false "needs internet" screen

## Findings

### 1. "Purchases.then() is not implemented on ios" — root cause confirmed
`configurePurchases()` is a real async function, so it always returns a real Promise. That part is fine. The bug is one level down, in the `plugin()` helper in `src/lib/purchases.ts`:

```ts
async function plugin() {
  const mod = await import("@revenuecat/purchases-capacitor");
  return mod.Purchases;   // <- returning the plugin proxy from an async function
}
```

A Capacitor plugin object is a proxy that answers *any* property name with a native-method stub, including `then`. When an async function returns the proxy, JavaScript sees a `then` and treats it like a promise. It calls `Purchases.then(...)`, and the bridge rejects with "then() is not implemented". Every RevenueCat call in the app goes through `plugin()`, so none of them work on the device right now. `src/lib/storage.ts` has the same pattern (`preferences()` returns `mod.Preferences`). That explains why storage fell back to the web-storage safety path. The Network plugin code is safe: it destructures from the module and never returns the proxy.

### 2. Why the rejections reached the overlay
- The error at about 38ms comes from the same `then` probe. It fires before any `withTimeout` handler exists for that inner promise.
- `withTimeout` itself works: it catches the outer failure and falls back to "not premium" / web storage. But the proxy's rejected `then` call creates extra promises inside Capacitor that nothing awaits. Those surface as the two unhandled rejections at about 50ms, one from Purchases and one from Preferences.
- They go away once the proxy is no longer returned from an async function.

### 3. The "needs internet" screen is a false negative (confirmed)
On native, OfflineGate checks two things: the Network plugin, then a ping to `https://totland.lovable.app/api/public/diag`. I tested that ping just now:
- `totland.lovable.app` returns a **302 redirect to `https://totland.app`** because the custom domain is primary.
- Browsers and WebViews reset the request's origin to `null` after a cross-site redirect. `totland.app` then answers without the permission header the app needs, so the WebView blocks the reply. The ping always "fails", even on good LTE or Wi-Fi.
- Requested directly with the app's origin, `totland.app` answers 200 with the correct permission header.

So the device was online. The check is wrong. The same redirect also breaks every other backend call from the app (sign-in sync, subscription check, voice clips), because they all use the same default address.

### 4. Should this device have been premium?
Probably not. Unless the tester bought Premium in TestFlight, this is a free device. For a free device, "needs internet when offline" is the intended behaviour. But it was **not** offline. The screen appeared only because of the broken ping in finding 3. The Purchases crash had no effect here: even a premium purchase could not have been detected, because every RevenueCat call was failing. **Both are real bugs.** Neither one is expected free-tier behaviour.

## Proposed fix

1. **`src/lib/purchases.ts`**: make `plugin()` return a wrapper (`return { Purchases: mod.Purchases }`) and update the call sites to destructure. The proxy is then never resolved through a promise. RevenueCat logic stays the same.
2. **`src/lib/storage.ts`**: same wrapper change for `preferences()`, so the app really uses phone storage instead of the fallback.
3. **`src/lib/native.ts`**: change the default backend address to `https://totland.app` (the primary domain, no redirect). This fixes the ping and all other app-to-backend calls. `VITE_NATIVE_API_ORIGIN` can still override it.
4. **`src/components/OfflineGate.tsx`**: small hardening. If the Network plugin says "connected" but the ping fails, retry once before showing the screen. Also treat any HTTP response as "internet reachable", even an error status. The screen then only means real disconnection. Premium bypass is unchanged.
5. Keep the diagnostic overlay for one more TestFlight build to confirm there are no errors left, then remove it in a follow-up.

## Verification
- Typecheck and build; check that `dist-app` contains the new default backend address.
- A quick script with a fake plugin proxy (answers any property, rejects on `then`) confirms `configurePurchases`, `storeEntitlementActive` and storage hydration no longer hit `then`.
- Confirm `https://totland.app/api/public/diag` returns 200 with the app-origin permission header (already true today).
- Website unchanged: no web code path uses these helpers or the native address. Parental gate, Paddle, premium rules, and RevenueCat purchase logic are not touched.

## Changed files (planned)
- `src/lib/purchases.ts`
- `src/lib/storage.ts`
- `src/lib/native.ts`
- `src/components/OfflineGate.tsx`
- `roadmap.md`

## Outside steps
- Run `bun run sync:app`, then start a new Codemagic build and test on the phone again.
