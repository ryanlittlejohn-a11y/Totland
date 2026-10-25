import { getLastServerStatus } from "@/lib/native-bridge";
import { signOutLocal } from "@/lib/signout-log";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { FREE_GAME_COUNT, FREE_WORD_FIND_COUNT, FREE_STORY_COUNT, premiumBenefits } from "@/lib/library-counts";
import { setAccountPremium, useProfile } from "@/lib/profile";
import { hasVerifiedSession } from "@/lib/verifiedSession";
import { usePaddleCheckout, type PlanId } from "@/hooks/usePaddleCheckout";
import { useParentAuth } from "@/hooks/useParentAuth";
import { ParentAuthCard } from "@/components/ParentAuthCard";
import { getPaddleEnvironment } from "@/lib/paddle";
import { getMySubscription, type SubscriptionState } from "@/lib/subscription.functions";
import { deleteMyAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp, nativePlatform } from "@/lib/native";
import { StorePurchasePanel } from "@/components/StorePurchasePanel";
import { useStoreEntitlement } from "@/hooks/useStoreEntitlement";
import { storageRemove } from "@/lib/storage";
import { clearAllDrawings } from "@/lib/free-draw";
import { openStoreSubscriptionManagement } from "@/lib/purchases";
import { L } from "@/lib/i18n";



export const Route = createFileRoute("/parent/subscription")({
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: typeof search["checkout"] === "string" ? (search["checkout"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Subscription — Totland" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Totland Premium: $2.99 a month or $19.99 a year for the full learning library. No ads, ever." },
      { property: "og:title", content: "Subscription — Totland" },
      { property: "og:description", content: "Affordable, ad-free premium access to the complete Totland learning library." },
    ],
  }),
  component: Subscription,
});

