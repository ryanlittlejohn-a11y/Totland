import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Please enter your name." })
    .max(100, { message: "Name must be 100 characters or less." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." })
    .max(255, { message: "Email must be 255 characters or less." }),
  message: z
    .string()
    .trim()
    .min(1, { message: "Please enter a message." })
    .max(1000, { message: "Message must be 1000 characters or less." }),
});

export type ContactInquiryInput = z.infer<typeof inquirySchema>;

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((data) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

    const supabase = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: inserted, error } = await supabase
      .from("contact_inquiries")
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[contact] failed to save inquiry:", error);
      return {
        ok: false,
        error: "We couldn't send your message right now. Please check your connection and try again.",
      };
    }

    const inquiryId = inserted?.id ?? crypto.randomUUID();

    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

      await sendTemplateEmail("contact-notification", "", {
        templateData: { name: data.name, email: data.email, message: data.message },
        idempotencyKey: `contact-notification-${inquiryId}`,
        replyTo: data.email,
      });
      // No automatic email goes to the submitted address: it is unverified, so
      // sending there would let anyone mail chosen people in the app's name.
    } catch (emailError) {
      // The inquiry is safely stored; a delivery problem must not fail the form.
      console.error("[contact] failed to send notification email:", emailError);
    }

    return { ok: true };
  });
