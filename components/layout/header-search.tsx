"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const inputClass =
  "h-9 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Searches workouts through `/workouts?q=`.
 * On the workouts page the list filters while you type. Elsewhere Enter opens it with the query.
 */
export function HeaderSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const onWorkouts = pathname === "/workouts";
  const urlQuery = onWorkouts ? (searchParams.get("q") ?? "") : "";
  const [text, setText] = useState(urlQuery);
  const [focused, setFocused] = useState(false);
  const [seen, setSeen] = useState({ pathname, urlQuery });

  // The URL catches up a render after each key, so while typing it would overwrite newer text.
  // Only a page change, or a query change made elsewhere (Back, Clear filters), refills the field.
  if (seen.pathname !== pathname || seen.urlQuery !== urlQuery) {
    const external = seen.pathname !== pathname || !focused;
    setSeen({ pathname, urlQuery });
    if (external) setText(urlQuery);
  }

  function change(value: string) {
    setText(value);
    if (!onWorkouts) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value);
    else params.delete("q");
    const search = params.toString();
    // replaceState, not router.replace: no server round trip and no history entry per key.
    window.history.replaceState(
      null,
      "",
      search ? `/workouts?${search}` : "/workouts",
    );
  }

  return (
    <form
      role="search"
      className="relative ml-auto min-w-0 w-full max-w-xs flex-1 sm:flex-none"
      onSubmit={(event) => {
        event.preventDefault();
        if (onWorkouts) return;
        const query = text.trim();
        router.push(
          query ? `/workouts?q=${encodeURIComponent(query)}` : "/workouts",
        );
      }}
    >
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search workouts"
        aria-label="Search workouts"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") change("");
        }}
        className={inputClass}
      />
    </form>
  );
}

/** Same look while the query is not known yet, so the header does not jump. */
export function HeaderSearchFallback() {
  return (
    <div className="relative ml-auto min-w-0 w-full max-w-xs flex-1 sm:flex-none">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search workouts"
        aria-label="Search workouts"
        disabled
        className={inputClass}
      />
    </div>
  );
}
