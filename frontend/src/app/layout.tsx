import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexusData AI | Professional Data Intelligence",
  description: "Enterprise-grade AI for data cleaning, analysis, and visualization.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030303] text-zinc-100 selection:bg-blue-500/30`}>
        {/* Global Ambient Glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full opacity-30" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
