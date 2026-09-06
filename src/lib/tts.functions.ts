import { createServerFn } from "@tanstack/react-start";

/** Hannah (English). Spanish falls back to Hannah until a Spanish voice is chosen. */
const VOICES: Record<string, string> = {
  en: "ZSNL4hPqCnqoMPaI4jGX",
  es: "ZSNL4hPqCnqoMPaI4jGX",
};

export type SpeakInput = { text: string; lang?: string };

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
    if (!apiKey) throw new Error("ElevenLabs is not connected to this project");

    const voiceId = VOICES[data.lang] ?? VOICES["en"]!;
    const res = await fetch(
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

    if (!res.ok) {
      const body = await res.text();
      console.error(`ElevenLabs TTS failed [${res.status}]: ${body}`);
      throw new Error(`Voice request failed [${res.status}]: ${body}`);
    }

    const buf = await res.arrayBuffer();
    return { audio: Buffer.from(buf).toString("base64") };
  });
