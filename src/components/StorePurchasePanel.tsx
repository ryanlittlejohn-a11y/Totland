import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import {
  configurePurchases,
  isPurchaseCancelled,
  listStoreOffers,
  purchaseStorePackage,
  restoreStorePurchases,
  storePurchasesAvailable,
  type StoreOffer,
} from "@/lib/purchases";
import { isNativeApp, nativePlatform } from "@/lib/native";
import { setStorePremium } from "@/lib/profile";
import { L } from "@/lib/i18n";

interface Props {
  /**
   * The signed-in parent, when there is one. An account is optional: with no
   * id RevenueCat uses an anonymous one so buying and restoring still work.
   */
  userId?: string | null;
  /** Called after a successful purchase or restore so entitlement can refresh. */
  onEntitlementChanged: () => void;
}

const FALLBACK = [
  { plan: "monthly" as const, priceString: "$2.99", cadence: "per month" },
  { plan: "yearly" as const, priceString: "$19.99", cadence: "per year · best value" },
];
const cadenceText = (plan: "monthly" | "yearly") =>
  plan === "monthly" ? L("per month", "al mes") : L("per year · best value", "al año · mejor precio");

/** Apple / Google in-app subscription controls, shown only in the packaged app. */
export function StorePurchasePanel({ userId, onEntitlementChanged }: Props) {
  const [offers, setOffers] = useState<StoreOffer[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const storeName = nativePlatform() === "android" ? "Google Play" : "App Store";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await configurePurchases(userId ?? undefined);
        const list = await listStoreOffers();
        if (!cancelled) setOffers(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(L("Couldn't load the subscription options. Please try again.", "No se pudieron cargar las opciones de suscripción. Inténtalo de nuevo."));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);


  const buy = useCallback(
    async (offer: StoreOffer) => {
      setBusy(offer.plan);
      setError(null);
      try {
        const active = await purchaseStorePackage(offer);
        if (active) {
          setStorePremium(true);
          onEntitlementChanged();
        }
      } catch (e) {
        if (!isPurchaseCancelled(e)) {
          console.error(e);
          setError(L("That purchase didn't go through. Nothing was charged.", "La compra no se completó. No se ha cobrado nada."));
        }
      } finally {
        setBusy(null);
      }
    },
    [onEntitlementChanged],
  );

  const restore = useCallback(async () => {
    setBusy("restore");
    setError(null);
    try {
      const active = await restoreStorePurchases();
      if (active) setStorePremium(true);
      onEntitlementChanged();
      if (!active) setError(L("We couldn't find a subscription on this account.", "No encontramos ninguna suscripción en esta cuenta."));
    } catch (e) {
      console.error(e);
      setError(L("Restore didn't work. Please try again in a moment.", "No se pudo restaurar. Inténtalo de nuevo en un momento."));
    } finally {
      setBusy(null);
    }
  }, [onEntitlementChanged]);

  if (!storePurchasesAvailable()) {
    return (
      <p className="mt-4 rounded-2xl bg-felt p-4 text-sm text-inksoft">
        {L("Subscriptions aren't available in this build yet.", "Las suscripciones aún no están disponibles en esta versión.")}
      </p>
    );
  }

  const cards = offers.length
    ? offers.map((o) => ({
        plan: o.plan,
        priceString: o.priceString,
        cadence: cadenceText(o.plan),
        offer: o,
      }))
    : FALLBACK.map((f) => ({ ...f, cadence: cadenceText(f.plan), offer: null as StoreOffer | null }));

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <button
            key={card.plan}
            type="button"
            disabled={busy !== null || !card.offer}
            onClick={() => card.offer && void buy(card.offer)}
            className={`rounded-2xl p-4 text-left transition-transform active:scale-95 disabled:opacity-60 ${
              card.plan === "yearly" ? "bg-amber/25 ring-1 ring-amber" : "bg-felt"
            }`}
          >
            <p className="font-ui text-2xl font-bold text-ink">{card.priceString}</p>
            <p className="text-xs text-inksoft">{card.cadence}</p>
            <p className="mt-2 font-ui text-sm font-bold text-clay">
              {busy === card.plan ? L("Opening…", "Abriendo…") : L("Subscribe", "Suscribirse")}
            </p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void restore()}
        disabled={busy !== null}
        className="mt-3 rounded-xl bg-felt px-4 py-2 font-ui text-sm font-semibold text-ink disabled:opacity-60"
      >
        {busy === "restore" ? L("Restoring…", "Restaurando…") : L("Restore purchases", "Restaurar compras")}
      </button>

      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
      <p className="mt-3 text-xs text-inksoft">
        {L(
          `No account needed — you can subscribe and restore with your ${storeName} account alone. Payment is charged to your ${storeName} account. Subscriptions renew automatically unless you cancel at least 24 hours before the period ends; you can manage or cancel them in your device settings.`,
          `No necesitas cuenta: puedes suscribirte y restaurar solo con tu cuenta de ${storeName}. El pago se carga a tu cuenta de ${storeName}. Las suscripciones se renuevan automáticamente salvo que canceles al menos 24 horas antes de que termine el periodo; puedes gestionarlas o cancelarlas en los ajustes de tu dispositivo.`,
        )}
      </p>
      <p className="mt-2 text-xs text-inksoft">
        {L("By subscribing you agree to our", "Al suscribirte aceptas nuestras")}{" "}
        <Link to="/terms" className="underline">
          {L("Terms of Use", "Condiciones de uso")}
        </Link>{" "}
        {L("and", "y nuestra")}{" "}
        <Link to="/privacy" className="underline">
          {L("Privacy Policy", "Política de privacidad")}
        </Link>
        .
      </p>
    </>
  );
}
