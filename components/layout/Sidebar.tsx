"use client";

import { useState } from "react";
import { LogOutIcon, MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarAccount } from "@/components/layout/SidebarAccount";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function SidebarPanel() {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-6 pr-12">
        <span className="text-2xl font-bold text-primary">Pulse</span>
      </div>

      <SidebarNav />

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
          <LogOutIcon className="size-5 shrink-0" />
          {/* No session. The control is part of the layout and does nothing. */}
          <span>Logout</span>
        </div>
        <p className="px-3 pt-1 text-xs text-muted-foreground">
          Sign-in comes later.
        </p>
        <SidebarAccount />
      </div>
    </>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <SidebarPanel />
    </aside>
  );
}

/** Same menu as the sidebar, opened from the header below the `md` breakpoint. */
export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(pathname);

  if (seen !== pathname) {
    setSeen(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) {
            setOpen(false);
          }
        }}
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Choose a screen.
        </SheetDescription>
        <SidebarPanel />
      </SheetContent>
    </Sheet>
  );
}
