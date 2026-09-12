import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EMBERKEEP — Turn Your To-Do List Into Your Legend",
  description: "A full-stack Life RPG where real tasks are Quests, your streak is an Ember to keep lit, and progress fuels your Character Sheet across five Disciplines.",
  keywords: ["Life RPG", "Productivity", "Gamified Habits", "Quest Log", "Character Sheet", "Emberkeep"],
  openGraph: {
    title: "EMBERKEEP — Life RPG",
    description: "Turn your to-do list into your legend. Level up attributes, maintain your streak, and earn gold.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-[#13131f] text-[#f5f1e8] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
