import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeSync } from "@/components/theme/theme-sync";
import { themeScript } from "@/lib/theme";
import "./globals.css";

/** Wired to --font-sans in app/globals.css. */
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pulse",
    template: "%s · Pulse",
  },
  description: "Track your workouts, progress and daily goals.",
};

/** The script adds the dark class before React hydrates, so <html> differs from the server render. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
