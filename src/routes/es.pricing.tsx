import { createFileRoute } from "@tanstack/react-router";
import { webOnlyBeforeLoad } from "@/lib/web-only-route";
import { PricingPage, pricingHead } from "./pricing";

/** Spanish pricing page (/es/pricing): same content as /pricing, rendered in Spanish from the URL. */
export const Route = createFileRoute("/es/pricing")({
  beforeLoad: webOnlyBeforeLoad,
  head: () => pricingHead("es"),
  component: PricingPage,
});
