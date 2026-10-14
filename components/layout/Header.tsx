"use client";

import { SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useFitness } from "@/components/fitness/fitness-context";
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

      <label className="relative ml-auto block w-full max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        {/* No state and no filtering. The field is only part of the layout. */}
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

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
