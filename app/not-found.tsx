import type { Metadata } from "next";
import Link from "next/link";
import { mainNavigation } from "@/components/layout/navigation";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

const blurbs: Record<string, string> = {
  "/": "This week at a glance",
  "/workouts": "Sessions you have logged",
  "/goals": "Daily targets",
  "/reports": "How the weeks add up",
};

/** Quiet stand-in for the week chart, so the page still feels like Pulse. */
const bars = [
  "h-5 opacity-40",
  "h-8 opacity-60",
  "h-4 opacity-30",
  "h-11 opacity-80",
  "h-7 opacity-50",
  "h-14 opacity-100",
  "h-6 opacity-70",
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--accent),var(--background)_58%)]">
      <header className="relative flex h-16 items-center px-6 sm:px-10">
        <Link href="/" className="text-2xl font-bold text-primary">
          Pulse
        </Link>
      </header>

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-10 sm:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <div>
            <p className="text-7xl font-semibold tracking-tight text-primary sm:text-8xl">
              404
            </p>
            <div aria-hidden className="mt-6 flex h-14 items-end gap-1.5">
              {bars.map((bar) => (
                <span
                  key={bar}
                  className={`w-2.5 rounded-t-md bg-primary ${bar}`}
                />
              ))}
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
              Page not found
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
              This address is not part of Pulse. Go back to the dashboard, or
              choose a screen.
            </p>
            <Link
              href="/"
              className={buttonVariants({
                size: "lg",
                className: "mt-8 px-4",
              })}
            >
              Back to dashboard
            </Link>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {blurbs[item.href]}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}
