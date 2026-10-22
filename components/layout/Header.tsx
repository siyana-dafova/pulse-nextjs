"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useFitness } from "@/components/fitness/fitness-context";
import {
  HeaderSearch,
  HeaderSearchFallback,
} from "@/components/layout/HeaderSearch";
import { MobileSidebar } from "@/components/layout/Sidebar";
import { titleForPath } from "@/components/layout/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { firstName, initials } from "@/lib/fitness-data";

export default function Header() {
  const pathname = usePathname();
  const title = titleForPath(pathname);
  const { ready, profile } = useFitness();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:gap-4 md:px-8">
      <MobileSidebar />
      <h1 className="min-w-0 shrink truncate text-lg font-semibold text-foreground">
        {title}
      </h1>

      {/* useSearchParams needs a Suspense boundary, or the static pages fail to build. */}
      <Suspense fallback={<HeaderSearchFallback />}>
        <HeaderSearch />
      </Suspense>

      <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1 pr-1 pl-1 sm:pr-3">
        {ready ? (
          <>
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {initials(profile.name)}
            </span>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {firstName(profile.name)}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="hidden h-4 w-14 sm:block" />
          </>
        )}
      </div>
    </header>
  );
}
