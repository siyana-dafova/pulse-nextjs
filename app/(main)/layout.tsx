import { FitnessProvider } from "@/components/fitness/fitness-context";
import { ReadyGate } from "@/components/fitness/ready-gate";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

/**
 * Shared shell for the five screens. The (main) group is not part of the URL.
 * The provider lives here so it survives page changes.
 * Only main scrolls, so the menu stays on screen.
 */
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <FitnessProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <ReadyGate>{children}</ReadyGate>
          </main>
        </div>
      </div>
    </FitnessProvider>
  );
}
