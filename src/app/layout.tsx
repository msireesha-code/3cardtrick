import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { stackEnabled, stackServerApp } from "@/lib/stack";
import TopNav from "@/components/TopNav";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PostHogProvider from "@/components/PostHogProvider";
import { Suspense } from "react";
import PostHogPageView from "@/components/PostHogPageView";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3S Stock Finder — AI-powered NSE/BSE Stock Picks",
  description: "Enter any Indian market sector and get the top 3 NSE/BSE stocks with smart allocation — generated live by AI.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const body = (
    <body className="min-h-full flex flex-col">
      <DisclaimerBanner />
      <TopNav />
      <Suspense>
        <PostHogPageView />
      </Suspense>
      {children}
    </body>
  );

  if (stackEnabled && stackServerApp) {
    const { StackProvider, StackTheme } = await import("@stackframe/stack");
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <PostHogProvider>
          <StackProvider app={stackServerApp}>
            <StackTheme>{body}</StackTheme>
          </StackProvider>
        </PostHogProvider>
      </html>
    );
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <PostHogProvider>
        {body}
      </PostHogProvider>
    </html>
  );
}
