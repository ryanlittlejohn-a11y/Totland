import { createFileRoute } from "@tanstack/react-router";

const LINES = [
  "¿Puedes encontrar la letra B?",
  "¿Cuál imagen muestra un gato?",
  "cinco",
  "tres",
  "rojo",
  "azul",
  "círculo",
  "¡Muy bien!",
  "¡Buen intento!",
  "¡Maravilloso!",
];

export const Route = createFileRoute("/voice-test")({
  head: () => ({
    meta: [{ title: "Spanish voice test — Totland" }, { name: "robots", content: "noindex" }],
  }),
  component: VoiceTest,
});

function VoiceTest() {
  return (
    <div className="mx-auto max-w-lg px-6 py-10 font-ui">
      <h1 className="text-2xl font-bold">Spanish voice test — Lucy</h1>
      <p className="mt-2 text-sm opacity-70">
        10 sample lines for pronunciation review. Temporary page; not linked anywhere.
      </p>
      <ul className="mt-6 space-y-4">
        {LINES.map((line, i) => (
          <li key={i} className="rounded-2xl border border-ink/10 p-4">
            <p className="mb-2 font-semibold">
              {String(i + 1).padStart(2, "0")}. {line}
            </p>
            <audio controls preload="none" src={`/voice-test/${String(i + 1).padStart(2, "0")}.mp3`} className="w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
