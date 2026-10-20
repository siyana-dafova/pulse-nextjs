"use client";

/**
 * The only app state. It is loaded from the store after mount.
 * The layout keeps this mounted, so pages share it.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  initialProfile,
  todayISO,
  type Goal,
  type GoalInput,
  type Profile,
  type Workout,
  type WorkoutInput,
} from "@/lib/fitness-data";
import {
  GoalKindTakenError,
  localFitnessStore,
  saveFailureMessage,
  type FitnessState,
} from "@/lib/fitness-store";

type FitnessContextValue = {
  /** False until the store has loaded. Until then the arrays are empty and the profile is the default. */
  ready: boolean;
  workouts: Workout[];
  goals: Goal[];
  profile: Profile;
  addWorkout: (input: WorkoutInput) => Promise<void>;
  updateWorkout: (id: string, input: WorkoutInput) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  /** Rejects with `GoalKindTakenError` when a second workouts or minutes goal is added. */
  addGoal: (input: GoalInput) => Promise<void>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  /** Replaces workouts, goals, and profile with today's demo set. */
  resetDemo: () => Promise<FitnessState>;
  /** Set when a write to storage fails. Goal-kind conflicts stay on the form. */
  saveError: string | null;
  dismissSaveError: () => void;
};

const FitnessContext = createContext<FitnessContextValue | null>(null);

export function FitnessProvider({ children }: { children: ReactNode }) {
  // Empty until the store loads after mount. The server render has no access to it.
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState(() => ({ ...initialProfile }));
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // A storage event during the first load wins over that load's older snapshot.
  const generation = useRef(0);

  function apply(state: FitnessState) {
    setWorkouts(state.workouts);
    setGoals(state.goals);
    setProfile(state.profile);
  }

  useEffect(() => {
    // Strict Mode mounts twice in dev. Only the latest load may write state.
    let cancelled = false;
    const stamp = generation.current;
    localFitnessStore.load(todayISO()).then(
      (state) => {
        if (cancelled || stamp !== generation.current) return;
        apply(state);
        setReady(true);
      },
      (error: unknown) => {
        if (cancelled || stamp !== generation.current) return;
        setSaveError(saveFailureMessage(error));
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return localFitnessStore.subscribe((state) => {
      generation.current += 1;
      apply(state);
      setReady(true);
    });
  }, []);

  const value = useMemo<FitnessContextValue>(
    () => ({
      ready,
      workouts,
      goals,
      profile,
      saveError,
      dismissSaveError() {
        setSaveError(null);
      },
      // State changes only after the store accepts the write, and uses the record it returns.
      async addWorkout(input) {
        const workout = await commit(() => localFitnessStore.addWorkout(input));
        setWorkouts((current) => [workout, ...current]);
      },
      async updateWorkout(id, input) {
        const workout = await commit(() =>
          localFitnessStore.updateWorkout(id, input),
        );
        setWorkouts((current) =>
          current.map((item) => (item.id === id ? workout : item)),
        );
      },
      async deleteWorkout(id) {
        await commit(() => localFitnessStore.deleteWorkout(id));
        setWorkouts((current) =>
          current.filter((workout) => workout.id !== id),
        );
      },
      async addGoal(input) {
        const goal = await commit(() => localFitnessStore.addGoal(input));
        setGoals((current) => [...current, goal]);
      },
      async updateGoal(id, input) {
        const goal = await commit(() =>
          localFitnessStore.updateGoal(id, input),
        );
        setGoals((current) =>
          current.map((item) => (item.id === id ? goal : item)),
        );
      },
      async deleteGoal(id) {
        await commit(() => localFitnessStore.deleteGoal(id));
        setGoals((current) => current.filter((goal) => goal.id !== id));
      },
      async updateProfile(next) {
        setProfile(await commit(() => localFitnessStore.updateProfile(next)));
      },
      async resetDemo() {
        const state = await commit(() => localFitnessStore.reset(todayISO()));
        apply(state);
        return state;
      },
    }),
    [goals, profile, ready, saveError, workouts],
  );

  async function commit<T>(action: () => Promise<T>) {
    try {
      const result = await action();
      setSaveError(null);
      return result;
    } catch (error) {
      if (error instanceof GoalKindTakenError) throw error;
      setSaveError(saveFailureMessage(error));
      throw error;
    }
  }

  return (
    <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
  );
}

export function useFitness() {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error("useFitness must be used within FitnessProvider");
  }
  return context;
}
