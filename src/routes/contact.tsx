import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute } from "@tanstack/react-start";
import { useState } from "react";
import { LegalPage } from "../components/LegalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactInquiry, type ContactInquiryInput } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Totland" },
      {
        name: "description",
        content:
          "Questions, feedback, or help with Totland? Send us a message and we'll get back to you.",
      },
      { property: "og:title", content: "Contact Us | Totland" },
      {
        property: "og:description",
        content:
          "Questions, feedback, or help with Totland? Send us a message and we'll get back to you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/contact" }],
  }),
  component: ContactPage,
});

const SUPPORT_EMAIL = "Support@totland.app";

function ContactPage() {
  const [form, setForm] = useState<ContactInquiryInput>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInquiryInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: Partial<Record<keyof ContactInquiryInput, string>> = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name) next.name = "Please enter your name.";
    else if (name.length > 100) next.name = "Name must be 100 characters or less.";

    if (!email) next.email = "Please enter your email address.";
    else if (email.length > 255) next.email = "Email must be 255 characters or less.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";

    if (!message) next.message = "Please enter a message.";
    else if (message.length > 1000) next.message = "Message must be 1000 characters or less.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await submitContactInquiry({ data: form });
      if (result.ok) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setServerError(result.error ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("[contact] submit error:", err);
      setServerError("We couldn't send your message right now. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalPage title="Contact Us" updated="September 13, 2026">
      <section>
        <p>
          Have a question about Totland, need help with your subscription, or want to share
          feedback? Fill out the form below and we&rsquo;ll get back to you as soon as we can.
        </p>
        <p className="mt-2">
          You can also email us directly at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      {sent ? (
        <section className="rounded-2xl bg-moss/10 p-5 text-moss">
          <h2 className="text-lg font-semibold">Message sent</h2>
          <p className="mt-1">
            Thanks for reaching out! We&rsquo;ll reply to you at the email you provided.
          </p>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="rounded-xl"
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-amber">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="rounded-xl"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-amber">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              maxLength={1000}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              className="rounded-xl"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {errors.message && (
                  <span className="text-amber" id="message-error">
                    {errors.message}
                  </span>
                )}
              </span>
              <span>{form.message.length}/1000</span>
            </div>
          </div>

          {serverError && (
            <p className="rounded-xl bg-amber/10 p-3 text-sm text-amber" role="alert">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3 font-semibold"
          >
            {submitting ? "Sending..." : "Send message"}
          </Button>
        </form>
      )}
    </LegalPage>
  );
}
