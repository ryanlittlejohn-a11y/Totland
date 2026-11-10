import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import {
  TOTLAND_PRICE_MONTHLY,
  TOTLAND_PRICE_NOTE,
  TOTLAND_PRICE_YEARLY,
} from "@/lib/comparison-facts";
import { L } from "@/lib/i18n";
import { inNativeApp, webOnlyBeforeLoad } from "@/lib/web-only-route";

const TITLE = "Totland Pricing: Free Games Plus Optional Premium | Totland";
const DESCRIPTION =
  "Totland has free games plus optional Premium. No ads, no child accounts. See what's free, what Premium unlocks, US prices and how billing works.";
const URL = "https://totland.app/pricing";

export const Route = createFileRoute("/pricing")({
  beforeLoad: webOnlyBeforeLoad,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://totland.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: TITLE,
          description: DESCRIPTION,
          url: URL,
          inLanguage: "en",
          primaryImageOfPage: "https://totland.app/og-image.jpg",
          isPartOf: { "@type": "WebSite", name: "Totland", url: "https://totland.app" },
          publisher: { "@type": "Organization", name: "Totland" },
        }),
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  if (inNativeApp()) return null;
  return (
    <LegalPage title={L("Totland pricing", "Precios de Totland")} updated="November 10, 2026">
      <section>
        <p>
          {L(
            "Totland is free games plus optional Premium. There are no ads, and children never need an account.",
            "Totland son juegos gratis y Premium opcional. No hay anuncios y los niños nunca necesitan una cuenta.",
          )}
        </p>
      </section>

      <section>
        <h2>{L("Free", "Gratis")}</h2>
        <ul>
          <li>{L("Free games to start.", "Juegos gratis para empezar.")}</li>
          <li>{L("No ads.", "Sin anuncios.")}</li>
          <li>{L("No sign-in needed.", "No hace falta iniciar sesión.")}</li>
          <li>
            {L(
              "Free play needs an internet connection.",
              "Jugar gratis requiere conexión a internet.",
            )}
          </li>
          <li>
            {L("Free sample printable sheets: ", "Hojas imprimibles de muestra gratis: ")}
            <Link to="/free-printables">{L("see the free sheets", "ver las hojas gratis")}</Link>.
          </li>
        </ul>
      </section>

      <section>
        <h2>Premium</h2>
        <p>{L("Totland Premium unlocks:", "Totland Premium desbloquea:")}</p>
        <ul>
          <li>{L("all Word Finds;", "todas las sopas de letras;")}</li>
          <li>
            {L(
              "the premium learning worlds and their activities;",
              "los mundos de aprendizaje premium y sus actividades;",
            )}
          </li>
          <li>
            {L("the full printable sets;", "las colecciones completas de hojas imprimibles;")}
          </li>
          <li>{L("offline play.", "jugar sin conexión.")}</li>
        </ul>
      </section>

      <section>
        <h2>{L("Prices", "Precios")}</h2>
        <ul>
          <li>
            {L("Yearly", "Anual")}: {TOTLAND_PRICE_YEARLY} {L("a year", "al año")}
          </li>
          <li>
            {L("Monthly", "Mensual")}: {TOTLAND_PRICE_MONTHLY} {L("a month", "al mes")}
          </li>
        </ul>
        <p>
          {L("US prices", "Precios en EE. UU.")} ({TOTLAND_PRICE_NOTE}).{" "}
          {L(
            "Prices can differ in stores and countries.",
            "Los precios pueden variar según la tienda y el país.",
          )}
        </p>
      </section>

      <section>
        <h2>{L("Where you buy", "Dónde comprar")}</h2>
        <ul>
          <li>
            {L(
              "On the website, orders are handled by Paddle, our Merchant of Record.",
              "En la web, los pedidos los gestiona Paddle, nuestro comerciante de registro.",
            )}
          </li>
          <li>
            {L(
              "In the iPhone or iPad app, purchases go through Apple's in-app purchase and are billed by Apple.",
              "En la app para iPhone o iPad, las compras se hacen con las compras dentro de la app de Apple y las factura Apple.",
            )}
          </li>
        </ul>
        <p>
          {L(
            "Subscriptions renew automatically until cancelled. Cancel through Paddle's customer portal (website purchases) or your Apple subscription settings (app purchases).",
            "Las suscripciones se renuevan automáticamente hasta que se cancelan. Cancela en el portal de clientes de Paddle (compras en la web) o en los ajustes de suscripciones de Apple (compras en la app).",
          )}
        </p>
        <p>
          {L("See the ", "Consulta la ")}
          <Link to="/refund">{L("Refund Policy", "Política de reembolsos")}</Link>{" "}
          {L("and the", "y los")}{" "}
          <Link to="/terms">{L("Terms & Conditions", "Términos y condiciones")}</Link>.
        </p>
      </section>

      <section>
        <h2>{L("Accounts", "Cuentas")}</h2>
        <p>
          {L(
            "A grown-up account is needed only for the subscription. Children never sign in.",
            "Solo hace falta una cuenta de adulto para la suscripción. Los niños nunca inician sesión.",
          )}
        </p>
        <p>
          <Link
            to="/parent/subscription"
            search={{ checkout: undefined }}
            className="inline-block rounded-xl bg-primary px-5 py-3 font-semibold !text-primary-foreground !no-underline"
          >
            {L("Subscribe or manage Premium", "Suscribirse o gestionar Premium")}
          </Link>
        </p>
      </section>
    </LegalPage>
  );
}
