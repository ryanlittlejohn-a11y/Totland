import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AREAS, LETTERS } from "@/lib/content";
import { GAME_COUNT, STORY_COUNT, FLASH_CARD_COUNT, FLASH_CARD_COUNT_ES } from "@/lib/library-counts";
import {
  masteryLabel,
  masteryScore,
  recommendations,
  skillOf,
  strengths,
  updateChild,
  useFamily,
  useProfile,
  tracingProgressOf,
} from "@/lib/profile";
import { setNarration } from "@/lib/speech";
import { formatNarrationLog } from "@/lib/narration-log";

/** Read-only, on-device narration diagnostics for testers; nothing is sent. */
function NarrationDiagnostics() {
  const [log, setLog] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <details
      className="rounded-xl bg-felt p-3 text-xs text-inksoft ring-1 ring-border"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) setLog(formatNarrationLog());
      }}
    >
      <summary className="cursor-pointer font-semibold text-ink">{L("Narration diagnostics", "Diagnóstico de la voz")}</summary>
      <p className="mt-2">{L("Kept on this device only. Copy it to send to us if voices go quiet.", "Se guarda solo en este dispositivo. Cópialo y envíanoslo si las voces dejan de sonar.")}</p>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words" aria-label={L("Narration log", "Registro de la voz")}>
        {log || L("No narration events yet.", "Todavía no hay eventos de voz.")}
      </pre>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-clay px-3 py-1.5 font-semibold text-primary-foreground"
          onClick={() => {
            const text = formatNarrationLog();
            setLog(text);
            void navigator.clipboard?.writeText(text).then(
              () => setCopied(true),
              () => setCopied(false),
            );
          }}
        >
          {copied ? L("Copied", "Copiado") : L("Copy", "Copiar")}
        </button>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 font-semibold text-ink ring-1 ring-border"
          onClick={() => setLog(formatNarrationLog())}
        >
          {L("Refresh", "Actualizar")}
        </button>
      </div>
    </details>
  );
}
import { setMusicVolume } from "@/lib/music";
import { L, setLang, title as tTitle, type Lang } from "@/lib/i18n";

const MASTERY_ES: Record<string, string> = { Mastered: "Dominado", Strong: "Muy bien", Progressing: "Avanzando", Practicing: "Practicando", Beginning: "Empezando" };
const REASON_ES: Record<string, string> = { "A great first step": "Un gran primer paso", "Counting to 10": "Contar hasta 10", "Ready for new vocabulary": "Listo para palabras nuevas" };
const reasonText = (r: string) => L(r, REASON_ES[r] ?? r.replace("% so far — more practice helps", "% hasta ahora: practicar más ayuda"));
const areaName = (id: string) => tTitle(AREAS.find((a) => a.id === id)?.title ?? id);
import { FREE_WORD_FINDS, WORD_FIND_THEMES } from "@/lib/wordfinds";
import { GetTheAppCard } from "@/components/GetTheAppCard";


