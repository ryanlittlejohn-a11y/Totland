import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createHash } from "crypto";

/** Narration voices: Hannah for English, Lucy for Spanish. */
const VOICES: Record<string, string> = {
  en: "ZSNL4hPqCnqoMPaI4jGX",
  es: "Bh4tkGuEEIADxUACafG5",
};

const BUCKET = "voice-clips";

export type SpeakInput = { text: string; lang?: string };

export type SpeakResult =
  | { status: "ok"; audio: string }
  | { status: "unavailable"; reason: "quota" | "rate_limit" | "service" };

/** Stable library key for a line of narration. */
function clipKey(text: string, lang: string): string {
  return createHash("sha256").update(`${lang}:${text}`).digest("hex");
}

/** Narration lines are short child-facing sentences: letters, words, numbers,
 *  names and simple punctuation. Anything else is not something the app says. */
const ALLOWED_TEXT = /^[\p{L}\p{N} .,!?'"¡¿:;()\-–—]+$/u;
const MAX_TEXT = 200;

/** How many brand-new clips one caller may generate per hour. Clips already in
 *  the shared library are served without touching this budget, so ordinary play
 *  (which reuses the same lines) is never affected. */
const GENERATIONS_PER_HOUR = 40;

/** Anonymous, non-reversible fingerprint of the caller, used only for the cap. */
function callerHash(): string {
  let ip = "unknown";
  try {
    const h = getRequest()?.headers;
    ip =
      h?.get("cf-connecting-ip") ??
      h?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h?.get("x-real-ip") ??
      "unknown";
  } catch {
    /* no request context (build/prerender) */
  }
  return createHash("sha256").update(`voice:${ip}`).digest("hex");
}

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

/** True when this caller has already generated its hourly allowance. */
async function overGenerationLimit(admin: AdminClient): Promise<boolean> {
  const hash = callerHash();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  try {
    const { count, error } = await admin
      .from("voice_generation_events")
      .select("id", { count: "exact", head: true })
      .eq("caller_hash", hash)
      .gte("created_at", since);
    if (error) return false; // never block narration on a logging problem
    if ((count ?? 0) >= GENERATIONS_PER_HOUR) return true;
    await admin.from("voice_generation_events").insert({ caller_hash: hash });
    // Opportunistic cleanup of rows that no longer count towards any window.
    if (Math.random() < 0.02) {
      await admin
        .from("voice_generation_events")
        .delete()
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Generate narration audio with the ElevenLabs Hannah voice. Returns base64 MP3.
 *
 * Shared library: every line is generated once, saved to backend storage, and
 * served from there for every device afterward — repeat plays cost no credits.
 * Generating a line that is not yet in the library is capped per caller so the
 * endpoint cannot be scripted to run up provider charges.
 */
export const speakText = createServerFn({ method: "POST" })
  .inputValidator((input: SpeakInput) => {
    const text = String(input?.text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_TEXT);
    if (!text) throw new Error("Nothing to say");
    if (!ALLOWED_TEXT.test(text)) throw new Error("Unsupported narration text");
    const lang = input?.lang === "es" ? "es" : "en";
    return { text, lang };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = `${clipKey(data.text, data.lang)}.mp3`;

    // 1. Shared library hit — no ElevenLabs call, no credits.
    try {
      const { data: file, error } = await supabaseAdmin.storage.from(BUCKET).download(key);
      if (!error && file) {
        const buf = await file.arrayBuffer();
        return { status: "ok", audio: Buffer.from(buf).toString("base64") } satisfies SpeakResult;
      }
    } catch (e) {
      console.warn("Voice library lookup failed", e);
    }

    // 2. Library miss — this is the only path that spends provider credits, so
    // cap how many a single caller may trigger per hour.
    if (await overGenerationLimit(supabaseAdmin)) {
      console.warn("Voice generation limit reached for caller");
      return { status: "unavailable", reason: "rate_limit" } satisfies SpeakResult;
    }

    const apiKey = process.env["ELEVENLABS_API_KEY"];
    if (!apiKey) {
      console.warn("ElevenLabs narration is not configured");
      return { status: "unavailable", reason: "service" } satisfies SpeakResult;
    }

    const voiceId = VOICES[data.lang] ?? VOICES["en"];
    if (!voiceId) return { status: "unavailable", reason: "service" } satisfies SpeakResult;
    let res: Response;
    try {
      res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.4,
              use_speaker_boost: true,
              speed: 0.95,
            },
          }),
        },
      );
    } catch {
      console.warn("ElevenLabs narration request could not connect");
      return { status: "unavailable", reason: "service" } satisfies SpeakResult;
    }

    if (!res.ok) {
      // Authentication, quota, policy, and rate-limit responses are expected
      // service-availability states. Returning a typed result keeps narration
      // optional and prevents a provider denial from reaching the app boundary.
      if ([401, 402, 403, 429].includes(res.status)) {
        const reason = res.status === 429 ? "rate_limit" : "quota";
        console.warn(`ElevenLabs narration unavailable [${res.status}]`);
        return { status: "unavailable", reason } satisfies SpeakResult;
      }
      console.error(`ElevenLabs narration unavailable [${res.status}]`);
      return { status: "unavailable", reason: "service" } satisfies SpeakResult;
    }

    const buf = await res.arrayBuffer();

    // Save to the shared library; failures are non-fatal (clip just isn't shared yet).
    try {
      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(key, buf, { contentType: "audio/mpeg", upsert: true });
      if (upErr) console.warn("Voice library save failed", upErr.message);
    } catch (e) {
      console.warn("Voice library save failed", e);
    }

    return {
      status: "ok",
      audio: Buffer.from(buf).toString("base64"),
    } satisfies SpeakResult;
  });
