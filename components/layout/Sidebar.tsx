import { LogOutIcon } from "lucide-react";
import { SidebarNav } from "@/components/layout/SidebarNav";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <span className="text-2xl font-bold text-primary">Pulse</span>
      </div>

      <SidebarNav />

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
          <LogOutIcon className="size-5 shrink-0" />
          <span>Logout</span>
        </div>
        <p className="px-3 pt-1 text-xs text-muted-foreground">
          Sign-in comes later.
        </p>
        <div className="mt-4 px-3">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-medium text-foreground">Siyana Dafova</p>
        </div>
      </div>
    </aside>
  );
}
