import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { stackEnabled, stackServerApp } from "@/lib/stack";
import TopNav from "@/components/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3S Stock Finder",
  description: "Enter a market domain and get the top 3 stocks with a smart allocation strategy.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (stackEnabled && stackServerApp) {
    const { StackProvider, StackTheme } = await import("@stackframe/stack");
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <StackProvider app={stackServerApp}>
            <StackTheme>
              <TopNav />
              {children}
            </StackTheme>
          </StackProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
