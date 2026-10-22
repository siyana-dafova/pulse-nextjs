import type { Metadata } from "next";
import { ReportsScreen } from "@/components/reports/ReportsScreen";

// Thin page. The period and summary live in ReportsScreen.

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return <ReportsScreen />;
}
