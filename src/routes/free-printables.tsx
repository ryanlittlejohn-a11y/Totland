import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LegalPage } from "@/components/LegalPage";
import { PrintSheetSvg } from "@/components/PrintSheetSvg";
import { L, getLang } from "@/lib/i18n";
import { isNativeApp } from "@/lib/native";
import {
  PAPERS,
  buildPages,
  drawItem,
  isFreeSheet,
  loadPaper,
  loadTraceStyle,
  savePaper,
  saveTraceStyle,
  sheetItems,
  sheetTitle,
  type PaperId,
  type SheetItem,
  type SheetType,
  type TraceStyle,
} from "@/lib/printables";

const PAGE_TITLE = "Free Printable Tracing Sheets for Preschoolers | Totland";
const H1 = "Free printable tracing sheets for preschoolers";
const DESCRIPTION =
  "Download free black-and-white tracing, connect-the-dots and drawing sheets for preschoolers. Made on your device, no sign-up, US Letter or A4.";
const PAGE_URL = "https://totland.app/free-printables";

export const Route = createFileRoute("/free-printables")({
  // Adult-facing page: inside the packaged iOS/Android app (Kids Category) go straight home.
  // Runs client-side in the app's SPA; on the website isNativeApp() is false.
  beforeLoad: () => {
    if (isNativeApp()) throw redirect({ to: "/", replace: true });
  },
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:image", content: "https://totland.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: PAGE_TITLE,
          description: DESCRIPTION,
          url: PAGE_URL,
          inLanguage: "en",
          primaryImageOfPage: "https://totland.app/og-image.jpg",
          isPartOf: { "@type": "WebSite", name: "Totland", url: "https://totland.app" },
          publisher: { "@type": "Organization", name: "Totland" },
        }),
      },
    ],
  }),
  component: FreePrintablesPage,
});

type Section = {
  id: Exclude<SheetType, "blank"> | "blank";
  en: string;
  es: string;
  descEn: string;
  descEs: string;
};

const SECTIONS: Section[] = [
  {
    id: "dots",
    en: "Connect the Dots",
    es: "Une los puntos",
    descEn: "Number dots to join in order, from 1 upward, to reveal a simple picture.",
    descEs: "Puntos numerados para unir en orden, del 1 en adelante, hasta ver un dibujo sencillo.",
  },
  {
    id: "lines",
    en: "Line Tracing",
    es: "Trazar líneas",
    descEn: "Straight and gentle lines to trace from the start dot with a pencil or crayon.",
    descEs: "Líneas rectas y suaves para trazar desde el punto de inicio con lápiz o crayón.",
  },
  {
    id: "shapes",
    en: "Trace Shapes",
    es: "Trazar figuras",
    descEn:
      "Big first shapes to trace, each with a start dot and an arrow showing which way to go.",
    descEs:
      "Primeras figuras grandes para trazar, cada una con un punto de inicio y una flecha que indica el camino.",
  },
  {
    id: "numbers",
    en: "Trace Numbers",
    es: "Trazar números",
    descEn: "Large numerals to trace in stroke order, with a start dot and arrow on each stroke.",
    descEs:
      "Números grandes para trazar en orden de trazo, con punto de inicio y flecha en cada trazo.",
  },
  {
    id: "blank",
    en: "Blank drawing page",
    es: "Hoja en blanco para dibujar",
    descEn: "A framed empty page for free drawing.",
    descEs: "Una hoja vacía con marco para dibujar libremente.",
  },
];

const TRACING: SheetType[] = ["lines", "shapes", "numbers"];
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

