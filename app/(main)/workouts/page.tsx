import { Suspense } from "react";
import { WorkoutsScreen } from "@/components/workouts/WorkoutsScreen";

/**
 * searchParams is a Promise here. openNew is ready on the screen's first render.
 * The screen also watches the query, because the page stays mounted when only ?new=1 changes.
 */
export default async function WorkoutsPage({
  searchParams,
}: PageProps<"/workouts">) {
  const query = await searchParams;
  const openNew = query.new === "1";

  return (
    /* useSearchParams() needs a nearby Suspense. With no fallback, the screen appears once the query is ready. */
    <Suspense>
      <WorkoutsScreen openNew={openNew} />
    </Suspense>
  );
}
