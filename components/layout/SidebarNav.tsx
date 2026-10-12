"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  mainNavigation,
  settingsNavigation,
  type NavItem,
} from "@/components/layout/navigation";

/** `/` matches only itself. Otherwise the dashboard would stay active on every page. */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.name}</span>
    </Link>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <nav className="space-y-1">
        {mainNavigation.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
      <nav className="mt-auto space-y-1 pt-4">
        <NavLink item={settingsNavigation} pathname={pathname} />
      </nav>
    </div>
  );
}
