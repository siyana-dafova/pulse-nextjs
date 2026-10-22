import type { Metadata } from "next";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";

// Thin page: the calculations live in DashboardScreen and lib/fitness-stats.ts.

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
