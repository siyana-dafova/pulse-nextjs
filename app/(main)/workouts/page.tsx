import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkoutsScreen } from "@/components/workouts/WorkoutsScreen";

export const metadata: Metadata = {
  title: "Workouts",
};

/**
 * searchParams is a Promise here. openNew and editId are ready on the screen's first render.
 * The screen also watches the query, because the page stays mounted when only it changes.
 */
export default async function WorkoutsPage({
  searchParams,
}: PageProps<"/workouts">) {
  const query = await searchParams;
  const openNew = query.new === "1";
  const editId = typeof query.edit === "string" ? query.edit : null;

  return (
    /* useSearchParams() needs a nearby Suspense. With no fallback, the screen appears once the query is ready. */
    <Suspense>
      <WorkoutsScreen openNew={openNew} editId={editId} />
    </Suspense>
  );
}
