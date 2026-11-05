"use client";

import { useLayoutEffect } from "react";
import { applyTheme, readTheme, subscribeTheme } from "@/lib/theme";

/**
 * The inline script in <head> sets the class on first load. This keeps it right afterwards:
 * after the Strict Mode remount in dev clears it, after a change in another tab,
 * and when the system switches while the theme is `system`.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyTheme(readTheme());
    return subscribeTheme(() => applyTheme(readTheme()));
  }, []);
  return null;
}
