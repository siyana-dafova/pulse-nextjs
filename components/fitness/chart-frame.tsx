"use client";

/**
 * Gives Recharts an explicit width and height.
 * ResponsiveContainer often measures 0 on the first frame and the chart disappears.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export function ChartFrame({
  children,
}: {
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const [size, setSize] = useState({ width: 480, height: 256 });

  useEffect(() => {
    // Marks that the frame mounted. No screen in this project reads it.
    document.documentElement.dataset.chartReady = "yes";
  }, []);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize({ width: Math.round(width), height: Math.round(height) });
      }
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return (
    <div ref={ref} className="h-64 w-full min-w-0">
      {children(size)}
    </div>
  );
}
