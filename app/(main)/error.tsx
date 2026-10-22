"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * `retry` re-fetches this segment. `reset` only clears the boundary.
 * The shell stays up, because this file does not wrap `app/(main)/layout.tsx`.
 */
export default function MainError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">This page could not be shown.</p>
        </div>
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
