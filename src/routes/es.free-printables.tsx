import { createFileRoute, redirect } from "@tanstack/react-router";
import { isNativeApp } from "@/lib/native";
import { FreePrintablesPage, freePrintablesHead } from "./free-printables";

/** Spanish free printables page (/es/free-printables): same page as /free-printables, in Spanish. */
export const Route = createFileRoute("/es/free-printables")({
  beforeLoad: () => {
    if (isNativeApp()) throw redirect({ to: "/", replace: true });
  },
  head: () => freePrintablesHead("es"),
  component: FreePrintablesPage,
});
