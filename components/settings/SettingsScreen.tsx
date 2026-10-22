"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/fitness/confirm-dialog";
import { useFitness } from "@/components/fitness/fitness-context";
import { PageToolbar } from "@/components/fitness/page-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initials, type Units } from "@/lib/fitness-data";

/**
 * The draft stays local until Save. The header reads profile from context,
 * so the name there changes only after a successful save.
 * Distance is stored in kilometers and shown in the selected unit.
 */
export function SettingsScreen() {
  const { profile, updateProfile, resetDemo } = useFitness();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [weeklyGoal, setWeeklyGoal] = useState(
    String(profile.weeklyWorkoutGoal),
  );
  const [units, setUnits] = useState<Units>(profile.units);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  function markDirty() {
    setSaved(false);
    setError("");
  }

  async function save() {
    const nextName = name.trim();
    const nextEmail = email.trim();
    const goal = Number(weeklyGoal);

    if (!nextName) {
      setError("Enter your name.");
      setSaved(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
      setError("Enter a valid email.");
      setSaved(false);
      return;
    }
    if (!Number.isInteger(goal) || goal < 1 || goal > 14) {
      setError("Weekly workout goal must be a whole number from 1 to 14.");
      setSaved(false);
      return;
    }

    try {
      await updateProfile({
        name: nextName,
        email: nextEmail,
        weeklyWorkoutGoal: goal,
        units,
      });
    } catch {
      return;
    }
    setName(nextName);
    setEmail(nextEmail);
    setWeeklyGoal(String(goal));
    setError("");
    setSaved(true);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <PageToolbar description="Your profile and weekly goal." />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {initials(name)}
            </span>
            <p className="text-sm text-muted-foreground">Shown in the header</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                markDirty();
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                markDirty();
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="weekly-goal">Weekly workout goal</Label>
            <Input
              id="weekly-goal"
              type="number"
              min={1}
              max={14}
              step={1}
              value={weeklyGoal}
              onChange={(event) => {
                setWeeklyGoal(event.target.value);
                markDirty();
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label id="units-label">Units</Label>
            <div
              role="group"
              aria-labelledby="units-label"
              className="flex gap-2"
            >
              {(["km", "mi"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={units === option ? "default" : "outline"}
                  aria-pressed={units === option}
                  onClick={() => {
                    setUnits(option);
                    markDirty();
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save}>
          Save
        </Button>
        {saved ? <p className="text-sm text-success">Saved.</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Replace your workouts, goals, and profile with today&apos;s demo
            set. This stays in this browser.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setResetOpen(true)}
          >
            Reset demo data
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data"
        description="Replace your workouts, goals, and profile with today's demo set. This stays in this browser."
        confirmLabel="Reset"
        onOpenChange={setResetOpen}
        onConfirm={async () => {
          const state = await resetDemo();
          setName(state.profile.name);
          setEmail(state.profile.email);
          setWeeklyGoal(String(state.profile.weeklyWorkoutGoal));
          setUnits(state.profile.units);
          setError("");
          setSaved(false);
          setResetOpen(false);
        }}
      />
    </div>
  );
}
