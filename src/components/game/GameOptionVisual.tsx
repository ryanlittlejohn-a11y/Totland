import type { SkillId } from "@/lib/content";
import type { Option } from "@/lib/games";
import { L, noun } from "@/lib/i18n";

export function optionAriaLabel(skill: SkillId, option: Option): string {
  const value = noun(option.label ?? option.id);
  if (skill === "colors") return L(`Color ${value}`, `Color ${value}`);
  if (skill === "shapes") return L(`Shape ${value}`, `Figura ${value}`);
  if (skill === "numbers") return L(`Number ${value}`, `Número ${value}`);
  return L(`Letter ${value}`, `Letra ${value}`);
}

export function GameOptionVisual({ option }: { option: Option }) {
  if (option.swatch) {
    return <span className="size-12 rounded-full ring-2 ring-border" style={{ background: option.swatch }} />;
  }
  if (option.clip) {
    return <span className="size-12 bg-clay" style={{ clipPath: option.clip }} />;
  }
  if (option.emoji) return <span className="text-5xl">{option.emoji}</span>;
  return <span>{option.label ?? option.id}</span>;
}