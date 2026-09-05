import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(display-mode: standalone)").matches || "standalone" in navigator) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-[520px] rounded-3xl bg-card p-4 shadow-lg wood-block">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-clay text-2xl">🏠</span>
        <div className="min-w-0 flex-1">
          <p className="font-ui text-sm font-bold text-ink">Add Totland to your home screen</p>
          <p className="font-ui text-xs text-inksoft">Tap here to install like a regular app.</p>
        </div>
        <button
          onClick={handleInstall}
          className="rounded-2xl bg-clay px-4 py-2 font-ui text-sm font-bold text-primary-foreground wood-block active:translate-y-1"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
          className="grid size-9 place-items-center rounded-full bg-felt font-ui text-sm font-bold text-inksoft"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
