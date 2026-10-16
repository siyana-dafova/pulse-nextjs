"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useFitness } from "@/components/fitness/fitness-context";
import {
  HeaderSearch,
  HeaderSearchFallback,
} from "@/components/layout/HeaderSearch";
import { titleForPath } from "@/components/layout/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { firstName, initials } from "@/lib/fitness-data";

export default function Header() {
  const pathname = usePathname();
  const title = titleForPath(pathname);
  const { ready, profile } = useFitness();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-8">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      {/* useSearchParams needs a Suspense boundary, or the static pages fail to build. */}
      <Suspense fallback={<HeaderSearchFallback />}>
        <HeaderSearch />
      </Suspense>

      <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1">
        {ready ? (
          <>
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {initials(profile.name)}
            </span>
            <span className="text-sm font-medium text-foreground">
              {firstName(profile.name)}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </>
        )}
      </div>
    </header>
  );
}
