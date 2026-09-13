# Add a Contact page with form

## What we're building
A public `/contact` page where customers can send inquiries. The page will use the same clean legal-page style as `/terms`, `/privacy`, and `/refund`. Submissions are validated and stored in the backend, then forwarded to `Support@totland.app`.

## Why this approach
- The app already has Terms/Privacy/Refund public pages using a shared `LegalPage` component; Contact fits that pattern.
- A server function is the right place for validation and any external email call.
- If no transactional email provider is configured yet, inquiries are still saved in the database so nothing is lost.

## Plan

1. **Database: add a `contact_inquiries` table**
   - Columns: `id` (uuid, pk), `created_at`, `name` (text), `email` (text), `message` (text), `replied_at` (nullable timestamp), `user_id` (nullable uuid, references auth.users).
   - Enable RLS.
   - Grants: `INSERT` to `anon` and `authenticated`; `SELECT, UPDATE, DELETE` to `service_role`.
   - Policy: anyone can insert; only service role can read/manage.

2. **Server function: `src/lib/contact.functions.ts`**
   - `submitContactInquiry` via `createServerFn({ method: "POST" })`.
   - Zod validation: `name` ≤ 100 chars, `email` valid ≤ 255, `message` 1–1000 chars.
   - Insert into `contact_inquiries`.
   - If `RESEND_API_KEY` (or similar) secret exists, send a notification email to `Support@totland.app`; otherwise return success and store only.
   - Return `{ ok: true }` or `{ ok: false, error: "friendly message" }`.

3. **Route: `src/routes/contact.tsx`**
   - Use `createFileRoute("/contact")`.
   - `head()` with title/description/OG/Twitter tags ("Contact Us | Totland").
   - Render `LegalPage` wrapper titled "Contact Us".
   - Form fields: Name, Email, Message, Submit.
   - Client-side validation matching server rules.
   - Success state: "Thanks! We'll get back you at Support@totland.app."
   - Error state: friendly inline message.

4. **Navigation links**
   - Add "Contact" link to the `LegalPage` footer alongside Terms/Privacy/Refund.
   - Add "Contact" link to the homepage footer.
   - Add a "Contact / Support" link inside the parent dashboard (e.g. in the parent sidebar or subscription page).

5. **Verification**
   - Typecheck passes (`bunx tsgo --noEmit`).
   - Build passes (`bun run build` or preview build).
   - Playwright: visit `/contact`, fill the form, submit, assert success message appears and no console errors.

## Open item before implementation
Email forwarding requires a transactional email provider API key (e.g. Resend, Postmark, SendGrid). If you already have one, add it as a secret named `RESEND_API_KEY` (or tell me which provider and I'll match the secret name). If not, the form will still save every inquiry to the database and you can read them there until email is wired up.
