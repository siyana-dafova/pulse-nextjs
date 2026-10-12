"use client";

import { useState } from "react";
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
 * km/mi only changes the label. The distance number is not converted.
 */
export function SettingsScreen() {
  const { profile, updateProfile } = useFitness();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [weeklyGoal, setWeeklyGoal] = useState(String(profile.weeklyWorkoutGoal));
  const [units, setUnits] = useState<Units>(profile.units);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function markDirty() {
    setSaved(false);
    setError("");
  }

  function save() {
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

    updateProfile({
      name: nextName,
      email: nextEmail,
      weeklyWorkoutGoal: goal,
      units,
    });
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
            <Label>Units</Label>
            <div className="flex gap-2">
              {(["km", "mi"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={units === option ? "default" : "outline"}
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
    </div>
  );
}
