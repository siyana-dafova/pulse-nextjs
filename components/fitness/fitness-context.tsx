"use client";

/**
 * The only app state. It lives in the tab's memory.
 * The layout keeps this mounted, so pages share it.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

type FitnessContextValue = {
  workouts: Workout[];
  goals: Goal[];
  profile: Profile;
  addWorkout: (input: WorkoutInput) => void;
  updateWorkout: (id: string, input: WorkoutInput) => void;
  deleteWorkout: (id: string) => void;
  addGoal: (input: GoalInput) => boolean;
  updateGoal: (id: string, input: GoalInput) => boolean;
  deleteGoal: (id: string) => void;
  updateProfile: (profile: Profile) => void;
};

const FitnessContext = createContext<FitnessContextValue | null>(null);

/** Only one `workouts` goal and one `minutes` goal. Manual goals can repeat. */
function kindTaken(goals: Goal[], input: GoalInput, ignoreId?: string) {
  if (input.kind === "manual") return false;
  return goals.some((goal) => goal.kind === input.kind && goal.id !== ignoreId);
}

export function FitnessProvider({ children }: { children: ReactNode }) {
  // Pass the function, not its result: React calls it once. Otherwise the seed rebuilds every render.
  const [workouts, setWorkouts] = useState(createSeedWorkouts);
  const [goals, setGoals] = useState(() =>
    initialGoals.map((goal) => ({ ...goal })),
  );
  const [profile, setProfile] = useState(() => ({ ...initialProfile }));

  const value = useMemo<FitnessContextValue>(
    () => ({
      workouts,
      goals,
      profile,
      addWorkout(input) {
        setWorkouts((current) => [
          { id: crypto.randomUUID(), ...normalizeWorkout(input) },
          ...current,
        ]);
      },
      updateWorkout(id, input) {
        setWorkouts((current) =>
          current.map((workout) =>
            workout.id === id ? { id, ...normalizeWorkout(input) } : workout,
          ),
        );
      },
      deleteWorkout(id) {
        setWorkouts((current) =>
          current.filter((workout) => workout.id !== id),
        );
      },
      addGoal(input) {
        if (kindTaken(goals, input)) return false;
        setGoals((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            label: input.label.trim(),
            target: input.target,
            current: input.kind === "manual" ? input.current : 0,
            kind: input.kind,
          },
        ]);
        return true;
      },
      updateGoal(id, input) {
        if (kindTaken(goals, input, id)) return false;
        setGoals((current) =>
          current.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  label: input.label.trim(),
                  target: input.target,
                  // Derived goals keep the previous current. The screen computes it from workouts.
                  current:
                    input.kind === "manual" ? input.current : goal.current,
                  kind: input.kind,
                }
              : goal,
          ),
        );
        return true;
      },
      deleteGoal(id) {
        setGoals((current) => current.filter((goal) => goal.id !== id));
      },
      updateProfile(next) {
        setProfile({
          ...next,
          name: next.name.trim(),
          email: next.email.trim(),
          // The form also checks 1–14. The clamp stays here if this is called from somewhere else.
          weeklyWorkoutGoal: Math.min(14, Math.max(1, next.weeklyWorkoutGoal)),
        });
      },
    }),
    [goals, profile, workouts],
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
