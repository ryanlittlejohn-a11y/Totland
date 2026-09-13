import { createServerFn } from "@tanstack/react-start";

/** Hannah (English). Spanish falls back to Hannah until a Spanish voice is chosen. */
const VOICES: Record<string, string> = {
  en: "ZSNL4hPqCnqoMPaI4jGX",
  es: "ZSNL4hPqCnqoMPaI4jGX",
};

export type SpeakInput = { text: string; lang?: string };

export type SpeakResult =
  | { status: "ok"; audio: string }
  | { status: "unavailable"; reason: "quota" | "rate_limit" | "service" };

/** Generate narration audio with the ElevenLabs Hannah voice. Returns base64 MP3. */
export const speakText = createServerFn({ method: "POST" })
  .inputValidator((input: SpeakInput) => {
    const text = String(input?.text ?? "").trim().slice(0, 500);
    if (!text) throw new Error("Nothing to say");
    const lang = input?.lang === "es" ? "es" : "en";
    return { text, lang };
  })
  .handler(async ({ data }) => {
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
      const body = await res.text();
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
    return {
      status: "ok",
      audio: Buffer.from(buf).toString("base64"),
    } satisfies SpeakResult;
  });
