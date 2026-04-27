import type { Metadata, Viewport } from "next";
import { Bebas_Neue, JetBrains_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "FinTrack - Personal Finance Dashboard",
  description: "Track your finances, set budgets, and reach savings goals",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(
      bebasNeue.variable, 
      jetBrainsMono.variable, 
      dmSans.variable
    )}>
      <body className={cn("font-body bg-obsidian text-primary antialiased", dmSans.className)}>
        {children}
      </body>
    </html>
  );
}