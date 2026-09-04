import { createFileRoute } from "@tanstack/react-router";
import { RIGHTS_RECORDS, blockedRecords, shippableRecords, type RightsRecord } from "@/lib/rights";

export const Route = createFileRoute("/parent/rights")({
  head: () => ({
    meta: [
      { title: "Content Rights Review — Totland" },
      { name: "description", content: "Audit every asset in the app: licence, commercial-use permission, attribution and verification date." },
      { property: "og:title", content: "Content Rights Review — Totland" },
      { property: "og:description", content: "A rights-verification dashboard so nothing ships without a clear commercial licence." },
    ],
  }),
  component: RightsPage,
});

const yesNo = (v: boolean | "unknown") => (v === true ? "Yes" : v === false ? "No" : "Unknown");

function Row({ r }: { r: RightsRecord }) {
  const blocked = r.status === "RIGHTS REVIEW" || r.referenceOnly;
  return (
    <div className={`rounded-2xl p-4 ${blocked ? "bg-destructive/10 ring-1 ring-destructive/30" : "bg-felt"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-ui font-bold text-ink">{r.title}</p>
          <p className="text-xs text-inksoft">
            {r.creator} · {r.source}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            blocked ? "bg-destructive/20 text-destructive" : "bg-moss/20 text-moss"
          }`}
        >
          {r.status}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-inksoft">
        <div>Licence: <span className="text-ink">{r.license}</span></div>
        <div>Copyright: <span className="text-ink">{r.copyright}</span></div>
        <div>Commercial use: <span className="text-ink">{yesNo(r.commercialUse)}</span></div>
        <div>Modification: <span className="text-ink">{yesNo(r.modification)}</span></div>
        <div>Attribution: <span className="text-ink">{r.attributionRequired ? r.attributionText ?? "Required" : "Not required"}</span></div>
        <div>Verified: <span className="text-ink">{r.verified}</span></div>
        <div className="col-span-2 break-all">Source URL: <span className="text-ink">{r.url}</span></div>
        {r.proofUrl && <div className="col-span-2 break-all">Proof: <span className="text-ink">{r.proofUrl}</span></div>}
        {r.notes && <div className="col-span-2">Notes: <span className="text-ink">{r.notes}</span></div>}
      </dl>
    </div>
  );
}

function RightsPage() {
  const blocked = blockedRecords();

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-night p-5 text-cream wood-block">
        <h2 className="font-ui text-lg font-bold">Rights review</h2>
        <p className="mt-2 text-sm text-cream/70">
          Every asset must have a verified licence permitting commercial use and modification inside a paid app. Items in
          RIGHTS REVIEW or marked reference-only are blocked from the production build.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-cream/5 p-3">
            <p className="text-xl font-semibold">{RIGHTS_RECORDS.length}</p>
            <p className="text-[11px] text-cream/50">Tracked</p>
          </div>
          <div className="rounded-xl bg-cream/5 p-3">
            <p className="text-xl font-semibold text-moss">{shippableRecords().length}</p>
            <p className="text-[11px] text-cream/50">Clear to ship</p>
          </div>
          <div className="rounded-xl bg-cream/5 p-3">
            <p className="text-xl font-semibold text-amber">{blocked.length}</p>
            <p className="text-[11px] text-cream/50">Blocked</p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-3xl bg-card p-4 wood-block">
        {RIGHTS_RECORDS.map((r) => (
          <Row key={r.id} r={r} />
        ))}
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Reference only</h2>
        <p className="mt-1 text-sm text-inksoft">
          Useful for research, never shipped: CC BY-NC material, "free for educational use" packs that exclude commercial
          apps, and anything whose provenance cannot be verified.
        </p>
      </section>
    </div>
  );
}
