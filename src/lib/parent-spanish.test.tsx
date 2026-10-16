import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement, type ComponentType } from "react";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => ({ ...opts, options: opts, useSearch: () => ({}) }),
  Link: ({ children }: { children?: unknown }) => createElement("a", null, children as never),
  Outlet: () => null,
}));
vi.mock("@tanstack/react-start", () => ({
  useServerFn: () => async () => ({}),
  createServerFn: () => {
    const chain: Record<string, unknown> = {};
    chain.middleware = () => chain;
    chain.inputValidator = () => chain;
    chain.handler = () => async () => ({});
    return chain;
  },
}));

import { setLang } from "@/lib/i18n";

async function screen(path: string): Promise<string> {
  const mod = (await import(/* @vite-ignore */ path)) as Record<string, unknown>;
  const route = mod.Route as { component: ComponentType } | undefined;
  const Comp = route ? route.component : (Object.values(mod).find((v) => typeof v === "function") as ComponentType);
  return renderToString(createElement(Comp));
}

const SCREENS: [string, string, string][] = [
  ["parental gate", "@/routes/parent", "Zona para adultos"],
  ["dashboard", "@/routes/parent.index", "Panel para adultos"],
  ["children", "@/routes/parent.children", "Añadir un peque"],
  ["subscription", "@/routes/parent.subscription", "Gestionar suscripción"],
  ["contact", "@/routes/contact", "Antes de escribirnos"],
  ["sign-in card", "@/components/ParentAuthCard", "Continuar con Google"],
  ["get the app", "@/components/GetTheAppCard", "Descarga la app"],
  ["sign-in return", "@/routes/auth.native-return", "Volviendo a Totland"],
];

describe("grown-up screens follow the Spanish setting", () => {
  beforeEach(() => setLang("es"));
  afterAll(() => setLang("en"));

  for (const [name, path, spanish] of SCREENS) {
    it(`${name} shows Spanish`, async () => {
      const html = await screen(path);
      expect(html).toContain(spanish);
    });
  }

  it("legal pages keep English text but add the Spanish note", async () => {
    const html = await screen("@/routes/terms");
    expect(html).toContain("La versión en inglés es la que");
  });

  it("error page switches to Spanish when the family language is Spanish", async () => {
    const { renderErrorPage } = await import("@/lib/error-page");
    expect(renderErrorPage()).toContain('data-es="Esta página no se cargó"');
  });
});
