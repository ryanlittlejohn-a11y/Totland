import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { isNativeApp } from "@/lib/native";
import { L } from "@/lib/i18n";

/**
 * Website-only footer with the policy links Paddle requires on the public site.
 * Never shown in the packaged app: Apple Kids 1.3 forbids ungated links on the
 * child side, so there these links live only inside the gated parent area.
 * Hidden until after mount so the native app never flashes them.
 */
export function WebLegalFooter() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!isNativeApp());
  }, []);
  if (!show) return null;
  return (
    <footer className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 font-ui text-[11px] text-inksoft">
      <Link to="/guides/toddler-learning-games" className="underline">{L("Guide", "Guía")}</Link>
      <Link to="/terms" className="underline">{L("Terms", "Condiciones")}</Link>
      <Link to="/privacy" className="underline">{L("Privacy", "Privacidad")}</Link>
      <Link to="/refund" className="underline">{L("Refunds", "Reembolsos")}</Link>
      <Link to="/contact" className="underline">{L("Contact", "Contacto")}</Link>
    </footer>
  );
}
