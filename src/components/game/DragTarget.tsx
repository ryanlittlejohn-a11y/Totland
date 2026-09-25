import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * A drop target for useDragToTarget that is also a real button, so a plain
 * tap (or VoiceOver double-tap) works as the accessible fallback to dragging.
 */
export function DragTarget({
  register,
  children,
  ...rest
}: { register: (el: HTMLElement | null) => void; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" ref={register} {...rest}>
      {children}
    </button>
  );
}
