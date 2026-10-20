/**
 * Where the data lives. Screens and the provider only see `FitnessStore`.
 * Every method returns a Promise so an API-backed store can replace this one without touching callers.
 * Browser only: call it after mount, never during a server render.
 */

import {
  createSeedWorkouts,
  initialGoals,
  initialProfile,
  normalizeWorkout,
  type Goal,
  type GoalInput,
  type Profile,
  type Workout,
  type WorkoutInput,
} from "@/lib/fitness-data";

export type FitnessState = {
  version: typeof STORAGE_VERSION;
  workouts: Workout[];
  goals: Goal[];
  profile: Profile;
};

export type FitnessStore = {
  /** `today` is only used to build the demo seed when nothing is stored yet. */
  load(today: string): Promise<FitnessState>;
  reset(today: string): Promise<FitnessState>;
  addWorkout(input: WorkoutInput): Promise<Workout>;
  updateWorkout(id: string, input: WorkoutInput): Promise<Workout>;
  deleteWorkout(id: string): Promise<void>;
  addGoal(input: GoalInput): Promise<Goal>;
  updateGoal(id: string, input: GoalInput): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;
  updateProfile(profile: Profile): Promise<Profile>;
  /**
   * Other tabs of this browser. The tab that wrote does not get the event;
   * it already updated its own state from the method that wrote.
   */
  subscribe(onChange: (state: FitnessState) => void): () => void;
};

/** What to show when a write to localStorage throws. */
export function saveFailureMessage(error: unknown) {
  if (isQuotaError(error)) {
    return "This browser is out of space, so the change was not saved.";
  }
  return "The change was not saved. Try again.";
}

function isQuotaError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22)
  );
}

/** Error thrown when a goal kind is already taken. */
export class GoalKindTakenError extends Error {
  constructor(kind: GoalInput["kind"]) {
    super(`A ${kind} goal already exists.`);
    this.name = "GoalKindTakenError";
  }
}

/** Bump the version when the shape changes, and migrate the old value in `read`. */
const STORAGE_KEY = "pulse:v1";
const STORAGE_VERSION = 1;

function seedState(today: string): FitnessState {
  return {
    version: STORAGE_VERSION,
    workouts: createSeedWorkouts(today),
    goals: initialGoals.map((goal) => ({ ...goal })),
    profile: { ...initialProfile },
  };
}

/** Shape check only. Field-level validation belongs to a shared schema later. */
function isFitnessState(value: unknown): value is FitnessState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Partial<FitnessState>;
  return (
    state.version === STORAGE_VERSION &&
    Array.isArray(state.workouts) &&
    Array.isArray(state.goals) &&
    typeof state.profile === "object" &&
    state.profile !== null
  );
}

/** A missing, unreadable, or outdated value is `null`, and `load` falls back to the seed. */
function read(): FitnessState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw == null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isFitnessState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function write(state: FitnessState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function readLoaded() {
  const state = read();
  if (!state) throw new Error("Call load() before changing data.");
  return state;
}

/** Only one `workouts` goal and one `minutes` goal. Manual goals can repeat. */
function kindTaken(goals: Goal[], input: GoalInput, ignoreId?: string) {
  if (input.kind === "manual") return false;
  return goals.some((goal) => goal.kind === input.kind && goal.id !== ignoreId);
}

/** Local storage implementation of the FitnessStore. Keyed by STORAGE_KEY. */
export const localFitnessStore: FitnessStore = {
  async load(today) {
    const stored = read();
    if (stored) return stored;
    const seeded = seedState(today);
    write(seeded);
    return seeded;
  },

  async reset(today) {
    const seeded = seedState(today);
    write(seeded);
    return seeded;
  },

  async addWorkout(input) {
    const state = readLoaded();
    const workout: Workout = {
      id: crypto.randomUUID(),
      ...normalizeWorkout(input),
    };
    write({ ...state, workouts: [workout, ...state.workouts] });
    return workout;
  },

  async updateWorkout(id, input) {
    const state = readLoaded();
    if (!state.workouts.some((workout) => workout.id === id)) {
      throw new Error(`Workout ${id} not found.`);
    }
    const workout: Workout = { id, ...normalizeWorkout(input) };
    write({
      ...state,
      workouts: state.workouts.map((item) => (item.id === id ? workout : item)),
    });
    return workout;
  },

  async deleteWorkout(id) {
    const state = readLoaded();
    write({
      ...state,
      workouts: state.workouts.filter((workout) => workout.id !== id),
    });
  },

  async addGoal(input) {
    const state = readLoaded();
    if (kindTaken(state.goals, input)) throw new GoalKindTakenError(input.kind);
    const goal: Goal = {
      id: crypto.randomUUID(),
      label: input.label.trim(),
      target: input.target,
      current: input.kind === "manual" ? input.current : 0,
      kind: input.kind,
    };
    write({ ...state, goals: [...state.goals, goal] });
    return goal;
  },

  async updateGoal(id, input) {
    const state = readLoaded();
    const existing = state.goals.find((goal) => goal.id === id);
    if (!existing) throw new Error(`Goal ${id} not found.`);
    if (kindTaken(state.goals, input, id)) {
      throw new GoalKindTakenError(input.kind);
    }
    const goal: Goal = {
      ...existing,
      label: input.label.trim(),
      target: input.target,
      // Derived goals keep the previous current. The screen computes it from workouts.
      current: input.kind === "manual" ? input.current : existing.current,
      kind: input.kind,
    };
    write({
      ...state,
      goals: state.goals.map((item) => (item.id === id ? goal : item)),
    });
    return goal;
  },

  async deleteGoal(id) {
    const state = readLoaded();
    write({ ...state, goals: state.goals.filter((goal) => goal.id !== id) });
  },

  async updateProfile(next) {
    const state = readLoaded();
    const profile: Profile = {
      ...next,
      name: next.name.trim(),
      email: next.email.trim(),
      weeklyWorkoutGoal: Math.min(14, Math.max(1, next.weeklyWorkoutGoal)),
    };
    write({ ...state, profile });
    return profile;
  },

  subscribe(onChange) {
    function handle(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== STORAGE_KEY) return;
      const stored = read();
      // A missing or broken value is left alone. The next load rebuilds the demo set.
      if (stored) onChange(stored);
    }

    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  },
};