const PLANS: { id: PlanId; price: string; cadence: () => string; best?: boolean }[] = [
  { id: "premium_monthly", price: "$2.99", cadence: () => L("per month", "al mes") },
  { id: "premium_yearly", price: "$19.99", cadence: () => L("per year · best value", "al año · mejor precio"), best: true },
];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function Subscription() {
  const { profile, update } = useProfile();
  const { checkout } = Route.useSearch();
  const { user, ready } = useParentAuth();
  const benefits = premiumBenefits();

  const fetchSubscription = useServerFn(getMySubscription);
  const [sub, setSub] = useState<SubscriptionState | null>(null);
  const [checking, setChecking] = useState(false);
  const [waitingForPayment, setWaitingForPayment] = useState(false);

  const sync = useCallback(async () => {
    if (!user) return null;
    setChecking(true);
    try {
      // Confirm the saved sign-in with the backend first; a stale token must
      // never reach a protected call.
      if (!(await hasVerifiedSession())) {
        setSub(null);
        return null;
      }
      const state = await fetchSubscription({ data: { environment: getPaddleEnvironment() } });
      setSub(state);
      // Cache the verified answer locally so the app keeps working offline.
      setAccountPremium(state.active);
      return state;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setChecking(false);
    }
  }, [user, fetchSubscription, update]);

  useEffect(() => {
    if (ready && user?.email_confirmed_at) void sync();
    if (ready && (!user || !user.email_confirmed_at)) setSub(null);
  }, [ready, user, sync]);

  // After checkout the payment provider confirms by webhook; poll briefly.
  const waitForActivation = useCallback(async () => {
    setWaitingForPayment(true);
    for (let i = 0; i < 12; i++) {
      const state = await sync();
      if (state?.active) break;
      await new Promise((r) => setTimeout(r, 2500));
    }
    setWaitingForPayment(false);
  }, [sync]);

  useEffect(() => {
    if (checkout === "success" && user && !sub?.active) void waitForActivation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, user]);

  const { openCheckout, loading, error } = usePaddleCheckout(() => void waitForActivation());

  const emailVerified = Boolean(user?.email_confirmed_at);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const resendVerification = async () => {
    if (!user?.email) return;
    setResendState("sending");
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/parent/subscription` },
    });
    setResendState(err ? "error" : "sent");
  };

  const native = isNativeApp();
  const { storeActive, managementURL, refresh: refreshStore } = useStoreEntitlement(user?.id ?? null);
  const active = (emailVerified && (sub?.active ?? false)) || storeActive;
  const renewalDate = formatDate(sub?.currentPeriodEnd ?? null);
  const storeName = nativePlatform() === "android" ? "Google Play" : "App Store";
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);

  const manageSubscription = async () => {
    if (!managementURL) return;
    setManagingSubscription(true);
    setManageError(null);
    try {
      await openStoreSubscriptionManagement(managementURL);
    } catch (e) {
      console.error("[manageSubscription]", e);
      setManageError(
        L(
          `We couldn't open ${storeName} subscription settings. Please try again.`,
          `No pudimos abrir los ajustes de suscripción de ${storeName}. Inténtalo de nuevo.`,
        ),
      );
    } finally {
      setManagingSubscription(false);
    }
  };


  const removeAccount = useServerFn(deleteMyAccount);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const doDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const signInAgain = L(
      "Your sign-in has expired, so we couldn't confirm it's you. Please sign in again, then delete your account.",
      "Tu sesión ha caducado y no pudimos confirmar que eres tú. Vuelve a iniciar sesión y luego elimina tu cuenta.",
    );
    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setDeleteError(L("You're offline. Connect to the internet and try again.", "No tienes conexión. Conéctate a internet e inténtalo de nuevo."));
        setDeleting(false);
        return;
      }
      // Confirm the saved sign-in with the backend before attempting anything
      // destructive. The auth client refreshes on its own; a second forced
      // refresh could race it and get the session revoked.
      if (!(await hasVerifiedSession())) {
        setDeleteError(signInAgain);
        setDeleting(false);
        return;
      }

      const result = await removeAccount({ data: undefined });
      if (!result.ok) {
        setDeleteError(
          L(
            `Something went wrong on our side and your account wasn't fully deleted. Please try again — nothing already removed will cause a problem. (Code: DEL-${result.step.toUpperCase()})`,
            `Algo falló por nuestra parte y tu cuenta no se eliminó del todo. Inténtalo de nuevo; lo que ya se eliminó no causará problemas. (Código: DEL-${result.step.toUpperCase()})`,
          ),
        );
        setDeleting(false);
        return;
      }

      await signOutLocal("deletion", "account deleted");
      try {
        storageRemove("totland.family.v1");
        clearAllDrawings();
      } catch {
        /* ignore */
      }

      setAccountPremium(false);
      setDeleted(true);
      setDeleting(false);
    } catch (e) {
      console.error("[deleteAccount]", e);
      const msg = e instanceof Error ? e.message : String(e);
      const bridged = getLastServerStatus();
      const status =
        e instanceof Response
          ? e.status
          : ((e as { status?: number })?.status ??
            (e as { statusCode?: number })?.statusCode ??
            // The server replied with an error page: use the real status the
            // app bridge saw, or 500 for the server's own error page.
            (/^\s*</.test(msg) ? (bridged && bridged >= 400 ? bridged : 500) : undefined));
      if (status === 401 || /unauthori[sz]ed/i.test(msg)) {
        setDeleteError(signInAgain);
      } else if (e instanceof TypeError || /failed to fetch|network|load failed/i.test(msg)) {
        setDeleteError(
          L(
            "We couldn't reach Totland. Check your internet connection and try again. (Code: DEL-NET)",
            "No pudimos conectar con Totland. Revisa tu conexión a internet e inténtalo de nuevo. (Código: DEL-NET)",
          ),
        );
      } else {
        setDeleteError(
          L(
            `Something went wrong on our side. Please try again. (Code: DEL-${status ?? "ERR"})`,
            `Algo falló por nuestra parte. Inténtalo de nuevo. (Código: DEL-${status ?? "ERR"})`,
          ),
        );
      }
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="px-1 font-ui text-2xl font-bold text-ink">{L("Manage Subscription", "Gestionar suscripción")}</h1>
      <section className="rounded-3xl bg-card p-5 wood-block">
        <div className="flex items-center justify-between">
          <h2 className="font-ui text-xl font-bold text-ink">Totland Premium</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active ? "bg-moss/20 text-moss" : "bg-felt text-inksoft"
            }`}
          >
            {active ? L("Active", "Activa") : L("Free plan", "Plan gratuito")}
          </span>
        </div>
        <p className="mt-2 text-sm text-inksoft">
          {L(
            `Free includes ${FREE_GAME_COUNT} games drawn from every world, plus ${FREE_WORD_FIND_COUNT} Word Finds and ${FREE_STORY_COUNT} storybooks. Premium unlocks everything and every new release.`,
            `La versión gratuita incluye ${FREE_GAME_COUNT} juegos de todos los mundos, ${FREE_WORD_FIND_COUNT} sopas de letras y ${FREE_STORY_COUNT} cuentos. Premium lo desbloquea todo, incluidas todas las novedades.`,
          )}
        </p>

        {waitingForPayment && (
          <p className="mt-4 rounded-2xl bg-amber/20 p-4 text-sm text-ink">
            {L("Confirming your payment… this usually takes a few seconds.", "Confirmando tu pago… suele tardar unos segundos.")}
          </p>
        )}

        {!ready ? (
          <p className="mt-4 text-sm text-inksoft">{L("Loading…", "Cargando…")}</p>
        ) : active ? (
          <div className="mt-4 rounded-2xl bg-moss/15 p-4 text-sm text-ink">
            <p className="font-semibold">🎉 {L("Premium is active — the whole library is unlocked.", "Premium está activo: toda la biblioteca está desbloqueada.")}</p>
            {renewalDate && !storeActive && (
              <p className="mt-2 text-inksoft">
                {sub?.cancelAtPeriodEnd || sub?.status === "canceled"
                  ? L(`Access ends ${renewalDate}.`, `El acceso termina el ${renewalDate}.`)
                  : L(`Renews ${renewalDate}.`, `Se renueva el ${renewalDate}.`)}
              </p>
            )}
            {sub?.status === "past_due" && !storeActive && (
              <p className="mt-2 text-clay">
                {L(
                  "Your last payment didn't go through. Please update your payment details to keep premium.",
                  "Tu último pago no se completó. Actualiza tus datos de pago para mantener Premium.",
                )}
              </p>
            )}
            {native ? (
              <div className="mt-2 text-inksoft">
                {managementURL ? (
                  <>
                    <p>
                      {L(
                        `Switch or cancel your plan in the ${storeName}. Canceling keeps premium until the end of your paid period.`,
                        `Cambia o cancela tu plan en ${storeName}. Si cancelas, mantienes Premium hasta el final del periodo pagado.`,
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => void manageSubscription()}
                      disabled={managingSubscription}
                      className="mt-3 rounded-xl bg-night px-4 py-2 font-ui text-sm font-bold text-cream disabled:opacity-60"
                    >
                      {managingSubscription ? L("Opening…", "Abriendo…") : L("Manage subscription", "Gestionar suscripción")}
                    </button>
                  </>
                ) : (
                  <p>
                    {L(
                      `There isn't an active ${storeName} subscription to manage on this device. If you subscribed on the website, manage it at paddle.net. Canceling keeps premium until the end of your paid period.`,
                      `No hay ninguna suscripción activa de ${storeName} que gestionar en este dispositivo. Si te suscribiste en la web, gestiónala en paddle.net. Si cancelas, mantienes Premium hasta el final del periodo pagado.`,
                    )}
                  </p>
                )}
                {manageError && <p className="mt-2 text-clay">{manageError}</p>}
              </div>
            ) : (
              <p className="mt-2 text-inksoft">
                {L("To switch plans, update your card, or cancel, visit", "Para cambiar de plan, actualizar tu tarjeta o cancelar, entra en")}{" "}
                <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="underline">
                  paddle.net
                </a>{" "}
                {L(
                  "with the email you used at checkout. Canceling keeps premium until the end of your paid period.",
                  "con el correo que usaste al pagar. Si cancelas, mantienes Premium hasta el final del periodo pagado.",
                )}
              </p>
            )}
          </div>
        ) : native ? (
          <StorePurchasePanel
            userId={user?.id ?? null}
            onEntitlementChanged={() => {
              void refreshStore();
              if (user?.email_confirmed_at) void waitForActivation();
            }}
          />
        ) : !user ? (
          <p className="mt-4 rounded-2xl bg-felt p-4 text-sm text-inksoft">
            {L(
              "Sign in below to subscribe or to restore a subscription you already bought.",
              "Inicia sesión abajo para suscribirte o restaurar una suscripción que ya compraste.",
            )}
          </p>
        ) : !emailVerified ? (
          <div className="mt-4 rounded-2xl bg-amber/20 p-4 text-sm text-ink">
            <p className="font-semibold">{L("Please verify your email address.", "Verifica tu dirección de correo.")}</p>
            <p className="mt-2 text-inksoft">
              {L(
                `We sent a confirmation link to ${user.email}. Open it, then come back here — verified emails are required before subscribing or restoring a purchase, so your account stays protected.`,
                `Enviamos un enlace de confirmación a ${user.email}. Ábrelo y vuelve aquí: el correo debe estar verificado antes de suscribirte o restaurar una compra, para que tu cuenta esté protegida.`,
              )}
            </p>
            <button
              type="button"
              onClick={() => void resendVerification()}
              disabled={resendState === "sending" || resendState === "sent"}
              className="mt-3 rounded-xl bg-night px-4 py-2 font-ui text-sm font-bold text-cream disabled:opacity-60"
            >
              {resendState === "sending"
                ? L("Sending…", "Enviando…")
                : resendState === "sent"
                  ? L("Email sent — check your inbox", "Correo enviado: revisa tu bandeja de entrada")
                  : L("Resend verification email", "Reenviar correo de verificación")}
            </button>
            {resendState === "error" && (
              <p className="mt-2 text-clay">{L("Couldn't send the email right now. Please try again in a minute.", "No se pudo enviar el correo ahora. Inténtalo de nuevo en un minuto.")}</p>
            )}
          </div>
        ) : (

          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  disabled={loading !== null}
                  onClick={() => openCheckout(plan.id, { userId: user.id, email: user.email ?? undefined })}
                  className={`rounded-2xl p-4 text-left transition-transform active:scale-95 disabled:opacity-60 ${
                    plan.best ? "bg-amber/25 ring-1 ring-amber" : "bg-felt"
                  }`}
                >
                  <p className="font-ui text-2xl font-bold text-ink">{plan.price}</p>
                  <p className="text-xs text-inksoft">{plan.cadence()}</p>
                  <p className="mt-2 font-ui text-sm font-bold text-clay">
                    {loading === plan.id ? L("Opening…", "Abriendo…") : L("Subscribe", "Suscribirse")}
                  </p>
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-clay">{error}</p>}
            <p className="mt-3 text-xs text-inksoft">
              {L(
                "Secure checkout. Cancel anytime; premium stays active until the end of your paid period. Purchases are only reachable behind this parental gate — never from the child experience.",
                "Pago seguro. Cancela cuando quieras; Premium sigue activo hasta el final del periodo pagado. Las compras solo están disponibles tras este control para adultos, nunca desde la zona infantil.",
              )}
            </p>
          </>
        )}

        <ul className="mt-4 space-y-1.5 text-sm text-ink">
          {benefits.map((b) => (
            <li key={b.key}>
              {b.emoji} {b.text}
            </li>
          ))}
          <li>✈️ {L("Play anywhere, even with no internet — offline play is part of Premium", "Juega en cualquier sitio, incluso sin internet: jugar sin conexión es parte de Premium")}</li>
        </ul>
      </section>

      {deleted ? (
        <section className="rounded-3xl bg-card p-5 wood-block">
          <h2 className="font-ui text-lg font-bold text-ink">{L("Your account has been deleted", "Tu cuenta se ha eliminado")}</h2>
          <p className="mt-2 text-sm text-inksoft">
            {L(
              "Your grown-up account, its saved child profiles, your subscription record with us and your signed-in support messages have been permanently removed. Play progress and stars stored on this device remain here. Any App Store or Google Play subscription must still be canceled in the store; Apple, Google and RevenueCat keep their own purchase records under their own policies.",
              "Tu cuenta de adulto, los perfiles infantiles guardados, tu registro de suscripción con nosotros y los mensajes de soporte que enviaste con la sesión iniciada se han eliminado para siempre. El progreso y las estrellas guardados en este dispositivo siguen aquí. Cualquier suscripción del App Store o Google Play debe cancelarse en la tienda; Apple, Google y RevenueCat conservan sus propios registros de compra según sus políticas.",
            )}
          </p>
          <Link to="/" className="mt-3 inline-block rounded-xl bg-night px-4 py-2 font-ui text-sm font-bold text-cream">
            {L("Back to play", "Volver a jugar")}
          </Link>
        </section>
      ) : ready && !user ? (
        <>
          {native && (
            <section className="rounded-3xl bg-card p-5 wood-block">
              <h2 className="font-ui text-lg font-bold text-ink">{L("An account is optional", "La cuenta es opcional")}</h2>
              <p className="mt-2 text-sm text-inksoft">
                {L(
                  "You don't need an account to subscribe or to play. Signing in only keeps your children's profiles and progress in step across your family's devices — and it links a subscription you've already bought to your account.",
                  "No necesitas una cuenta para suscribirte ni para jugar. Iniciar sesión solo sincroniza los perfiles y el progreso de tus peques entre los dispositivos de la familia, y vincula a tu cuenta una suscripción que ya hayas comprado.",
                )}
              </p>
            </section>
          )}
          <ParentAuthCard />
        </>

      ) : (
        user && (
          <section className="rounded-3xl bg-card p-5 wood-block">
            <h2 className="font-ui text-lg font-bold text-ink">{L("Your account", "Tu cuenta")}</h2>
            <p className="mt-2 text-sm text-inksoft">{L(`Signed in as ${user.email}`, `Sesión iniciada como ${user.email}`)}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void sync()}
                disabled={checking || !emailVerified}
                className="rounded-xl bg-felt px-4 py-2 font-ui text-sm font-semibold text-ink disabled:opacity-60"
              >
                {checking ? L("Checking…", "Comprobando…") : L("Restore purchase", "Restaurar compra")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  console.warn("[signout] source=user-button reason=tapped Sign out");
                  await supabase.auth.signOut();
                  setAccountPremium(false);
                }}
                className="rounded-xl bg-felt px-4 py-2 font-ui text-sm font-semibold text-ink"
              >
                {L("Sign out", "Cerrar sesión")}
              </button>
            </div>
            {profile.premium && (
              <p className="mt-3 text-xs text-inksoft">
                {L(
                  "Premium is saved on this device too, so games keep working with no internet.",
                  "Premium también se guarda en este dispositivo, así que los juegos siguen funcionando sin internet.",
                )}
              </p>
            )}

            <div className="mt-5 border-t border-border pt-4">
              <h3 className="font-ui text-sm font-bold text-clay">{L("Delete account", "Eliminar cuenta")}</h3>
              <p className="mt-2 text-xs text-inksoft">
                {L(
                  "This permanently deletes your grown-up account, the child profiles saved to it, your subscription record with us and any support messages you sent while signed in. It does not cancel an App Store or Google Play subscription — Apple, Google and RevenueCat keep their own purchase records under their own policies — and it does not erase play progress or stars stored on this device. This cannot be undone.",
                  "Esto elimina para siempre tu cuenta de adulto, los perfiles infantiles guardados en ella, tu registro de suscripción con nosotros y los mensajes de soporte que enviaste con la sesión iniciada. No cancela ninguna suscripción del App Store o Google Play (Apple, Google y RevenueCat conservan sus propios registros de compra según sus políticas) y no borra el progreso ni las estrellas guardados en este dispositivo. No se puede deshacer.",
                )}
              </p>
              {active && (
                <p className="mt-2 text-xs text-clay">
                  {L("You have an active subscription. Manage and cancel it before deleting", "Tienes una suscripción activa. Gestiónala y cancélala antes de eliminar la cuenta")}
                  {native && managementURL
                    ? L(` using the Manage subscription button above`, ` con el botón Gestionar suscripción de arriba`)
                    : native
                      ? L(` in the ${storeName} from your device settings`, ` en ${storeName} desde los ajustes de tu dispositivo`)
                      : L(" at paddle.net with your checkout email", " en paddle.net con el correo que usaste al pagar")}.
                </p>
              )}

              {!confirmOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="mt-3 rounded-xl bg-clay/15 px-4 py-2 font-ui text-sm font-bold text-clay"
                >
                  {L("Delete my account", "Eliminar mi cuenta")}
                </button>
              ) : (
                <div className="mt-3">
                  <label htmlFor="confirm-delete" className="block text-xs font-semibold text-ink">
                    {L("Type DELETE to confirm", "Escribe DELETE para confirmar")}
                  </label>
                  <input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="mt-1 w-full rounded-xl bg-felt px-4 py-3 text-ink outline-none ring-1 ring-black/5 focus:ring-clay"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={confirmText.trim().toUpperCase() !== "DELETE" || deleting}
                      onClick={() => void doDelete()}
                      className="rounded-xl bg-clay px-4 py-2 font-ui text-sm font-bold text-primary-foreground disabled:opacity-50"
                    >
                      {deleting ? L("Deleting…", "Eliminando…") : L("Permanently delete", "Eliminar para siempre")}
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => {
                        setConfirmOpen(false);
                        setConfirmText("");
                        setDeleteError(null);
                      }}
                      className="rounded-xl bg-felt px-4 py-2 font-ui text-sm font-semibold text-ink"
                    >
                      {L("Cancel", "Cancelar")}
                    </button>
                  </div>
                  {deleteError && <p className="mt-2 text-xs text-clay">{deleteError}</p>}
                </div>
              )}
            </div>
          </section>
        )
      )}

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">{L("Privacy", "Privacidad")}</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-inksoft">
          <li>· {L("No child accounts, no chat, no social features, no external links in the child area.", "Sin cuentas infantiles, sin chat, sin funciones sociales y sin enlaces externos en la zona infantil.")}</li>
          <li>· {L("Learning data stays on this device unless you sign in to sync child profiles and progress.", "Los datos de aprendizaje se quedan en este dispositivo salvo que inicies sesión para sincronizar perfiles y progreso.")}</li>
          <li>· {L("A signed-in grown-up account stores your email, synced child profiles and progress, and subscription record.", "Una cuenta de adulto con sesión iniciada guarda tu correo, los perfiles y el progreso sincronizados y el registro de suscripción.")}</li>
          <li>· {L("No third-party advertising or behavioural profiling.", "Sin publicidad de terceros ni perfiles de comportamiento.")}</li>
          <li>· {L("Payment details are handled entirely by our payment provider — they never touch this app.", "Los datos de pago los gestiona por completo nuestro proveedor de pagos; nunca pasan por esta app.")}</li>
          <li>· {L("Purchases, settings and links sit behind the parental gate.", "Las compras, los ajustes y los enlaces están tras el control para adultos.")}</li>
        </ul>
      </section>

      <footer className="flex flex-wrap gap-4 pb-6 text-sm text-inksoft">
        <Link to="/terms" className="underline hover:text-ink">{L("Terms & Conditions", "Términos y condiciones")}</Link>
        <Link to="/refund" className="underline hover:text-ink">{L("Refund Policy", "Política de reembolsos")}</Link>
        <Link to="/privacy" className="underline hover:text-ink">{L("Privacy Notice", "Aviso de privacidad")}</Link>
      </footer>
    </div>
  );
}
