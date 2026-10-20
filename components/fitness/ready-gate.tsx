"use client";

import type { ReactNode } from "react";
import { useFitness } from "@/components/fitness/fitness-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Screens mount only after the store loads.
 * They seed local drafts from context in useState, so mounting earlier would keep the defaults.
 */
export function ReadyGate({ children }: { children: ReactNode }) {
  const { ready, saveError, dismissSaveError } = useFitness();
  return (
    <>
      {saveError ? (
        <div
          role="alert"
          className="fixed top-4 left-1/2 z-60 flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 items-start gap-3 rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm text-destructive shadow-lg"
        >
          <p className="flex-1 pt-1">{saveError}</p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={dismissSaveError}
          >
            Dismiss
          </Button>
        </div>
      ) : null}
      {ready ? children : <ScreenSkeleton />}
    </>
  );
}

function ScreenSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
