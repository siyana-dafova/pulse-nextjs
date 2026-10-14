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
import { localFitnessStore } from "@/lib/fitness-store";

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
};

const FitnessContext = createContext<FitnessContextValue | null>(null);

export function FitnessProvider({ children }: { children: ReactNode }) {
  // Empty until the store loads after mount. The server render has no access to it.
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState(() => ({ ...initialProfile }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Strict Mode mounts twice in dev. Only the latest load may write state.
    let cancelled = false;
    localFitnessStore.load(todayISO()).then((state) => {
      if (cancelled) return;
      setWorkouts(state.workouts);
      setGoals(state.goals);
      setProfile(state.profile);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<FitnessContextValue>(
    () => ({
      ready,
      workouts,
      goals,
      profile,
      // State changes only after the store accepts the write, and uses the record it returns.
      async addWorkout(input) {
        const workout = await localFitnessStore.addWorkout(input);
        setWorkouts((current) => [workout, ...current]);
      },
      async updateWorkout(id, input) {
        const workout = await localFitnessStore.updateWorkout(id, input);
        setWorkouts((current) =>
          current.map((item) => (item.id === id ? workout : item)),
        );
      },
      async deleteWorkout(id) {
        await localFitnessStore.deleteWorkout(id);
        setWorkouts((current) =>
          current.filter((workout) => workout.id !== id),
        );
      },
      async addGoal(input) {
        const goal = await localFitnessStore.addGoal(input);
        setGoals((current) => [...current, goal]);
      },
      async updateGoal(id, input) {
        const goal = await localFitnessStore.updateGoal(id, input);
        setGoals((current) =>
          current.map((item) => (item.id === id ? goal : item)),
        );
      },
      async deleteGoal(id) {
        await localFitnessStore.deleteGoal(id);
        setGoals((current) => current.filter((goal) => goal.id !== id));
      },
      async updateProfile(next) {
        setProfile(await localFitnessStore.updateProfile(next));
      },
    }),
    [goals, profile, ready, workouts],
  );

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
