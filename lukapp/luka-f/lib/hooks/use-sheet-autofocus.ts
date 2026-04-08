"use client";

import { useEffect, type RefObject } from "react";

/**
 * Evita focus inmediato al abrir un bottom sheet: en móvil el teclado aparece
 * antes de que el layout termine y el input queda detrás del teclado.
 */
export function useSheetAutofocus(
  isOpen: boolean,
  ref: RefObject<HTMLElement | null>,
  options?: { delayMs?: number }
) {
  const delayMs = options?.delayMs ?? 420;

  useEffect(() => {
    if (!isOpen) {
      ref.current?.blur();
      return;
    }

    const id = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        el.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "smooth",
        });
      });
    }, delayMs);

    return () => {
      window.clearTimeout(id);
    };
  }, [isOpen, delayMs, ref]);
}
