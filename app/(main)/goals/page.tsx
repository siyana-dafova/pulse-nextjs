import type { Metadata } from "next";
import { GoalsScreen } from "@/components/goals/GoalsScreen";

// Thin page. Daily and weekly calculations live in GoalsScreen.

export const metadata: Metadata = {
  title: "Goals",
};

export default function GoalsPage() {
  return <GoalsScreen />;
}
