import type { Metadata } from "next";
import { SettingsScreen } from "@/components/settings/settings-screen";

// Thin page. The draft until Save lives in SettingsScreen.

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