function FreePrintablesPage() {
  const navigate = useNavigate();
  const lang = getLang() === "es" ? "es" : "en";
  const [native, setNative] = useState(false);
  const [paper, setPaper] = useState<PaperId>("letter");
  const [traceStyle, setTraceStyle] = useState<TraceStyle>("dash");
  const [nameLine, setNameLine] = useState(true);
  const [childName, setChildName] = useState(""); // this print only; never saved
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPaper(loadPaper());
    setTraceStyle(loadTraceStyle());
    // Adult-facing page: never reachable inside the packaged iOS/Android app (Kids Category).
    if (isNativeApp()) {
      setNative(true);
      void navigate({ to: "/", replace: true });
    }
  }, [navigate]);

  // Only free sheets are ever listed, previewed or generated.
  const freeBySection = useMemo(
    () =>
      Object.fromEntries(
        SECTIONS.map((s) => [s.id, sheetItems(s.id).filter(isFreeSheet)]),
      ) as Record<string, SheetItem[]>,
    [],
  );

  const make = async (s: Section) => {
    const items = freeBySection[s.id];
    if (!items?.length || busy) return;
    setBusy(s.id);
    setError(false);
    try {
      const { renderPdf } = await import("@/lib/printables-pdf");
      const pages = buildPages(items, { paper, perPage: 1, nameLine, childName, lang, traceStyle });
      downloadBlob(await renderPdf(pages, paper), `totland-${s.id}-${paper}.pdf`);
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  };

  // Packaged app is a SPA (no SSR/hydration), so this is safe at first render; the website is unaffected.
  if (native || isNativeApp()) return null;

  const chip = (on: boolean) =>
    `rounded-xl border px-4 py-2 text-sm font-semibold ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"}`;
  const thumbLabel = (it: SheetItem) =>
    `${sheetTitle(it, lang)}${TRACING.includes(it.type) ? `, ${traceStyle === "dot" ? L("dotted outline", "contorno punteado") : L("dashed outline", "contorno discontinuo")}` : ""}`;

  return (
    <LegalPage
      title={L(H1, "Hojas gratis para trazar para preescolares")}
      updated="November 10, 2026"
    >
      <section>
        <p>
          {L(
            "Black-and-white tracing, connect-the-dots and drawing sheets for ages 2 to 6, free to download and print. Each PDF is made on your device when you press the button, so nothing is uploaded and there is nothing to sign up for. Choose US Letter or A4.",
            "Hojas en blanco y negro para trazar, unir puntos y dibujar, para niños de 2 a 6 años, gratis para descargar e imprimir. Cada PDF se crea en tu dispositivo al pulsar el botón, así que no se sube nada y no hay que registrarse. Elige Carta (EE. UU.) o A4.",
          )}
        </p>
      </section>

      <section
        aria-labelledby="setup-h"
        className="space-y-3 rounded-2xl border border-border bg-card p-4"
      >
        <h2 id="setup-h">{L("Page setup", "Configurar página")}</h2>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={L("Paper size", "Tamaño de papel")}
        >
          {(Object.keys(PAPERS) as PaperId[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={paper === p}
              className={chip(paper === p)}
              onClick={() => {
                setPaper(p);
                savePaper(p);
              }}
            >
              {p === "letter" ? L("US Letter", "Carta (EE. UU.)") : "A4"}
            </button>
          ))}
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={L(
            "Outline style for tracing sheets",
            "Estilo del trazo en las hojas de trazar",
          )}
        >
          {(["dash", "dot"] as TraceStyle[]).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={traceStyle === s}
              className={chip(traceStyle === s)}
              onClick={() => {
                setTraceStyle(s);
                saveTraceStyle(s);
              }}
            >
              {s === "dash" ? L("Dashed", "Discontinuo") : L("Dotted", "Punteado")}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            className="size-5"
            checked={nameLine}
            onChange={(e) => setNameLine(e.target.checked)}
          />
          {L("Name and date line", "Línea para nombre y fecha")}
        </label>
        {nameLine && (
          <label className="block text-sm font-semibold">
            {L(
              "Name to print (optional, not saved)",
              "Nombre para imprimir (opcional, no se guarda)",
            )}
            <input
              value={childName}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => setChildName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
        )}
      </section>

      {SECTIONS.map((s) => {
        const items = freeBySection[s.id] ?? [];
        return (
          <section key={s.id} aria-labelledby={`h-${s.id}`}>
            <h2 id={`h-${s.id}`}>{L(s.en, s.es)}</h2>
            <p>{L(s.descEn, s.descEs)}</p>
            <ul className="!mt-3 !list-none !space-y-0 !pl-0 grid grid-cols-3 gap-2">
              {items.map((it) => (
                <li key={it.id}>
                  <PrintSheetSvg
                    ops={drawItem(it, THUMB, lang, traceStyle).slice(1)}
                    w={200}
                    h={200}
                    className="block aspect-square w-full rounded-lg text-foreground ring-1 ring-border"
                    label={thumbLabel(it)}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => make(s)}
              className="mt-3 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy === s.id
                ? L("Making…", "Creando…")
                : L("Download PDF (free sheets)", "Descargar PDF (hojas gratis)")}
            </button>
          </section>
        );
      })}
      {error && (
        <p
          role="status"
          className="rounded-xl border border-border bg-card p-3 text-sm font-semibold"
        >
          {L(
            "Couldn't make the PDF. Please try again.",
            "No se pudo crear el PDF. Inténtalo de nuevo.",
          )}
        </p>
      )}

      <section>
        <h2>{L("Tips for little hands", "Consejos para manitas")}</h2>
        <ul>
          <li>
            {L(
              "Offer a chunky crayon or a short, thick pencil that is easy to hold.",
              "Ofrece un crayón grueso o un lápiz corto y gordo, fácil de sujetar.",
            )}
          </li>
          <li>
            {L(
              "Start at the dot and follow the arrow; slow and wobbly is fine.",
              "Empieza en el punto y sigue la flecha; despacio y con altibajos está bien.",
            )}
          </li>
          <li>
            {L(
              "Keep sessions short and stop while it is still fun.",
              "Haz sesiones cortas y para mientras todavía sea divertido.",
            )}
          </li>
          <li>
            {L(
              "Sit together, trace one with them first, and cheer on the trying.",
              "Siéntate a su lado, traza una primero y celebra el esfuerzo.",
            )}
          </li>
          <li>
            {L(
              "Try the dotted outline for a lighter guide, or the dashed one for a bolder guide.",
              "Prueba el contorno punteado para una guía más ligera, o el discontinuo para una más marcada.",
            )}
          </li>
          <li>
            {L(
              "Print on plain paper; a clipboard or taped corners keep the sheet from sliding.",
              "Imprime en papel normal; una tabla con pinza o las esquinas con cinta evitan que la hoja se mueva.",
            )}
          </li>
        </ul>
      </section>

      <section>
        <h2>{L("Want more sheets?", "¿Quieres más hojas?")}</h2>
        <p>
          {L(
            "Free games plus optional Premium. Totland Premium unlocks the full printable sets and the app games.",
            "Juegos gratis y Premium opcional. Totland Premium desbloquea los juegos de la app y todas las colecciones de hojas imprimibles.",
          )}{" "}
          <Link to="/parent/subscription" search={{ checkout: undefined }}>
            {L("See Premium", "Ver Premium")}
          </Link>
        </p>
      </section>

      <section>
        <h2>{L("Using these sheets", "Cómo usar estas hojas")}</h2>
        <p>
          {L(
            "Free for home and classroom use. Please don't resell or redistribute the PDFs; if you share, link to this page.",
            "Gratis para usar en casa y en el aula. Por favor, no revendas ni redistribuyas los PDF; si los compartes, enlaza a esta página.",
          )}
        </p>
      </section>
    </LegalPage>
  );
}
