import type { Metadata } from "next";
import { ReportsScreen } from "@/components/reports/reports-screen";

// Thin page. The period and summary live in ReportsScreen.

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return <ReportsScreen />;
}
