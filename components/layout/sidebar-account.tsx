"use client";

import { useFitness } from "@/components/fitness/fitness-context";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarAccount() {
  const { ready, profile } = useFitness();

  return (
    <div className="mt-4 px-3">
      <p className="text-xs text-muted-foreground">Logged in as</p>
      {ready ? (
        <p className="text-sm font-medium text-foreground">{profile.name}</p>
      ) : (
        <Skeleton className="mt-1 h-4 w-28" />
      )}
    </div>
  );
}
