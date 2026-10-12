import {
  ChartBarIcon,
  CogIcon,
  DumbbellIcon,
  HomeIcon,
  TargetIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const mainNavigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Workouts", href: "/workouts", icon: DumbbellIcon },
  { name: "Goals", href: "/goals", icon: TargetIcon },
  { name: "Reports", href: "/reports", icon: ChartBarIcon },
];

export const settingsNavigation: NavItem = {
  name: "Settings",
  href: "/settings",
  icon: CogIcon,
};

const pages = [...mainNavigation, settingsNavigation];

/** Header title. Exact match first, then a nested path. `/` does not match the other pages. */

export function titleForPath(pathname: string) {
  const exact = pages.find((item) => item.href === pathname);
  if (exact) return exact.name;

  const nested = pages.find(
    (item) => item.href !== "/" && pathname.startsWith(`${item.href}/`),
  );

  return nested?.name ?? "Pulse";
}
