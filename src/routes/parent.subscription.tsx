import { createFileRoute } from "@tanstack/react-router";
import { AREAS } from "@/lib/content";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/parent/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription — Totland" },
      { name: "description", content: "Totland Premium: $2.99 a month or $19.99 a year for the full learning library. No ads, ever." },
      { property: "og:title", content: "Subscription — Totland" },
      { property: "og:description", content: "Affordable, ad-free premium access to the complete Totland learning library." },
    ],
  }),
  component: Subscription,
});

function Subscription() {
  const { profile, update } = useProfile();
  const premiumAreas = AREAS.filter((a) => !a.free);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-card p-5 wood-block">
        <div className="flex items-center justify-between">
          <h2 className="font-ui text-xl font-bold text-ink">Totland Premium</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              profile.premium ? "bg-moss/20 text-moss" : "bg-felt text-inksoft"
            }`}
          >
            {profile.premium ? "Active" : "Free plan"}
          </span>
        </div>
        <p className="mt-2 text-sm text-inksoft">
          Free includes the ABC, numbers, colors, shapes, memory and tracing worlds. Premium unlocks everything and every
          new release.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-felt p-4">
            <p className="font-ui text-2xl font-bold text-ink">$2.99</p>
            <p className="text-xs text-inksoft">per month</p>
          </div>
          <div className="rounded-2xl bg-amber/25 p-4 ring-1 ring-amber">
            <p className="font-ui text-2xl font-bold text-ink">$19.99</p>
            <p className="text-xs text-inksoft">per year · best value</p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5 text-sm text-ink">
          {premiumAreas.map((a) => (
            <li key={a.id}>
              {a.emoji} {a.title} — {a.activities} activities
            </li>
          ))}
          <li>🎁 New content every month, downloaded for offline play</li>
        </ul>

        <button
          type="button"
          onClick={() => update((p) => ({ ...p, premium: !p.premium }))}
          className="mt-5 w-full rounded-2xl bg-clay py-4 font-ui text-lg font-bold text-primary-foreground wood-block"
        >
          {profile.premium ? "Cancel premium (demo)" : "Start premium (demo)"}
        </button>
        <p className="mt-3 text-xs text-inksoft">
          Demo purchase only. In the iOS build this screen is backed by StoreKit 2 with restore-purchases and
          family-sharing support; no purchase is ever reachable from the child experience.
        </p>
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Privacy</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-inksoft">
          <li>· No child accounts, no chat, no social features, no external links in the child area.</li>
          <li>· Learning data is stored on this device only.</li>
          <li>· No third-party advertising or behavioural profiling.</li>
          <li>· Purchases, settings and links sit behind the parental gate.</li>
        </ul>
      </section>
    </div>
  );
}
