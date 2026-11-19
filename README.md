# Pulse

This project is in development.

A workout journal in the browser. Log strength, cardio, and mobility sessions, track daily goals, and see the week in one place: workout count, minutes, streak, and progress toward the goal.

There is no server or account. Data stays in this browser (`localStorage`, key `pulse:v1`), so another browser or device does not see it. The first visit loads demo workouts, goals, and a profile built from today's date. Adds, edits, and deletes remain after a reload, and other open tabs pick them up. Settings can reset everything back to the demo set.

## Screens

| Path        | What you see                                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/`         | Dashboard: workouts and minutes this week, streak, daily goal, a chart by day, today's goals, last 5. A workout name opens it for editing |
| `/workouts` | Full list. Search by name, filter by type and status, add, edit, and delete                                                               |
| `/goals`    | Weekly totals and a card for each goal. Workout-count and minute goals are calculated from completed logs                                 |
| `/reports`  | Summary for this week or the last 4: completed, planned, skipped, and minutes by type                                                     |
| `/settings` | Name, email, weekly workout target (1–14), distance units (`km` or `mi`), theme, and a demo data reset                                    |

Search in the header filters the list while you are on `/workouts`. From any other screen, Enter opens `/workouts?q=...`.

The week starts on Monday. The weekly target in Settings is separate from the daily "Workouts" goal: one counts Monday–Sunday, the other counts today.

Distance is stored in kilometers and shown in the unit picked in Settings. The theme can be light, dark, or follow the system. It is saved separately (`pulse:theme`), so a demo reset keeps it.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Development server               |
| `npm run build`        | Production build                 |
| `npm run start`        | Serve the production build       |
| `npm run lint`         | ESLint                           |
| `npm run format`       | Format the project with Prettier |
| `npm run format:check` | Check formatting, write nothing  |
| `npm test`             | Vitest in watch mode             |
| `npx vitest run`       | Run the tests once               |

## Tests

Vitest covers the date helpers and the calculations in `lib/`: week boundaries, streaks, deltas, completion, and daily goals. Each test passes a fixed `today` instead of calling `todayISO()`, so the result does not depend on the day the tests run. ESLint blocks `todayISO` in `*.test.ts` files.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui on Base UI, Recharts.

## How the code is laid out

Pages in `app/(main)` only mount a screen. The math lives in `lib/fitness-stats.ts` and does not depend on React, so the dashboard, goals, and reports share the same numbers. State lives in `FitnessProvider` on the shared layout, so changing pages does not reset it.

```
app/(main)/          the five screens and the shared layout
components/          screens, dialogs, navigation
lib/fitness-data.ts  types, dates, seed data
lib/fitness-stats.ts week, streak, and report calculations
lib/fitness-store.ts read and write localStorage
lib/theme.ts         light, dark, or system theme
lib/*.test.ts        Vitest tests
```

Files are kebab-case and components are named exports, as in `components/ui`. Imports use the `@/` alias.