export const Route = createFileRoute("/parent/")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — Totland" },
      { name: "description", content: "See letters and numbers mastered, time spent learning, strengths, and recommended next activities." },
      { property: "og:title", content: "Parent Dashboard — Totland" },
      { property: "og:description", content: "Private, on-device progress tracking for your child's early learning." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, update } = useProfile();
  const { children, activeId } = useFamily();
  const [selId, setSelId] = useState<string | null>(null);
  const selected = children.find((c) => c.id === (selId ?? activeId)) ?? children[0] ?? null;
  const stats = selected ? selected.profile : profile;
  const letters = skillOf(stats, "letters");
  const numbers = skillOf(stats, "numbers");
  const sevenDayDates = new Set(
    Array.from({ length: 7 }, (_, offset) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - offset);
      return date.toISOString().slice(0, 10);
    }),
  );
  const thisWeek = stats.days
    .filter((day) => sevenDayDates.has(day.date))
    .reduce(
      (totals, day) => ({ minutes: totals.minutes + day.minutes, games: totals.games + day.games }),
      { minutes: 0, games: 0 },
    );
  const totalAttempts = Object.values(stats.skills).reduce((n, s) => n + s.attempts, 0);
  const totalCorrect = Object.values(stats.skills).reduce((n, s) => n + s.correct, 0);
  const overall = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const wordFindsDone = (stats.wordFinds ?? []).length;
  const traced = tracingProgressOf(stats);



  return (
    <div className="space-y-4">
      <h1 className="px-1 font-ui text-2xl font-bold text-ink">{L("Parent Dashboard", "Panel para adultos")}</h1>
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelId(c.id)}
              className={`shrink-0 rounded-xl px-4 py-2 font-ui text-sm font-semibold ${
                selected?.id === c.id ? "bg-night text-cream" : "bg-card text-ink"
              }`}
            >
              {c.profile.outfit} {c.profile.childName}
              {c.id === activeId ? L(" · playing", " · jugando") : ""}
            </button>
          ))}
        </div>
      )}
      <Link to="/parent/printables" className="flex items-center gap-3 rounded-3xl bg-card p-4 wood-block">
        <span className="text-2xl" aria-hidden>🖨️</span>
        <span className="flex-1">
          <span className="block font-ui font-bold text-ink">{L("Teachers & printables", "Docentes e imprimibles")}</span>
          <span className="block text-xs text-inksoft">{L("Make black-and-white activity sheets on this device", "Crea hojas de actividades en blanco y negro en este dispositivo")}</span>
        </span>
        <span className="text-xs font-semibold text-ink">{L("Open", "Abrir")}</span>
      </Link>
      <section className="rounded-3xl bg-night p-5 text-cream wood-block">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold">{L("This week", "Esta semana")}</p>
          <p className="text-sm text-cream/50">
            {stats.childName} · {L("age", "edad")} {stats.age}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: L("Time", "Tiempo"), value: `${thisWeek.minutes}m` },
            { label: L("Games", "Juegos"), value: thisWeek.games },
            { label: L("All-time accuracy", "Aciertos totales"), value: `${overall}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-cream/5 p-3 ring-1 ring-cream/10">
              <p className="text-[11px] text-cream/50">{s.label}</p>
              <p className="text-lg font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cream/70">{L("Letters mastered", "Letras dominadas")}</span>
            <span className="font-semibold">{letters.mastered.length} / 26</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream/10">
            <div className="h-full rounded-full bg-moss" style={{ width: `${(letters.mastered.length / 26) * 100}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {LETTERS.map((l) => (
              <span
                key={l}
                className={`grid size-6 place-items-center rounded-md text-[11px] font-semibold ${
                  letters.mastered.includes(l) ? "bg-moss/25 text-moss" : "bg-cream/10 text-cream/40"
                }`}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cream/70">{L("Letters traced", "Letras trazadas")}</span>
            <span className="font-semibold">{traced.uppercase.length} / 26 {L("uppercase", "mayúsculas")} · {traced.lowercase.length} / 26 {L("lowercase", "minúsculas")}</span>
          </div>
          <div className="mt-2 grid grid-cols-13 gap-1 max-sm:grid-cols-9">
            {LETTERS.map((letter) => {
              const upper = traced.uppercase.includes(letter);
              const lower = traced.lowercase.includes(letter);
              return (
                <span key={letter} className="grid min-h-10 place-items-center rounded-md bg-cream/10 px-0.5 text-[10px] font-semibold" aria-label={L(`${letter}: uppercase ${upper ? "traced" : "not traced"}, lowercase ${lower ? "traced" : "not traced"}`, `${letter}: mayúscula ${upper ? "trazada" : "sin trazar"}, minúscula ${lower ? "trazada" : "sin trazar"}`)}>
                  <span className={upper ? "text-moss" : "text-cream/35"}>{letter}</span>
                  <span className={lower ? "text-sky" : "text-cream/35"}>{letter.toLowerCase()}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cream/70">{L("Numbers recognised", "Números reconocidos")}</span>
            <span className="font-semibold">{numbers.mastered.length} / 20</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream/10">
            <div className="h-full rounded-full bg-sky" style={{ width: `${(numbers.mastered.length / 20) * 100}%` }} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {strengths(stats).map((s) => (
            <span key={s} className="rounded-full bg-moss/15 px-2.5 py-1 text-[11px] font-medium text-moss">
              {L("Strength", "Punto fuerte")} · {areaName(s)}
            </span>
          ))}
          {recommendations(stats).map((r) => (
            <span key={r.skill} className="rounded-full bg-sky/15 px-2.5 py-1 text-[11px] font-medium text-sky">
              {L("Practice", "Practicar")} · {areaName(r.skill)}
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium text-cream/60">{L("Recommended next", "Lo siguiente que recomendamos")}</p>
        {recommendations(stats).map((r) => (
          <Link
            key={r.skill}
            to="/play/$area"
            params={{ area: r.skill }}
            className="mt-2 flex items-center justify-between rounded-xl bg-cream/5 px-3 py-2.5 ring-1 ring-cream/10"
          >
            <span className="text-[13px] font-medium text-cream/90">
              {areaName(r.skill)} — {reasonText(r.reason)}
            </span>
            <span className="text-xs font-semibold text-sky">{L("Open", "Abrir")}</span>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">{L("Per-area mastery", "Dominio por área")}</h2>
        <div className="mt-3 space-y-2">
          {AREAS.map((a) => {
            const s = skillOf(stats, a.id);
            const mastery = masteryScore(s);
            // Flash Cards and Storybooks have no right/wrong answers, so show
            // an honest session count instead of a mastery bar.
            if (a.id === "flashcards" || a.id === "stories") {
              const sessions = stats.favorites[a.id] ?? 0;
              return (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm font-medium text-ink">
                    {a.emoji} {tTitle(a.title)}
                  </span>
                  <span className="flex-1 text-xs text-inksoft">{L("No right or wrong answers", "Sin respuestas correctas o incorrectas")}</span>
                  <span className="w-20 shrink-0 text-right text-xs font-semibold text-inksoft">
                    {sessions > 0
                      ? L(`${sessions} ${sessions === 1 ? "session" : "sessions"}`, `${sessions} ${sessions === 1 ? "sesión" : "sesiones"}`)
                      : L("Ready to play", "Listo para jugar")}
                  </span>
                </div>
              );
            }
            return (
              <div key={a.id} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-sm font-medium text-ink">
                  {a.emoji} {tTitle(a.title)}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-felt">
                  <div className="h-full rounded-full bg-clay" style={{ width: `${mastery}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right text-xs font-semibold text-inksoft">
                  {L(masteryLabel(mastery), MASTERY_ES[masteryLabel(mastery)] ?? masteryLabel(mastery))}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm font-medium text-ink">
            <span>🔍 {L("Word Finds completed", "Sopas de letras completadas")}</span>
            <span className="text-xs text-inksoft">
              {wordFindsDone} / {WORD_FIND_THEMES.length}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-felt">
            <div
              className="h-full rounded-full bg-sky"
              style={{ width: `${(wordFindsDone / WORD_FIND_THEMES.length) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-inksoft">
            {L(
              `The first ${FREE_WORD_FINDS} puzzles are free and can be replayed; the rest unlock with Premium.`,
              `Las primeras ${FREE_WORD_FINDS} sopas de letras son gratis y se pueden repetir; las demás se desbloquean con Premium.`,
            )}
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">{L("Settings", "Ajustes")}</h2>
        <div className="mt-3 space-y-3">
          <label className="flex items-center justify-between text-sm font-medium text-ink">
            {L("Child's name", "Nombre del peque")}
            <input
              value={stats.childName}
              onChange={(e) =>
                selected
                  ? updateChild(selected.id, (p) => ({ ...p, childName: e.target.value }))
                  : update((p) => ({ ...p, childName: e.target.value }))
              }
              className="w-44 rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
            />
          </label>
          <label className="flex items-center justify-between text-sm font-medium text-ink">
            {L("Age", "Edad")}
            <input
              type="number"
              min={2}
              max={6}
              value={stats.age}
              onChange={(e) =>
                selected
                  ? updateChild(selected.id, (p) => ({ ...p, age: Number(e.target.value) }))
                  : update((p) => ({ ...p, age: Number(e.target.value) }))
              }
              className="w-44 rounded-xl bg-felt px-3 py-2 outline-none ring-1 ring-border"
            />
          </label>

          <div className="flex items-center justify-between text-sm font-medium text-ink">
            {L("App language", "Idioma de la app")}
            <div className="flex gap-2">
              {(
                [
                  ["en", "English"],
                  ["es", "Español"],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLang(code as Lang);
                    update((p) => ({ ...p, language: code as Lang }));
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-border ${
                    profile.language === code ? "bg-clay text-primary-foreground" : "bg-felt text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {(
            [
              ["narration", L("Voice narration", "Narración con voz")],
              ["sfx", L("Sound effects", "Efectos de sonido")],
              ["music", L("Background music", "Música de fondo")],
              ["reducedMotion", L("Reduced motion", "Menos movimiento")],
              ["highContrast", L("High contrast", "Alto contraste")],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between text-sm font-medium text-ink">
              {label}
              <input
                type="checkbox"
                checked={Boolean(profile[key])}
                onChange={(e) => {
                  const on = e.target.checked;
                  update((p) => ({ ...p, [key]: on }));
                  if (key === "narration") setNarration(on);
                  // Music follows the saved switch on kid screens only (MusicPlayer).
                }}
                className="size-6 accent-[oklch(0.68_0.148_32)]"
              />
            </label>
          ))}
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-ink">
            <span>
              {L("Free stroke order in tracing games", "Orden libre de trazos")}
              <span className="block text-xs font-normal text-inksoft">
                {L("Off: strokes must be traced in the numbered order.", "Apagado: los trazos se hacen en el orden numerado.")}
              </span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(stats.freeTraceOrder)}
              onChange={(e) => {
                const on = e.target.checked;
                selected
                  ? updateChild(selected.id, (p) => ({ ...p, freeTraceOrder: on }))
                  : update((p) => ({ ...p, freeTraceOrder: on }));
              }}
              className="size-6 shrink-0 accent-[oklch(0.68_0.148_32)]"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-ink">
            <span>
              {L("Calm mode", "Modo calma")}
              <span className="block text-xs font-normal text-inksoft">
                {L(
                  "For this child: no animations or music, one soft sound, and games wait for “Next”.",
                  "Para este niño: sin animaciones ni música, un sonido suave, y los juegos esperan a “Siguiente”.",
                )}
              </span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(stats.calmMode)}
              onChange={(e) => {
                const on = e.target.checked;
                selected
                  ? updateChild(selected.id, (p) => ({ ...p, calmMode: on }))
                  : update((p) => ({ ...p, calmMode: on }));
              }}
              className="size-6 shrink-0 accent-[oklch(0.68_0.148_32)]"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            <span className="flex items-center justify-between">
              {L("Music volume", "Volumen de la música")}
              <span className="text-xs font-normal text-inksoft">{Math.round((profile.musicVolume ?? 1) * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round((profile.musicVolume ?? 1) * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                update((p) => ({ ...p, musicVolume: v }));
                setMusicVolume(v);
              }}
              className="mt-1 w-full accent-[oklch(0.68_0.148_32)]"
            />
          </label>
          <NarrationDiagnostics />
        </div>
        <p className="mt-4 text-xs text-inksoft">
          {L(
            `${GAME_COUNT} games, ${WORD_FIND_THEMES.length} word finds, ${STORY_COUNT} storybooks and ${FLASH_CARD_COUNT} English / ${FLASH_CARD_COUNT_ES} Spanish flash cards are stored on this device. Progress stays on this device unless you sign in to sync your family profiles — there is no child account, no ads and no tracking.`,
            `${GAME_COUNT} juegos, ${WORD_FIND_THEMES.length} sopas de letras, ${STORY_COUNT} cuentos y ${FLASH_CARD_COUNT_ES} tarjetas en español / ${FLASH_CARD_COUNT} en inglés están guardados en este dispositivo. El progreso se queda en este dispositivo salvo que inicies sesión para sincronizar los perfiles de tu familia. No hay cuenta infantil, ni anuncios, ni rastreo.`,
          )}
        </p>
      </section>

      <GetTheAppCard />

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">{L("Help & legal", "Ayuda y aspectos legales")}</h2>
        <p className="mt-1 text-sm text-inksoft">
          {L("Questions, billing help or feedback? Email", "¿Preguntas, ayuda con pagos o comentarios? Escribe a")}{" "}
          <a href="mailto:Support@totland.app" className="font-semibold text-clay underline">
            Support@totland.app
          </a>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { to: "/contact", label: L("Contact us", "Contacto") },
            { to: "/terms", label: L("Terms", "Condiciones") },
            { to: "/privacy", label: L("Privacy", "Privacidad") },
            { to: "/refund", label: L("Refunds", "Reembolsos") },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-xl bg-felt px-3 py-2 font-ui text-sm font-semibold text-ink ring-1 ring-border"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
