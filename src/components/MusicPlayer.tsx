import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { setMusic, stopMusic } from "@/lib/music";
import { useProfile } from "@/lib/profile";

const SILENT_PREFIXES = ["/parent", "/terms", "/privacy", "/refund"];

/** Runs the looping soundtrack on kid-facing screens only. */
export function MusicPlayer() {
  const { profile } = useProfile();
  const { pathname } = useLocation();
  const silent = SILENT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const on = Boolean(profile.music) && !silent;

  useEffect(() => {
    setMusic(on);
    return () => stopMusic();
  }, [on]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stopMusic();
      else setMusic(on);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [on]);

  return null;
}
