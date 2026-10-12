"use client";

import { useFitness } from "@/components/fitness/fitness-context";

export function SidebarAccount() {
  const { profile } = useFitness();

  return (
    <div className="mt-4 px-3">
      <p className="text-xs text-muted-foreground">Logged in as</p>
      <p className="text-sm font-medium text-foreground">{profile.name}</p>
    </div>
  );
}
