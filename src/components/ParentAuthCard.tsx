import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { isNativeApp } from "@/lib/native";
import { nativeSignInWithOAuth } from "@/lib/native-oauth";
import { L } from "@/lib/i18n";

/**
 * Grown-up sign in. Lives behind the parental gate; the child experience
 * never sees it and never needs an account.
 */
export function ParentAuthCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/parent/subscription` },
        });
        if (err) throw err;
        setMessage(
          L(
            "Account created. We've emailed you a confirmation link — open it to verify your email before subscribing.",
            "Cuenta creada. Te hemos enviado un enlace de confirmación por correo: ábrelo para verificar tu correo antes de suscribirte.",
          ),
        );
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err: any) {
      setError(err?.message ?? L("Something went wrong. Please try again.", "Algo salió mal. Inténtalo de nuevo."));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    if (isNativeApp()) {
      const r = await nativeSignInWithOAuth("google");
      if (r.error) setError(L("Google sign-in didn't work. Please try email instead.", "No se pudo iniciar sesión con Google. Prueba con tu correo."));
      return;
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/parent/subscription`,
    });
    if (result.error) setError(L("Google sign-in didn't work. Please try email instead.", "No se pudo iniciar sesión con Google. Prueba con tu correo."));
  };

  const apple = async () => {
    setError(null);
    if (isNativeApp()) {
      const r = await nativeSignInWithOAuth("apple");
      if (r.error) setError(L("Apple sign-in didn't work. Please try email instead.", "No se pudo iniciar sesión con Apple. Prueba con tu correo."));
      return;
    }
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: `${window.location.origin}/parent/subscription`,
    });
    if (result.error) setError(L("Apple sign-in didn't work. Please try email instead.", "No se pudo iniciar sesión con Apple. Prueba con tu correo."));
  };

  return (
    <section className="rounded-3xl bg-card p-5 wood-block">
      <h2 className="font-ui text-lg font-bold text-ink">
        {mode === "signin"
          ? L("Sign in to manage your subscription", "Inicia sesión para gestionar tu suscripción")
          : L("Create a grown-up account", "Crea una cuenta de adulto")}
      </h2>
      <p className="mt-2 text-sm text-inksoft">
        {L(
          "A grown-up account keeps your subscription safe and lets you use premium on every device — phone, tablet, or a new install. Children never sign in.",
          "Una cuenta de adulto protege tu suscripción y te deja usar Premium en todos tus dispositivos: móvil, tableta o una instalación nueva. Los peques nunca inician sesión.",
        )}
      </p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={L("Email address", "Correo electrónico")}
          className="w-full rounded-xl bg-felt px-4 py-3 text-ink outline-none ring-1 ring-black/5 focus:ring-clay"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={L("Password", "Contraseña")}
          className="w-full rounded-xl bg-felt px-4 py-3 text-ink outline-none ring-1 ring-black/5 focus:ring-clay"
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        {message && <p className="text-sm text-moss">{message}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-night py-3 font-ui font-bold text-cream disabled:opacity-60"
        >
          {busy ? L("Please wait…", "Un momento…") : mode === "signin" ? L("Sign in", "Iniciar sesión") : L("Create account", "Crear cuenta")}
        </button>
      </form>

      <button
        type="button"
        onClick={google}
        className="mt-3 w-full rounded-xl bg-felt py-3 font-ui font-semibold text-ink"
      >
        {L("Continue with Google", "Continuar con Google")}
      </button>

      <button
        type="button"
        onClick={apple}
        className="mt-3 w-full rounded-xl bg-felt py-3 font-ui font-semibold text-ink"
      >
         {L("Continue with Apple", "Continuar con Apple")}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setMessage(null);
        }}
        className="mt-3 w-full text-center text-sm text-inksoft underline"
      >
        {mode === "signin"
          ? L("New here? Create an account", "¿Eres nuevo? Crea una cuenta")
          : L("Already have an account? Sign in", "¿Ya tienes cuenta? Inicia sesión")}
      </button>
    </section>
  );
}
