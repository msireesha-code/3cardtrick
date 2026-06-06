import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const clerkEnabled =
  (pk.startsWith("pk_live_") || pk.startsWith("pk_test_")) &&
  pk !== "pk_test_replace_me";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (clerkEnabled) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    return (
      <ClerkProvider>
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
          <body className="min-h-full flex flex-col">{children}</body>
        </html>
      </ClerkProvider>
    );
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
