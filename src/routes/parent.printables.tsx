import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { L, getLang } from "@/lib/i18n";
import { useVerifiedPremiumState } from "@/lib/profile";
import { isNativeApp } from "@/lib/native";
import { PrintSheetSvg } from "@/components/PrintSheetSvg";
import {
  PAPERS,
  buildPages,
  drawItem,
  isFreeSheet,
  isSheetLocked,
  loadPaper,
  pageCount,
  perPageOptions,
  savePaper,
  sheetItems,
  type PaperId,
  type SheetItem,
  type SheetType,
} from "@/lib/printables";

export const Route = createFileRoute("/parent/printables")({
  head: () => ({
    meta: [
      { title: "Teachers & Printables — Totland" },
      { name: "description", content: "Grown-ups only: make printable connect-the-dots, line tracing and drawing sheets on this device." },
      { property: "og:title", content: "Teachers & Printables — Totland" },
      { property: "og:description", content: "Printable activity sheets made on your device, behind the parental gate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrintablesPage,
});

const TYPES: { id: SheetType; en: string; es: string }[] = [
  { id: "dots", en: "Connect the Dots", es: "Une los puntos" },
  { id: "lines", en: "Line Tracing", es: "Trazar líneas" },
  { id: "blank", en: "Blank drawing page", es: "Hoja en blanco para dibujar" },
];

const THUMB = { x: 0, y: 0, w: 200, h: 200 };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function PrintablesPage() {
  const { premium } = useVerifiedPremiumState();
  const lang = getLang() === "es" ? "es" : "en";
  const [type, setType] = useState<SheetType>("dots");
  const [selected, setSelected] = useState<string[]>([]);
  const [paper, setPaper] = useState<PaperId>("letter");
  const [perPage, setPerPage] = useState<1 | 2>(1);
  const [nameLine, setNameLine] = useState(true);
  const [childName, setChildName] = useState(""); // this print only — never saved
  const [busy, setBusy] = useState(false);
  const [pdf, setPdf] = useState<{ blob: Blob; name: string; url: string } | null>(null);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setPaper(loadPaper());
    setNative(isNativeApp());
  }, []);

  const items = useMemo(() => sheetItems(type), [type]);
  const chosen = items.filter((i) => selected.includes(i.id) && !isSheetLocked(i, premium));
  const effectivePer = perPageOptions(type).includes(perPage) ? perPage : 1;
  const pages = pageCount(chosen.length, effectivePer);
  const opts = { paper, perPage: effectivePer, nameLine, childName, lang } as const;
  const preview = useMemo(() => (chosen.length ? buildPages(chosen.slice(0, effectivePer), opts)[0] : null), [chosen.map((c) => c.id).join(), paper, effectivePer, nameLine, childName, lang]);

  useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf.url); }, [pdf]);
  const resetPdf = () => setPdf(null);

  const pickType = (t: SheetType) => {
    setType(t);
    setSelected(t === "blank" ? ["blank"] : []);
    resetPdf();
  };
  const toggle = (it: SheetItem) => {
    if (isSheetLocked(it, premium)) return;
    setSelected((s) => (s.includes(it.id) ? s.filter((x) => x !== it.id) : [...s, it.id]));
    resetPdf();
  };
  const unlocked = items.filter((i) => !isSheetLocked(i, premium));

  const make = async () => {
    if (native || !chosen.length) return;
    setBusy(true);
    try {
      const { renderPdf } = await import("@/lib/printables-pdf");
      const blob = await renderPdf(buildPages(chosen, opts), paper);
      const name = `totland-${type}-${paper}.pdf`;
      setPdf({ blob, name, url: URL.createObjectURL(blob) });
    } finally {
      setBusy(false);
    }
  };

  const chip = (on: boolean) => `rounded-xl px-4 py-2 font-ui text-sm font-semibold ${on ? "bg-night text-cream" : "bg-card text-ink wood-block"}`;

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="font-ui text-2xl font-bold text-ink">{L("Teachers & printables", "Docentes e imprimibles")}</h1>
        <p className="mt-1 text-sm text-inksoft">
          {L(
            "Black-and-white sheets made on this device. Nothing is uploaded. The first 3 of each kind are free; the blank page is always free.",
            "Hojas en blanco y negro creadas en este dispositivo. No se sube nada. Las 3 primeras de cada tipo son gratis; la hoja en blanco siempre es gratis.",
          )}
        </p>
      </div>

      <section aria-label={L("Sheet type", "Tipo de hoja")} className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => pickType(t.id)} className={chip(type === t.id)}>
            {L(t.en, t.es)}
          </button>
        ))}
      </section>

      {type !== "blank" && (
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-ui text-lg font-bold text-ink">{L("Choose sheets", "Elige las hojas")}</h2>
            <button type="button" className="text-sm font-semibold text-ink underline" onClick={() => { setSelected(selected.length === unlocked.length ? [] : unlocked.map((i) => i.id)); resetPdf(); }}>
              {selected.length === unlocked.length ? L("Clear all", "Quitar todo") : L("Select all", "Elegir todo")}
            </button>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {items.map((it, idx) => {
              const locked = isSheetLocked(it, premium);
              const on = selected.includes(it.id) && !locked;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={locked}
                    onClick={() => toggle(it)}
                    aria-label={`${idx + 1}. ${locked ? L("Locked, Premium", "Bloqueada, Premium") : isFreeSheet(it) ? L("Free", "Gratis") : ""}`}
                    className={`relative block w-full overflow-hidden rounded-xl text-ink ring-2 ${on ? "ring-night" : "ring-transparent"} ${locked ? "opacity-50" : ""}`}
                  >
                    <PrintSheetSvg ops={drawItem(it, THUMB, lang).slice(1)} w={200} h={200} className="block aspect-square w-full" label="" />
                    <span className="absolute left-1 top-1 rounded-md bg-card px-1.5 text-[11px] font-bold">{idx + 1}</span>
                    {locked ? (
                      <span className="absolute right-1 top-1 rounded-md bg-night px-1.5 text-[11px] font-bold text-cream">🔒</span>
                    ) : isFreeSheet(it) && !premium ? (
                      <span className="absolute right-1 top-1 rounded-md bg-moss px-1.5 text-[11px] font-bold text-cream">{L("Free", "Gratis")}</span>
                    ) : null}
                    {on && <span className="absolute bottom-1 right-1 rounded-md bg-night px-1.5 text-[11px] font-bold text-cream">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {!premium && (
            <p className="mt-3 text-sm text-inksoft">
              {L("Locked sheets unlock with Premium.", "Las hojas bloqueadas se desbloquean con Premium.")}{" "}
              <Link to="/parent/subscription" search={{ checkout: undefined }} className="font-semibold text-ink underline">{L("See Premium", "Ver Premium")}</Link>
            </p>
          )}
        </section>
      )}

      <section className="space-y-3 rounded-2xl bg-card p-4 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">{L("Page setup", "Configurar página")}</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label={L("Paper size", "Tamaño de papel")}>
          {(Object.keys(PAPERS) as PaperId[]).map((p) => (
            <button key={p} type="button" aria-pressed={paper === p} className={chip(paper === p)} onClick={() => { setPaper(p); savePaper(p); resetPdf(); }}>
              {p === "letter" ? L("US Letter", "Carta (EE. UU.)") : "A4"}
            </button>
          ))}
        </div>
        {perPageOptions(type).length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label={L("Sheets per page", "Hojas por página")}>
            {perPageOptions(type).map((n) => (
              <button key={n} type="button" aria-pressed={effectivePer === n} className={chip(effectivePer === n)} onClick={() => { setPerPage(n); resetPdf(); }}>
                {n === 1 ? L("1 per page", "1 por página") : L("2 per page", "2 por página")}
              </button>
            ))}
          </div>
        )}
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input type="checkbox" className="size-5" checked={nameLine} onChange={(e) => { setNameLine(e.target.checked); resetPdf(); }} />
          {L("Name and date line", "Línea para nombre y fecha")}
        </label>
        {nameLine && (
          <label className="block text-sm font-semibold text-ink">
            {L("Name to print (optional, not saved)", "Nombre para imprimir (opcional, no se guarda)")}
            <input value={childName} maxLength={40} autoComplete="off" onChange={(e) => { setChildName(e.target.value); resetPdf(); }} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 text-ink ring-1 ring-ink/15" />
          </label>
        )}
      </section>

      {preview && (
        <section>
          <h2 className="mb-2 px-1 font-ui text-lg font-bold text-ink">{L("Preview of page 1", "Vista previa de la página 1")}</h2>
          <PrintSheetSvg ops={preview.ops} w={PAPERS[paper].w} h={PAPERS[paper].h} className="mx-auto block w-full max-w-[360px] rounded-lg text-ink shadow ring-1 ring-ink/10" label={L("Page preview", "Vista previa")} />
        </section>
      )}

      <section className="space-y-2 rounded-2xl bg-night p-4 text-cream">
        <p className="text-sm">
          {chosen.length
            ? L(`${chosen.length} ${chosen.length === 1 ? "sheet" : "sheets"} · ${pages} ${pages === 1 ? "page" : "pages"}`, `${chosen.length} ${chosen.length === 1 ? "hoja" : "hojas"} · ${pages} ${pages === 1 ? "página" : "páginas"}`)
            : L("Pick at least one sheet.", "Elige al menos una hoja.")}
        </p>
        {native ? (
          <p className="rounded-xl bg-cream/10 p-3 text-sm font-semibold" role="status">
            {L("Coming in the next app update.", "Llegará en la próxima actualización de la app.")}
          </p>
        ) : pdf ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-xl bg-cream px-4 py-3 font-ui font-bold text-night" onClick={() => downloadBlob(pdf.blob, pdf.name)}>
              {L("Download PDF", "Descargar PDF")}
            </button>
            <button type="button" className="rounded-xl bg-cream/15 px-4 py-3 font-ui font-bold text-cream" onClick={() => window.open(pdf.url, "_blank")}>
              {L("Open to print", "Abrir para imprimir")}
            </button>
          </div>
        ) : (
          <button type="button" disabled={!chosen.length || busy} onClick={make} className="w-full rounded-xl bg-cream py-3 font-ui font-bold text-night disabled:opacity-50">
            {busy ? L("Making…", "Creando…") : L("Make PDF", "Crear PDF")}
          </button>
        )}
      </section>
    </div>
  );
}
